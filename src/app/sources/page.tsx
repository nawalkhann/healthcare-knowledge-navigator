import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sources: guidelines and research in the library",
  description:
    "The clinical guidelines and open-access research behind every answer, including WHO, CDC and PubMed Central sources.",
  path: "/sources",
  keywords: ["WHO guidelines", "CDC clinical guidance", "PubMed Central open access"],
});

export default function SourcesPage() {
  return (
    <Prose>
      <h1>Sources</h1>
      <p>Answers are drawn only from the documents below. Each document keeps its issuing body and publication year.</p>
      <ul>
        <li>World Health Organization guidelines</li>
        <li>US Centers for Disease Control and Prevention clinical guidance</li>
        <li>Open-access systematic reviews and trials from PubMed Central</li>
      </ul>
      <p>The full document list will be published here once the library is loaded.</p>
    </Prose>
  );
}
