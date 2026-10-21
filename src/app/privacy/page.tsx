import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What Healthcare Knowledge Navigator collects, why, and how long it is kept.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Prose>
      <h1>Privacy policy</h1>
      <p>We do not ask for, and you should not enter, any patient-identifiable information.</p>
      <h2>What we collect</h2>
      <p>
        We store the questions asked and the answers given, without IP addresses, to measure and improve answer
        quality. Obvious identifiers such as names, dates of birth and record numbers are removed before storage.
      </p>
      <h2>What we do not do</h2>
      <p>We do not sell data and do not use advertising trackers.</p>
    </Prose>
  );
}
