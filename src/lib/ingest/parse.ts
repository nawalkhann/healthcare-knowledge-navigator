import * as cheerio from "cheerio";
import type { Section } from "./chunk";

export type ParsedDocument = {
  title: string;
  year: number | null;
  licenceUrl: string | null;
  sections: Section[];
};

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

// Parses a PubMed Central JATS XML article into titled sections of paragraphs.
export function parsePmcArticle(xml: string): ParsedDocument {
  const $ = cheerio.load(xml, { xml: true });
  const title = clean($("article-meta title-group article-title").first().text());
  const yearText = $("article-meta pub-date year").first().text();
  const licence = $("article-meta permissions license").first();
  const licenceUrl =
    licence.attr("xlink:href") ??
    licence.find("ext-link").attr("xlink:href") ??
    $("article-meta permissions ali\\:license_ref").first().text().trim() ??
    null;

  const sections: Section[] = [];
  const abstract = $("article-meta abstract").first();
  if (abstract.length) {
    const paragraphs = abstract.find("p").map((_, p) => clean($(p).text())).get();
    sections.push({ path: [title, "Abstract"], paragraphs });
  }

  const walk = (sec: ReturnType<typeof $>, path: string[]) => {
    const heading = clean(sec.children("title").first().text()) || "Untitled section";
    const here = [...path, heading];
    const paragraphs = sec.children("p").map((_, p) => clean($(p).text())).get();
    if (paragraphs.length) sections.push({ path: here, paragraphs });
    sec.children("sec").each((_, child) => walk($(child), here));
  };
  $("body").children("sec").each((_, sec) => walk($(sec), [title]));

  return { title, year: yearText ? Number(yearText) : null, licenceUrl: licenceUrl || null, sections };
}

// Parses an HTML guidance page into sections split at h2/h3 headings.
export function parseHtmlPage(html: string, fallbackTitle: string): ParsedDocument {
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, aside, form, noscript").remove();
  const root = $("main").first().length ? $("main").first() : $("body");
  const title = clean($("h1").first().text()) || fallbackTitle;

  const sections: Section[] = [];
  let current: Section = { path: [title], paragraphs: [] };
  let h2 = "";
  root.find("h2, h3, p, li").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = clean($(el).text());
    if (!text) return;
    if (tag === "h2" || tag === "h3") {
      if (current.paragraphs.length) sections.push(current);
      if (tag === "h2") h2 = text;
      current = { path: tag === "h2" ? [title, text] : [title, h2, text].filter(Boolean), paragraphs: [] };
    } else if (!(tag === "p" && $(el).closest("li").length)) {
      current.paragraphs.push(text);
    }
  });
  if (current.paragraphs.length) sections.push(current);

  const yearMatch = $('meta[name="cdc:last_updated"], meta[name="citation_publication_date"], meta[property="article:modified_time"]')
    .first()
    .attr("content")
    ?.match(/\d{4}/);
  return { title, year: yearMatch ? Number(yearMatch[0]) : null, licenceUrl: null, sections };
}

// Only CC BY and CC0 articles can be republished in answers with attribution.
export function isReusableLicence(url: string | null): boolean {
  if (!url) return false;
  return /creativecommons\.org\/licenses\/by\/|creativecommons\.org\/publicdomain\/zero\//i.test(url);
}
