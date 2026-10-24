// Server gateway for the app and the ingestion job. It holds the database access, so neither
// caller needs the Supabase service role key.
// Callers authenticate with a token whose SHA-256 hash is in app_tokens (the app on Vercel), or a
// GitHub Actions OIDC token from the main branch of the project repository (the ingestion workflow).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const REPOSITORY = "nawalkhann/healthcare-knowledge-navigator";
const GITHUB_ISSUER = "https://token.actions.githubusercontent.com";
const AUDIENCE = "healthcare-knowledge-navigator";
const MAX_CHUNKS = 32;

const session = new Supabase.ai.Session("gte-small");
const githubKeys = createRemoteJWKSet(new URL(`${GITHUB_ISSUER}/.well-known/jwks`));
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

type Caller = "app" | "ingest";

const knownAppTokens = new Set<string>();

async function isAppToken(token: string): Promise<boolean> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (knownAppTokens.has(hash)) return true;
  const { data } = await db.from("app_tokens").select("name").eq("token_hash", hash).maybeSingle();
  if (data) knownAppTokens.add(hash);
  return Boolean(data);
}

async function authenticate(req: Request): Promise<Caller | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  if (!token.startsWith("ey") && (await isAppToken(token))) return "app";
  try {
    const { payload } = await jwtVerify(token, githubKeys, { issuer: GITHUB_ISSUER, audience: AUDIENCE });
    return payload.repository === REPOSITORY && payload.ref === "refs/heads/main" ? "ingest" : null;
  } catch {
    return null;
  }
}

async function embed(text: string): Promise<string> {
  const vector = (await session.run(text, { mean_pool: true, normalize: true })) as number[];
  return JSON.stringify(vector);
}

type ChunkInput = { section_path: string; content: string; token_count: number };

const actions: Record<string, (body: Record<string, unknown>) => Promise<unknown>> = {
  // Hybrid search, returning the matching chunks with their documents, best first.
  async search(body) {
    const query = String(body.query ?? "").slice(0, 1000);
    if (!query) throw new Error("query is required");
    const { data: hits, error } = await db.rpc("hybrid_search", {
      query_text: query,
      query_embedding: await embed(query),
      match_count: Math.min(Number(body.match_count) || 20, 50),
    });
    if (error) throw error;
    const scores = new Map<number, number>((hits as { chunk_id: number; score: number }[]).map((h) => [h.chunk_id, h.score]));
    if (scores.size === 0) return [];
    const { data: rows, error: rowsError } = await db
      .from("chunks")
      .select("id, section_path, content, documents(id, title, issuer, source_url, published_year, evidence_type, topic)")
      .in("id", [...scores.keys()]);
    if (rowsError) throw rowsError;
    return rows.map((row) => ({ ...row, score: scores.get(row.id) ?? 0 })).sort((a, b) => b.score - a.score);
  },

  async log(body) {
    const { error } = await db.from("query_logs").insert({
      question: String(body.question ?? "").slice(0, 1000),
      answer: typeof body.answer === "string" ? body.answer : null,
      confidence: String(body.confidence ?? ""),
      chunk_ids: Array.isArray(body.chunk_ids) ? body.chunk_ids.map(Number) : [],
      latency_ms: Number(body.latency_ms) || null,
    });
    if (error) throw error;
    return { ok: true };
  },

  // Upserts a document by source URL and removes its old chunks. Returns the document id.
  async upsert_document(body) {
    const d = body.document as Record<string, unknown>;
    const { data, error } = await db
      .from("documents")
      .upsert(
        {
          title: d.title,
          issuer: d.issuer,
          source_url: d.source_url,
          published_year: d.published_year,
          evidence_type: d.evidence_type,
          licence: d.licence,
          topic: d.topic,
        },
        { onConflict: "source_url" },
      )
      .select("id")
      .single();
    if (error) throw error;
    const { error: deleteError } = await db.from("chunks").delete().eq("document_id", data.id);
    if (deleteError) throw deleteError;
    return { id: data.id };
  },

  // Embeds and stores up to MAX_CHUNKS chunks for a document.
  async add_chunks(body) {
    const chunks = body.chunks as ChunkInput[];
    if (!Array.isArray(chunks) || chunks.length === 0 || chunks.length > MAX_CHUNKS) {
      throw new Error(`chunks must hold 1-${MAX_CHUNKS} items`);
    }
    const rows = [];
    for (const c of chunks) {
      // The section path is embedded with the text so headings help matching.
      rows.push({
        document_id: Number(body.document_id),
        section_path: c.section_path,
        content: c.content,
        token_count: c.token_count,
        embedding: await embed(`${c.section_path}\n\n${c.content}`),
      });
    }
    const { error } = await db.from("chunks").insert(rows);
    if (error) throw error;
    return { inserted: rows.length };
  },
};

const allowed: Record<Caller, string[]> = {
  app: ["search", "log"],
  ingest: ["search", "upsert_document", "add_chunks"],
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const caller = await authenticate(req);
  if (!caller) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const action = String(body?.action ?? "");
  if (!body || !allowed[caller].includes(action)) {
    return Response.json({ error: "Unknown or forbidden action" }, { status: 400 });
  }
  try {
    return Response.json(await actions[action](body));
  } catch (err) {
    console.error(action, err);
    return Response.json({ error: (err as Error).message ?? "failed" }, { status: 500 });
  }
});
