import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/answer/engine";
import { scrubIdentifiers } from "@/lib/answer/scrub";
import { allowRequest } from "@/lib/rate-limit";
import { callNavigator } from "@/lib/navigator";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_QUESTION_LENGTH = 500;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`ask:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many questions. Please wait a minute and try again." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
  const raw = typeof body?.question === "string" ? body.question.trim() : "";
  if (raw.length < 8 || raw.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: `Questions must be 8 to ${MAX_QUESTION_LENGTH} characters.` }, { status: 400 });
  }

  const question = scrubIdentifiers(raw);
  const started = Date.now();
  try {
    const result = await answerQuestion(question);
    const { chunkIds, ...response } = result;
    await callNavigator("log", {
      question,
      answer: result.status === "answered" ? result.sentences.map((s) => s.text).join(" ") : null,
      confidence: result.status === "answered" ? result.confidence.level : "declined",
      chunk_ids: chunkIds,
      latency_ms: Date.now() - started,
    }).catch((err) => console.error("query log failed", (err as Error).message));
    return NextResponse.json(response);
  } catch (err) {
    console.error("ask failed", err);
    return NextResponse.json({ error: "Something went wrong answering this question. Please try again." }, { status: 500 });
  }
}
