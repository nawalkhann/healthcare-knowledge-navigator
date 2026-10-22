import type { MetadataRoute } from "next";
import { topics } from "@/content/topics";
import { site, staticRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
  const topicPages: MetadataRoute.Sitemap = topics.map((t) => ({
    url: new URL(`/topics/${t.slug}`, site.url).toString(),
    lastModified: t.reviewed,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...pages, ...topicPages];
}
