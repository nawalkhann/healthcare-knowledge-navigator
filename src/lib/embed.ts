import { serviceRoleKey } from "./supabase";

const BATCH_SIZE = 32;

// Embeds texts with gte-small through the `embed` Supabase Edge Function.
export async function embed(texts: string[]): Promise<number[][]> {
  const url = `${process.env.SUPABASE_URL}/functions/v1/embed`;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: texts.slice(i, i + BATCH_SIZE) }),
    });
    if (!res.ok) throw new Error(`embed failed: ${res.status} ${await res.text()}`);
    const { embeddings } = (await res.json()) as { embeddings: number[][] };
    out.push(...embeddings);
  }
  return out;
}
