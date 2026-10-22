"use client";

import { useEffect, useState } from "react";

type Citation = {
  number: number;
  title: string;
  issuer: string;
  sourceUrl: string;
  publishedYear: number | null;
  sectionPath: string;
  excerpt: string;
};

type Result =
  | {
      status: "answered";
      sentences: { text: string; citations: number[] }[];
      citations: Citation[];
      confidence: { level: "high" | "moderate" | "low"; reasons: string[] };
    }
  | { status: "declined"; reason: string; closestSources: Citation[] };

const CONFIDENCE_STYLE = {
  high: "bg-emerald-50 text-emerald-800 border-emerald-200",
  moderate: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-rose-50 text-rose-800 border-rose-200",
};

const EXAMPLES = [
  "What is the first-line drug treatment for hypertension in adults?",
  "How long should antibiotics be given for community-acquired pneumonia?",
  "Do SGLT2 inhibitors reduce cardiovascular events in type 2 diabetes?",
];

function SourceList({ sources }: { sources: Citation[] }) {
  return (
    <ol className="space-y-3">
      {sources.map((c) => (
        <li key={c.number} id={`source-${c.number}`} className="rounded-md border border-slate-200 p-3 text-sm">
          <p className="font-medium text-slate-900">
            [{c.number}]{" "}
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">
              {c.title}
            </a>
          </p>
          <p className="text-slate-600">
            {c.issuer}
            {c.publishedYear ? `, ${c.publishedYear}` : ""} · {c.sectionPath}
          </p>
          <p className="mt-2 text-slate-700">{c.excerpt}</p>
        </li>
      ))}
    </ol>
  );
}

export function AskForm() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // Topic pages link here with ?q= to prefill the question.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuestion(q.slice(0, 500));
  }, []);

  async function ask(q: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data as Result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) ask(question.trim());
        }}
        className="space-y-3"
      >
        <label htmlFor="question" className="block text-sm font-medium text-slate-800">
          Your clinical question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-md border border-slate-300 p-3 text-base focus:border-teal-700 focus:outline-none"
          placeholder="e.g. What is the first-line treatment for uncomplicated cystitis in women?"
        />
        <p className="text-xs text-slate-600">Do not enter patient names, dates of birth or record numbers.</p>
        <button
          type="submit"
          disabled={loading || question.trim().length < 8}
          className="rounded-md bg-teal-700 px-5 py-3 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? "Searching the evidence…" : "Ask"}
        </button>
      </form>

      {!result && !loading && (
        <div className="text-sm">
          <p className="mb-2 text-slate-600">Try an example:</p>
          <ul className="space-y-2">
            {EXAMPLES.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => {
                    setQuestion(q);
                    ask(q);
                  }}
                  className="text-left text-teal-800 underline"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div aria-live="polite">
        {error && <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-800">{error}</p>}

        {result?.status === "answered" && (
          <section className="space-y-5">
            <div className={`rounded-md border p-3 text-sm ${CONFIDENCE_STYLE[result.confidence.level]}`}>
              <p className="font-semibold capitalize">{result.confidence.level} confidence</p>
              <ul className="mt-1 list-disc pl-5">
                {result.confidence.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 text-base leading-7 text-slate-900">
              {result.sentences.map((s, i) => (
                <p key={i}>
                  {s.text}{" "}
                  {s.citations.map((n) => (
                    <a key={n} href={`#source-${n}`} className="text-sm text-teal-800">
                      [{n}]
                    </a>
                  ))}
                </p>
              ))}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Sources</h2>
            <SourceList sources={result.citations} />
            <p className="text-xs text-slate-600">
              For healthcare professionals. Check the cited sources and use clinical judgment.
            </p>
          </section>
        )}

        {result?.status === "declined" && (
          <section className="space-y-4">
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-800">{result.reason}</p>
            {result.closestSources.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900">Closest sources</h2>
                <SourceList sources={result.closestSources} />
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
