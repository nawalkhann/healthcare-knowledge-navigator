export type ConfidenceLevel = "high" | "moderate" | "low";

export type EvidenceItem = {
  relevance: number; // rerank score, 0 to 3
  documentId: number;
  evidenceType: string;
  publishedYear: number | null;
};

export type Confidence = { level: ConfidenceLevel; score: number; reasons: string[] };

const EVIDENCE_WEIGHT: Record<string, number> = {
  guideline: 1,
  systematic_review: 0.9,
  rct: 0.7,
  observational: 0.5,
  other: 0.4,
};

// Combines four signals over the passages an answer cites into a 0-1 score.
// Weights: relevance 0.4, source agreement 0.2, evidence strength 0.25, recency 0.15.
export function scoreConfidence(cited: EvidenceItem[], currentYear = new Date().getFullYear()): Confidence {
  if (cited.length === 0) return { level: "low", score: 0, reasons: ["No passage supports an answer."] };

  const relevance = cited.reduce((sum, c) => sum + c.relevance, 0) / cited.length / 3;
  const documents = new Set(cited.map((c) => c.documentId)).size;
  const agreement = Math.min(documents, 3) / 3;
  const strength = Math.max(...cited.map((c) => EVIDENCE_WEIGHT[c.evidenceType] ?? 0.4));
  const years = cited.map((c) => c.publishedYear).filter((y): y is number => y !== null);
  const newest = years.length ? Math.max(...years) : null;
  const age = newest === null ? 10 : currentYear - newest;
  const recency = age <= 5 ? 1 : age <= 10 ? 0.6 : 0.3;

  const score = 0.4 * relevance + 0.2 * agreement + 0.25 * strength + 0.15 * recency;
  const level: ConfidenceLevel = score >= 0.75 ? "high" : score >= 0.55 ? "moderate" : "low";

  const reasons = [
    documents === 1 ? "Based on a single source." : `Supported by ${documents} independent sources.`,
    strength >= 0.9 ? "Includes a guideline or systematic review." : "No guideline or systematic review among the sources.",
    newest === null ? "Publication dates are unknown." : `Newest source is from ${newest}.`,
  ];
  if (relevance < 0.6) reasons.push("Sources only partly address the question.");
  return { level, score: Math.round(score * 100) / 100, reasons };
}
