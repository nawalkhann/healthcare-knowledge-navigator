import { AskForm } from "@/components/AskForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ask a clinical question",
  description:
    "Type a clinical question and get an answer from current guidelines and research, with citations and a confidence score.",
  path: "/ask",
  keywords: ["ask a clinical question", "guideline search", "medical evidence search"],
});

export default function AskPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold text-slate-900">Ask a clinical question</h1>
      <p className="mb-6 text-slate-700">
        Answers come only from the guidelines and research in our source library. Every statement links to its source.
      </p>
      <AskForm />
    </main>
  );
}
