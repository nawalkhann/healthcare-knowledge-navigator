import Link from "next/link";
import { topics } from "@/content/topics";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Evidence-based clinical answers with citations",
  description:
    "Ask a clinical question and get a short answer drawn from WHO, CDC and peer-reviewed research, with numbered citations and a confidence score.",
  path: "/",
  keywords: ["clinical guidelines", "evidence-based medicine", "medical answers with citations", "clinical decision support"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  description: site.description,
};

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="py-16 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Evidence-based answers to clinical questions, with citations
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          {site.name} searches current clinical guidelines and peer-reviewed research, then writes a short answer
          where every statement links to its source. Each answer carries a confidence score so you can see how strong
          the evidence is.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/ask" className="rounded-md bg-teal-700 px-5 py-3 font-medium text-white hover:bg-teal-800">
            Ask a question
          </Link>
          <Link href="/how-it-works" className="rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-800 hover:border-teal-700">
            How it works
          </Link>
        </div>
      </section>
      <section className="grid gap-6 pb-16 sm:grid-cols-3">
        {[
          ["Cited answers", "Every sentence points to the guideline or paper passage it came from."],
          ["Confidence scoring", "High, Moderate or Low, based on evidence type, agreement between sources and recency."],
          ["Trusted sources", "WHO and CDC guidance plus open-access systematic reviews and trials."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
          </div>
        ))}
      </section>
      <section className="pb-16">
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">What the guidelines say</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link href={`/topics/${t.slug}`} className="text-teal-800 underline">
                {t.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
