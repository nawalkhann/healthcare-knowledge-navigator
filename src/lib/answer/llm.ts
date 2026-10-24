// Minimal client for any OpenAI-compatible chat completions API.
// Provider is chosen by LLM_BASE_URL, LLM_API_KEY and LLM_MODEL.
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const llmConfigured = () => Boolean(process.env.LLM_API_KEY && process.env.LLM_MODEL);

export async function completeJson<T>(messages: ChatMessage[], maxTokens = 1200): Promise<T> {
  const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!apiKey || !model) throw new Error("LLM_API_KEY and LLM_MODEL must be set");

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return parseJson<T>(data.choices[0]?.message?.content ?? "");
}

// Accepts plain JSON or JSON wrapped in a code fence.
export function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("LLM response was not JSON");
  return JSON.parse(body.slice(start, end + 1)) as T;
}
