import Link from "next/link";
import { legal, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-slate-600">
        <p>
          {site.name} provides information for healthcare professionals. It is not a substitute for clinical
          judgment and does not give advice about individual patients.
        </p>
        <ul className="flex gap-4">
          {legal.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-teal-800">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
