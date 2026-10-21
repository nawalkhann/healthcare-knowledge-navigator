import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms for using Healthcare Knowledge Navigator, including its limits as an information tool.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Prose>
      <h1>Terms of use</h1>
      <p>
        Healthcare Knowledge Navigator provides general information for healthcare professionals. It is not medical
        advice, and it is not a substitute for professional clinical judgment.
      </p>
      <p>
        Answers may be incomplete or out of date. Always verify against the cited source before acting on any
        information.
      </p>
    </Prose>
  );
}
