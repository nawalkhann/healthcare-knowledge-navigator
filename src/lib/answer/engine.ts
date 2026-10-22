import { searchChunks, type RetrievedChunk } from "../retrieval";
import { scoreConfidence, type Confidence } from "./confidence";
import { completeJson, type ChatMessage } from "./llm";

const RERANK_KEEP = 8;
const MIN_RELEVANCE = 2; // rerank scale 0-3; below this a passage is not used

export type Citation = {
  number: number;
  chunkId: number;
  title: string;
  issuer: string;
  sourceUrl: string;
  publishedYear: number | null;
  sectionPath: string;
  excerpt: string;
};

export type AnswerResult =
  | { status: "answered"; sentences: { text: string; citations: number[] }[]; citations: Citation[]; confidence: Confidence; chunkIds: number[] }
  | { status: "declined"; reason: string; closestSources: Citation[]; chunkIds: number[] };

type Ranked = RetrievedChunk & { relevance: number };

const passageText = (c: RetrievedChunk, n: number) =>
  `[${n}] ${c.document.title} (${c.document.issuer}${c.document.publishedYear ? `, ${c.document.publishedYear}` : ""})\nSection: ${c.sectionPath}\n${c.content}`;

async function rerank(question: string, chunks: RetrievedChunk[]): Promise<Ranked[]> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You rate how well each passage helps answer a clinical question. Score 0 = unrelated, 1 = same topic but does not answer, 2 = partly answers, 3 = directly answers. " +
        'Reply with JSON only: {"scores": [<one integer per passage, in order>]}',
    },
    {
      role: "user",
      content: `Question: ${question}\n\nPassages:\n\n${chunks.map((c, i) => passageText(c, i + 1)).join("\n\n---\n\n")}`,
    },
  ];
  const { scores } = await completeJson<{ scores: number[] }>(messages, 300);
  return chunks
    .map((c, i) => ({ ...c, relevance: Math.max(0, Math.min(3, Number(scores?.[i]) || 0)) }))
    .sort((a, b) => b.relevance - a.relevance || b.score - a.score);
}

type Draft = { insufficient: boolean; sentences: { text: string; citations: number[] }[] };

async function draftAnswer(question: string, passages: Ranked[]): Promise<Draft> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: [
        "You answer clinical questions for healthcare professionals using ONLY the numbered passages provided.",
        "Rules:",
        "- Every sentence must cite at least one passage number that directly supports it.",
        "- Do not add facts, doses or recommendations that are not in the passages.",
        "- Prefer guidelines and systematic reviews; note disagreement between sources.",
        "- Write 2 to 6 concise sentences. Do not give advice about a specific patient.",
        "- If the passages do not answer the question, set insufficient to true and return no sentences.",
        'Reply with JSON only: {"insufficient": boolean, "sentences": [{"text": string, "citations": [number]}]}',
      ].join("\n"),
    },
    {
      role: "user",
      content: `Question: ${question}\n\nPassages:\n\n${passages.map((c, i) => passageText(c, i + 1)).join("\n\n---\n\n")}`,
    },
  ];
  return completeJson<Draft>(messages, 900);
}

// Keeps only sentences whose citations all point at real passages; renumbers citations in order of use.
export function checkCitations(draft: Draft, passageCount: number) {
  const order: number[] = [];
  const sentences = (draft.sentences ?? [])
    .map((s) => ({
      text: String(s.text ?? "").replace(/\s*\[\d+(?:,\s*\d+)*\]/g, "").trim(),
      citations: [...new Set((s.citations ?? []).map(Number))],
    }))
    .filter((s) => s.text && s.citations.length > 0 && s.citations.every((n) => Number.isInteger(n) && n >= 1 && n <= passageCount))
    .map((s) => ({
      text: s.text,
      citations: s.citations.map((n) => {
        if (!order.includes(n)) order.push(n);
        return order.indexOf(n) + 1;
      }),
    }));
  return { sentences, usedPassages: order };
}

const toCitation = (c: RetrievedChunk, number: number): Citation => ({
  number,
  chunkId: c.id,
  title: c.document.title,
  issuer: c.document.issuer,
  sourceUrl: c.document.sourceUrl,
  publishedYear: c.document.publishedYear,
  sectionPath: c.sectionPath,
  excerpt: c.content.length > 400 ? `${c.content.slice(0, 400)}…` : c.content,
});

export async function answerQuestion(question: string): Promise<AnswerResult> {
  const retrieved = await searchChunks(question, 20);
  if (retrieved.length === 0) {
    return { status: "declined", reason: "No sources in the library match this question.", closestSources: [], chunkIds: [] };
  }

  const ranked = await rerank(question, retrieved);
  const passages = ranked.filter((c) => c.relevance >= MIN_RELEVANCE).slice(0, RERANK_KEEP);
  const closest = ranked.slice(0, 3).map((c, i) => toCitation(c, i + 1));
  if (passages.length === 0) {
    return {
      status: "declined",
      reason: "The library does not contain evidence that answers this question.",
      closestSources: closest,
      chunkIds: ranked.slice(0, 3).map((c) => c.id),
    };
  }

  const draft = await draftAnswer(question, passages);
  const { sentences, usedPassages } = checkCitations(draft, passages.length);
  if (draft.insufficient || sentences.length === 0) {
    return {
      status: "declined",
      reason: "The available sources do not support a reliable answer.",
      closestSources: closest,
      chunkIds: passages.map((c) => c.id),
    };
  }

  const cited = usedPassages.map((n) => passages[n - 1]);
  const confidence = scoreConfidence(
    cited.map((c) => ({
      relevance: c.relevance,
      documentId: c.document.id,
      evidenceType: c.document.evidenceType,
      publishedYear: c.document.publishedYear,
    })),
  );
  return {
    status: "answered",
    sentences,
    citations: cited.map((c, i) => toCitation(c, i + 1)),
    confidence,
    chunkIds: cited.map((c) => c.id),
  };
}
