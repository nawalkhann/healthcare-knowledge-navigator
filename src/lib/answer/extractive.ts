// Answers without a language model by quoting the source sentences that best match the question.
// Used when no LLM is configured. Every sentence is verbatim from a cited passage.
import type { RetrievedChunk } from "../retrieval";

const STOPWORDS = new Set(
  "a an and are as at be by can do does for from has have how i in is it its of on or should that the their them there these this to was what when where which who why will with without you your".split(
    " ",
  ),
);
const MAX_SENTENCES = 4;
const MAX_PER_PASSAGE = 2;
const MIN_OVERLAP = 0.34;

export type ExtractedSentence = { text: string; passage: number; overlap: number };

const stem = (word: string) => word.replace(/(ies|es|s|ing|ed)$/, "");

export function terms(text: string): Set<string> {
  return new Set(
    (text.toLowerCase().match(/[a-z0-9][a-z0-9-]+/g) ?? []).filter((w) => w.length > 2 && !STOPWORDS.has(w)).map(stem),
  );
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 400 && /[.!?]$/.test(s));
}

// Picks up to four sentences from the passages, each sharing at least a third of the question's terms.
export function extractSentences(question: string, passages: RetrievedChunk[]): ExtractedSentence[] {
  const wanted = terms(question);
  if (wanted.size === 0) return [];
  const candidates = passages.flatMap((p, passage) =>
    splitSentences(p.content).map((text) => {
      const found = terms(text);
      const overlap = [...wanted].filter((t) => found.has(t)).length / wanted.size;
      return { text, passage, overlap };
    }),
  );
  const perPassage = new Map<number, number>();
  const seen = new Set<string>();
  const picked: ExtractedSentence[] = [];
  for (const c of candidates.sort((a, b) => b.overlap - a.overlap || a.passage - b.passage)) {
    if (c.overlap < MIN_OVERLAP || picked.length >= MAX_SENTENCES) break;
    const key = c.text.toLowerCase();
    if (seen.has(key) || (perPassage.get(c.passage) ?? 0) >= MAX_PER_PASSAGE) continue;
    seen.add(key);
    perPassage.set(c.passage, (perPassage.get(c.passage) ?? 0) + 1);
    picked.push(c);
  }
  return picked;
}

// Maps term overlap onto the 0-3 relevance scale the confidence score uses.
export const overlapRelevance = (overlap: number) => (overlap >= 0.75 ? 3 : overlap >= 0.5 ? 2 : overlap >= MIN_OVERLAP ? 1 : 0);
