import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isReusableLicence, parseHtmlPage, parsePmcArticle } from "../src/lib/ingest/parse";

describe("parsePmcArticle", () => {
  const doc = parsePmcArticle(readFileSync("tests/fixtures/pmc-article.xml", "utf8"));

  it("reads title, year and licence", () => {
    expect(doc.title).toBe("Sodium reduction and blood pressure: a systematic review");
    expect(doc.year).toBe(2023);
    expect(doc.licenceUrl).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("keeps nested section paths", () => {
    expect(doc.sections.map((s) => s.path.slice(1).join(" > "))).toEqual([
      "Abstract",
      "Methods",
      "Methods > Eligibility",
      "Results",
    ]);
    expect(doc.sections[3].paragraphs[0]).toBe("Systolic pressure fell by 5 mmHg [3].");
  });
});

describe("parseHtmlPage", () => {
  it("splits at h2 and h3 and drops navigation", () => {
    const html = `<html><body><nav><p>Menu</p></nav><main><h1>Sepsis care</h1><p>Intro.</p>
      <h2>Treatment</h2><p>Give antibiotics.</p><h3>Fluids</h3><ul><li>30 mL/kg</li></ul></main></body></html>`;
    const doc = parseHtmlPage(html, "fallback");
    expect(doc.title).toBe("Sepsis care");
    expect(doc.sections.map((s) => s.path.join(" > "))).toEqual([
      "Sepsis care",
      "Sepsis care > Treatment",
      "Sepsis care > Treatment > Fluids",
    ]);
    expect(doc.sections[2].paragraphs).toEqual(["30 mL/kg"]);
  });
});

describe("isReusableLicence", () => {
  it("accepts CC BY and CC0 only", () => {
    expect(isReusableLicence("https://creativecommons.org/licenses/by/4.0/")).toBe(true);
    expect(isReusableLicence("http://creativecommons.org/publicdomain/zero/1.0/")).toBe(true);
    expect(isReusableLicence("https://creativecommons.org/licenses/by-nc/4.0/")).toBe(false);
    expect(isReusableLicence(null)).toBe(false);
  });
});
