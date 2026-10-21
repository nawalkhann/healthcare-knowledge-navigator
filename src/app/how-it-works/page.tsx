import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works: retrieval, citations and confidence",
  description:
    "How Healthcare Knowledge Navigator finds evidence, cites every claim and scores confidence, and where its limits are.",
  path: "/how-it-works",
  keywords: ["retrieval augmented generation", "medical citations", "evidence confidence score"],
});

export default function HowItWorksPage() {
  return (
    <Prose>
      <h1>How it works</h1>
      <p>
        Each answer is built only from passages retrieved from our source library. The system never answers from
        general model knowledge alone.
      </p>
      <h2>1. Search</h2>
      <p>
        Your question is matched against the library using both meaning-based search and keyword search. The best
        passages are then reranked for relevance.
      </p>
      <h2>2. Answer with citations</h2>
      <p>
        A language model writes a short answer from those passages. Every statement must cite a passage, and
        statements without a valid citation are removed before you see the answer.
      </p>
      <h2>3. Confidence score</h2>
      <p>The score is High, Moderate or Low and is based on four signals:</p>
      <ul>
        <li>How closely the retrieved passages match the question</li>
        <li>Whether independent sources agree</li>
        <li>Evidence type, with guidelines and systematic reviews ranked above single studies</li>
        <li>How recent the sources are</li>
      </ul>
      <p>When the evidence is too weak, the tool says it cannot answer and shows the closest sources instead.</p>
      <h2>Limitations</h2>
      <p>
        The library covers a defined set of topics and may lag behind newly published guidance. Always check the
        cited source and use your clinical judgment.
      </p>
    </Prose>
  );
}
