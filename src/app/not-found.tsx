import Link from "next/link";
import { Prose } from "@/components/Prose";

export default function NotFound() {
  return (
    <Prose>
      <h1>Page not found</h1>
      <p>
        <Link href="/" className="text-teal-800 underline">
          Go to the home page
        </Link>
      </p>
    </Prose>
  );
}
