export type Section = { path: string[]; paragraphs: string[] };
export type Chunk = { sectionPath: string; content: string; tokenCount: number };

// gte-small reads at most 512 tokens, so chunks stay under that with room for the section path.
export const MAX_TOKENS = 400;
const OVERLAP_MAX_TOKENS = 80;

export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.3);
}

function splitLongParagraph(paragraph: string): string[] {
  if (estimateTokens(paragraph) <= MAX_TOKENS) return [paragraph];
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (current && estimateTokens(next) > MAX_TOKENS) {
      parts.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  // A single sentence longer than the limit is cut by words.
  return parts.flatMap((part) => {
    if (estimateTokens(part) <= MAX_TOKENS) return [part];
    const words = part.split(/\s+/);
    const size = Math.floor(MAX_TOKENS / 1.3);
    const pieces: string[] = [];
    for (let i = 0; i < words.length; i += size) pieces.push(words.slice(i, i + size).join(" "));
    return pieces;
  });
}

// Packs each section's paragraphs into chunks, never crossing a section boundary.
// A short final paragraph is repeated at the start of the next chunk for context.
export function chunkSections(sections: Section[]): Chunk[] {
  const chunks: Chunk[] = [];
  for (const section of sections) {
    const sectionPath = section.path.join(" > ");
    const paragraphs = section.paragraphs
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 0)
      .flatMap(splitLongParagraph);

    let current: string[] = [];
    const flush = () => {
      if (current.length === 0) return;
      const content = current.join("\n\n");
      chunks.push({ sectionPath, content, tokenCount: estimateTokens(content) });
    };

    for (const paragraph of paragraphs) {
      const candidate = [...current, paragraph].join("\n\n");
      if (current.length > 0 && estimateTokens(candidate) > MAX_TOKENS) {
        flush();
        const last = current[current.length - 1];
        const carry = estimateTokens(last) <= OVERLAP_MAX_TOKENS &&
          estimateTokens(`${last}\n\n${paragraph}`) <= MAX_TOKENS;
        current = carry ? [last, paragraph] : [paragraph];
      } else {
        current.push(paragraph);
      }
    }
    flush();
  }
  return chunks;
}
