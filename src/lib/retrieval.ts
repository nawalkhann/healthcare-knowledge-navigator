import { embed } from "./embed";
import { supabaseAdmin } from "./supabase";

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
  const db = supabaseAdmin();
  const [queryEmbedding] = await embed([question]);
  const { data: hits, error } = await db.rpc("hybrid_search", {
    query_text: question,
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: matchCount,
  });
  if (error) throw error;
  const scores = new Map<number, number>((hits as { chunk_id: number; score: number }[]).map((h) => [h.chunk_id, h.score]));
  if (scores.size === 0) return [];

  const { data: rows, error: rowsError } = await db
    .from("chunks")
    .select("id, section_path, content, documents(id, title, issuer, source_url, published_year, evidence_type, topic)")
    .in("id", [...scores.keys()]);
  if (rowsError) throw rowsError;

  return (rows as unknown as ChunkRow[])
    .map((row) => ({
      id: row.id,
      score: scores.get(row.id) ?? 0,
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
    }))
    .sort((a, b) => b.score - a.score);
}
