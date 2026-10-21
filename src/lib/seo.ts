import type { Metadata } from "next";
import { site } from "./site";

type PageMeta = { title: string; description: string; path: string; keywords?: string[] };

export function pageMetadata({ title, description, path, keywords }: PageMeta): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: site.name, type: "website" },
    twitter: { card: "summary", title, description },
  };
}
