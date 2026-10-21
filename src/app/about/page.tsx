import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Healthcare Knowledge Navigator helps clinicians and students find what current guidelines and research say, quickly and with sources.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Prose>
      <h1>About</h1>
      <p>
        Healthcare Knowledge Navigator helps physicians, nurses, pharmacists and students find what current clinical
        guidelines and research say about a question, in seconds and with the sources in view.
      </p>
      <p>
        It is an information tool. It does not diagnose, does not give advice about individual patients, and does
        not replace clinical judgment.
      </p>
    </Prose>
  );
}
