export const site = {
  name: "Healthcare Knowledge Navigator",
  shortName: "Knowledge Navigator",
  description:
    "Evidence-based answers to clinical questions, drawn from current guidelines and research with citations and a confidence score.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const nav = [
  { href: "/ask", label: "Ask" },
  { href: "/topics", label: "Topics" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
];

export const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// Pages listed in sitemap.xml alongside the topic pages.
export const staticRoutes = ["/", "/ask", "/topics", "/how-it-works", "/sources", "/about", "/privacy", "/terms"];
