import { describe, expect, it } from "vitest";
import { scoreConfidence } from "../src/lib/answer/confidence";
import { checkCitations } from "../src/lib/answer/engine";
import { parseJson } from "../src/lib/answer/llm";
import { scrubIdentifiers } from "../src/lib/answer/scrub";
import { allowRequest } from "../src/lib/rate-limit";

describe("checkCitations", () => {
  it("drops uncited or out-of-range sentences and renumbers by first use", () => {
    const { sentences, usedPassages } = checkCitations(
      {
        insufficient: false,
        sentences: [
          { text: "Thiazides are first line [3].", citations: [3] },
          { text: "No citation here.", citations: [] },
          { text: "Invented source.", citations: [9] },
          { text: "ACE inhibitors also work.", citations: [1, 3] },
        ],
      },
      4,
    );
    expect(sentences).toEqual([
      { text: "Thiazides are first line.", citations: [1] },
      { text: "ACE inhibitors also work.", citations: [2, 1] },
    ]);
    expect(usedPassages).toEqual([3, 1]);
  });
});

describe("scoreConfidence", () => {
  const item = (over: Partial<Parameters<typeof scoreConfidence>[0][number]> = {}) => ({
    relevance: 3,
    documentId: 1,
    evidenceType: "guideline",
    publishedYear: 2024,
    ...over,
  });

  it("is high for recent, relevant guidelines from several sources", () => {
    const c = scoreConfidence([item(), item({ documentId: 2 }), item({ documentId: 3, evidenceType: "systematic_review" })], 2026);
    expect(c.level).toBe("high");
  });

  it("is low for one old, weakly relevant observational study", () => {
    const c = scoreConfidence([item({ relevance: 2, evidenceType: "observational", publishedYear: 2005 })], 2026);
    expect(c.level).toBe("low");
    expect(c.reasons).toContain("Based on a single source.");
  });

  it("is low with nothing cited", () => {
    expect(scoreConfidence([]).level).toBe("low");
  });
});

describe("scrubIdentifiers", () => {
  it("removes names, dates, record numbers, emails and phones", () => {
    const out = scrubIdentifiers("Mr John Smith DOB 03/04/1956 MRN 1234567, call 555-123-4567 or js@x.org");
    expect(out).toBe("[name] DOB [date] [id], call [phone] or [email]");
  });

  it("leaves clinical numbers alone", () => {
    expect(scrubIdentifiers("BP 150/95 on 10 mg amlodipine")).toBe("BP 150/95 on 10 mg amlodipine");
  });
});

describe("parseJson", () => {
  it("reads fenced JSON", () => {
    expect(parseJson<{ a: number }>('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  });
});

describe("allowRequest", () => {
  it("blocks after the limit within a window", () => {
    expect(allowRequest("t", 2, 1000, 0)).toBe(true);
    expect(allowRequest("t", 2, 1000, 10)).toBe(true);
    expect(allowRequest("t", 2, 1000, 20)).toBe(false);
    expect(allowRequest("t", 2, 1000, 1000)).toBe(true);
  });
});

describe("serviceKeyProblem", () => {
  const jwt = (role: string) => `x.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.y`;
  it("accepts service_role and secret keys", async () => {
    const { serviceKeyProblem } = await import("../src/lib/supabase");
    expect(serviceKeyProblem(jwt("service_role"))).toBeNull();
    expect(serviceKeyProblem("sb_secret_abc")).toBeNull();
  });
  it("names the public key that was used instead", async () => {
    const { serviceKeyProblem } = await import("../src/lib/supabase");
    expect(serviceKeyProblem(jwt("anon"))).toContain('"anon" key');
    expect(serviceKeyProblem("sb_publishable_abc")).toContain("publishable");
  });
});
