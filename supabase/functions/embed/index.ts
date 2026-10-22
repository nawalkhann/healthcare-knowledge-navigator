// Embeds text with the built-in gte-small model (384 dimensions).
// Called by the ingestion job and the app server with the service role key.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const session = new Supabase.ai.Session("gte-small");
const MAX_INPUTS = 64;
const verifiedKeys = new Set<string>();

// Accepts the legacy service_role key, or a new sb_secret_ key confirmed against the admin API.
async function isServerKey(token: string): Promise<boolean> {
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || verifiedKeys.has(token)) return true;
  if (!token.startsWith("sb_secret_")) return false;
  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users?per_page=1`, {
    headers: { apikey: token, Authorization: `Bearer ${token}` },
  });
  await res.body?.cancel();
  if (res.ok) verifiedKeys.add(token);
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token || !(await isServerKey(token))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { input } = await req.json().catch(() => ({}));
  const texts: unknown[] = Array.isArray(input) ? input : [input];
  if (texts.length === 0 || texts.length > MAX_INPUTS || !texts.every((t) => typeof t === "string" && t.length > 0)) {
    return Response.json({ error: `input must be 1-${MAX_INPUTS} non-empty strings` }, { status: 400 });
  }

  const embeddings: number[][] = [];
  for (const text of texts as string[]) {
    embeddings.push((await session.run(text, { mean_pool: true, normalize: true })) as number[]);
  }
  return Response.json({ embeddings });
});
