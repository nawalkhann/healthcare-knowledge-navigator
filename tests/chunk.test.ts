import { describe, expect, it } from "vitest";
import { chunkSections, estimateTokens, MAX_TOKENS } from "../src/lib/ingest/chunk";

const words = (n: number, word = "word") => Array.from({ length: n }, () => word).join(" ");

describe("chunkSections", () => {
  it("keeps a small section in one chunk with its path", () => {
    const chunks = chunkSections([{ path: ["Doc", "Results"], paragraphs: ["One.", "Two."] }]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].sectionPath).toBe("Doc > Results");
    expect(chunks[0].content).toBe("One.\n\nTwo.");
  });

  it("never crosses section boundaries", () => {
    const chunks = chunkSections([
      { path: ["A"], paragraphs: ["a"] },
      { path: ["B"], paragraphs: ["b"] },
    ]);
    expect(chunks.map((c) => c.sectionPath)).toEqual(["A", "B"]);
  });

  it("keeps every chunk under the token limit", () => {
    const paragraphs = Array.from({ length: 12 }, () => words(120));
    const chunks = chunkSections([{ path: ["Long"], paragraphs: [...paragraphs, words(900)] }]);
    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks) expect(estimateTokens(chunk.content)).toBeLessThanOrEqual(MAX_TOKENS);
  });

  it("carries a short paragraph over as overlap", () => {
    const chunks = chunkSections([{ path: ["S"], paragraphs: [words(250, "a"), "Short bridge.", words(250, "b")] }]);
    expect(chunks).toHaveLength(2);
    expect(chunks[1].content.startsWith("Short bridge.")).toBe(true);
  });
});
