import Link from "next/link";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold text-teal-800">
          {site.shortName}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-4 text-sm text-slate-700">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-teal-800">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
