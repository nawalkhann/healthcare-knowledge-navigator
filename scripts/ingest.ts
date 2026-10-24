// Fetches the sources in data/sources.json, chunks them, and stores them through the navigator gateway,
// which embeds each chunk and writes it to Supabase.
// Re-running is safe: each document is upserted by URL and its chunks are replaced.
// Usage: npx tsx scripts/ingest.ts [--topic hypertension] [--dry-run]
import { readFileSync } from "node:fs";
import { chunkSections } from "../src/lib/ingest/chunk";
import { isReusableLicence, parseHtmlPage, parsePmcArticle, type ParsedDocument } from "../src/lib/ingest/parse";

type PmcQuery = { topic: string; term: string; max: number };
type Page = { topic: string; issuer: string; url: string };
type DocInput = ParsedDocument & {
  topic: string;
  issuer: string;
  sourceUrl: string;
  evidenceType: string;
  licence: string;
};

const CHUNK_BATCH = 4; // chunks embedded per gateway call; larger batches hit the function's compute limit
const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyTopic = args.includes("--topic") ? args[args.indexOf("--topic") + 1] : null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "HealthcareKnowledgeNavigator/0.1 (ingestion)" } });
    if (res.ok) return res.text();
    if (attempt >= 3 || res.status < 500) throw new Error(`${res.status} for ${url}`);
    await sleep(1000 * attempt);
  }
}

function evidenceTypeFromTitle(title: string): string {
  if (/guideline|recommendation|consensus/i.test(title)) return "guideline";
  if (/systematic review|meta-analysis|umbrella review/i.test(title)) return "systematic_review";
  if (/randomi[sz]ed/i.test(title)) return "rct";
  return "other";
}

async function pmcDocuments(query: PmcQuery): Promise<DocInput[]> {
  const term = `(${query.term}) AND "open access"[filter]`;
  const search = JSON.parse(
    await get(`${EUTILS}/esearch.fcgi?db=pmc&retmode=json&sort=relevance&retmax=${query.max * 2}&term=${encodeURIComponent(term)}`),
  ) as { esearchresult: { idlist: string[] } };

  const docs: DocInput[] = [];
  for (const id of search.esearchresult.idlist) {
    if (docs.length >= query.max) break;
    await sleep(400); // NCBI allows 3 requests per second without an API key
    let parsed: ParsedDocument;
    try {
      parsed = parsePmcArticle(await get(`${EUTILS}/efetch.fcgi?db=pmc&id=${id}`));
    } catch (err) {
      console.warn(`  skip PMC${id}: ${(err as Error).message}`);
      continue;
    }
    if (!isReusableLicence(parsed.licenceUrl)) continue;
    if (parsed.sections.length === 0 || !parsed.title) continue;
    docs.push({
      ...parsed,
      topic: query.topic,
      issuer: "PubMed Central",
      sourceUrl: `https://pmc.ncbi.nlm.nih.gov/articles/PMC${id}/`,
      evidenceType: evidenceTypeFromTitle(parsed.title),
      licence: parsed.licenceUrl!,
    });
  }
  return docs;
}

async function pageDocument(page: Page): Promise<DocInput> {
  const parsed = parseHtmlPage(await get(page.url), page.url);
  return {
    ...parsed,
    topic: page.topic,
    issuer: page.issuer,
    sourceUrl: page.url,
    evidenceType: "guideline",
    licence: page.issuer === "CDC" ? "US federal government work (public domain)" : "See source",
  };
}

async function store(doc: DocInput) {
  const chunks = chunkSections(doc.sections);
  if (dryRun) {
    console.log(`  [dry run] ${doc.title.slice(0, 80)}: ${chunks.length} chunks`);
    return chunks.length;
  }
  const { callNavigator } = await import("../src/lib/navigator");
  const { id } = await callNavigator<{ id: number }>("upsert_document", {
    document: {
      title: doc.title,
      issuer: doc.issuer,
      source_url: doc.sourceUrl,
      published_year: doc.year,
      evidence_type: doc.evidenceType,
      licence: doc.licence,
      topic: doc.topic,
    },
  });
  for (let i = 0; i < chunks.length; i += CHUNK_BATCH) {
    const batch = chunks
      .slice(i, i + CHUNK_BATCH)
      .map((c) => ({ section_path: c.sectionPath, content: c.content, token_count: c.tokenCount }));
    for (let attempt = 1; ; attempt++) {
      try {
        await callNavigator("add_chunks", { document_id: id, chunks: batch });
        break;
      } catch (err) {
        if (attempt >= 4) throw err;
        await sleep(2000 * attempt);
      }
    }
  }
  return chunks.length;
}

async function main() {
  const sources = JSON.parse(readFileSync("data/sources.json", "utf8")) as { pmcQueries: PmcQuery[]; pages: Page[] };
  let docCount = 0;
  let chunkCount = 0;
  const failures: string[] = [];

  const ingest = async (label: string, load: () => Promise<DocInput[]>) => {
    try {
      for (const doc of await load()) {
        chunkCount += await store(doc);
        docCount++;
      }
    } catch (err) {
      failures.push(`${label}: ${(err as Error).message}`);
    }
  };

  for (const page of sources.pages.filter((p) => !onlyTopic || p.topic === onlyTopic)) {
    console.log(`page ${page.url}`);
    await ingest(page.url, async () => [await pageDocument(page)]);
  }
  for (const query of sources.pmcQueries.filter((q) => !onlyTopic || q.topic === onlyTopic)) {
    console.log(`PMC ${query.topic}`);
    await ingest(`PMC ${query.topic}`, () => pmcDocuments(query));
  }

  console.log(`\n${docCount} documents, ${chunkCount} chunks${dryRun ? " (dry run)" : ""}`);
  if (failures.length) {
    console.log(`${failures.length} failures:\n  ${failures.join("\n  ")}`);
    if (docCount === 0) process.exit(1);
  }
}

main();
