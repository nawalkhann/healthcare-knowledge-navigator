import { callNavigator } from "./navigator";

export type RetrievedChunk = {
  id: number;
  score: number;
  sectionPath: string;
  content: string;
  document: {
    id: number;
    title: string;
    issuer: string;
    sourceUrl: string;
    publishedYear: number | null;
    evidenceType: string;
    topic: string;
  };
};

type ChunkRow = {
  id: number;
  score: number;
  section_path: string;
  content: string;
  documents: {
    id: number;
    title: string;
    issuer: string;
    source_url: string;
    published_year: number | null;
    evidence_type: string;
    topic: string;
  };
};

// Hybrid search (vector + full text, fused by rank) over the source library.
export async function searchChunks(question: string, matchCount = 20): Promise<RetrievedChunk[]> {
  const rows = await callNavigator<ChunkRow[]>("search", { query: question, match_count: matchCount });
  return rows.map((row) => ({
    id: row.id,
    score: row.score,
    sectionPath: row.section_path,
    content: row.content,
    document: {
      id: row.documents.id,
      title: row.documents.title,
      issuer: row.documents.issuer,
      sourceUrl: row.documents.source_url,
      publishedYear: row.documents.published_year,
      evidenceType: row.documents.evidence_type,
      topic: row.documents.topic,
    },
  }));
}
