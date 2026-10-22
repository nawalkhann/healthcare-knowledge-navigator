import Link from "next/link";
import { topics } from "@/content/topics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Clinical topics: what the guidelines say",
  description:
    "Short, cited summaries of current clinical guidelines on hypertension, urinary tract infection, pneumonia, sepsis and heart failure.",
  path: "/topics",
  keywords: ["clinical guideline summaries", "evidence-based medicine topics"],
});

export default function TopicsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold text-slate-900">Clinical topics</h1>
      <p className="mb-8 text-slate-700">
        Short summaries of what current guidelines recommend, with every point linked to its source.
      </p>
      <ul className="space-y-4">
        {topics.map((t) => (
          <li key={t.slug} className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">
              <Link href={`/topics/${t.slug}`} className="text-teal-800 hover:underline">
                {t.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">{t.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
