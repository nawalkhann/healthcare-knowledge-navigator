import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, topics } from "@/content/topics";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const topic = getTopic((await params).slug);
  if (!topic) return {};
  return pageMetadata({
    title: topic.title,
    description: topic.description,
    path: `/topics/${topic.slug}`,
    keywords: topic.keywords,
  });
}

export default async function TopicPage({ params }: Props) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();

  const url = new URL(`/topics/${topic.slug}`, site.url).toString();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: topic.title,
      description: topic.description,
      url,
      lastReviewed: topic.reviewed,
      audience: { "@type": "MedicalAudience", audienceType: "Clinician" },
      citation: topic.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: topic.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Topics", item: new URL("/topics", site.url).toString() },
        { "@type": "ListItem", position: 2, name: topic.title, item: url },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
        <Link href="/topics" className="hover:text-teal-800">
          Topics
        </Link>{" "}
        / <span>{topic.title}</span>
      </nav>
      <h1 className="mb-3 text-3xl font-semibold text-slate-900">{topic.title}</h1>
      <p className="mb-2 text-lg leading-8">{topic.summary}</p>
      <p className="mb-8 text-sm text-slate-600">Last reviewed against sources on {topic.reviewed}.</p>

      {topic.sections.map((s) => (
        <section key={s.heading} className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">{s.heading}</h2>
          <ul className="list-disc space-y-1 pl-5 leading-7">
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">Common questions</h2>
        {topic.faq.map((f) => (
          <div key={f.question} className="mb-3">
            <h3 className="font-medium text-slate-900">{f.question}</h3>
            <p className="leading-7">{f.answer}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">Sources</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-6">
          {topic.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="rounded-lg border border-teal-200 bg-teal-50 p-5">
        <p className="mb-3 text-slate-800">Have a more specific question?</p>
        <Link
          href={`/ask?q=${encodeURIComponent(topic.askExample)}`}
          className="inline-block rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
        >
          Ask the Navigator
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-600">
        For healthcare professionals. Summaries may not reflect guidance published after the review date. Always
        check the original source.
      </p>
    </main>
  );
}
