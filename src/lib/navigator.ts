// Client for the `navigator` Supabase Edge Function, which holds all database access.
// The app authenticates with NAVIGATOR_TOKEN. In GitHub Actions the ingestion job uses the
// workflow's OIDC token instead, so no database key is stored anywhere outside Supabase.
const AUDIENCE = "healthcare-knowledge-navigator";
let githubToken: { value: string; expires: number } | null = null;

async function token(): Promise<string> {
  if (process.env.NAVIGATOR_TOKEN) return process.env.NAVIGATOR_TOKEN;
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !requestToken) throw new Error("Set NAVIGATOR_TOKEN, or run in GitHub Actions with id-token: write");
  if (githubToken && githubToken.expires > Date.now()) return githubToken.value;
  const res = await fetch(`${url}&audience=${AUDIENCE}`, { headers: { Authorization: `Bearer ${requestToken}` } });
  if (!res.ok) throw new Error(`GitHub OIDC token request failed: ${res.status}`);
  const { value } = (await res.json()) as { value: string };
  githubToken = { value, expires: Date.now() + 4 * 60_000 }; // tokens last 5 minutes
  return value;
}

export async function callNavigator<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const base = process.env.SUPABASE_URL;
  if (!base) throw new Error("Missing environment variable SUPABASE_URL");
  const res = await fetch(`${base}/functions/v1/navigator`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`navigator ${action} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}
