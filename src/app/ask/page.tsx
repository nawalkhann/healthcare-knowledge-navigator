import { Prose } from "@/components/Prose";
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
    <Prose>
      <h1>Ask a clinical question</h1>
      <p>The question tool is being built and will appear here.</p>
      <p>Please do not enter patient names, dates of birth or record numbers.</p>
    </Prose>
  );
}
