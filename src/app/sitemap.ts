import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { DATA_UPDATED_AT } from "@/lib/site-data";

// Emitted as a static /sitemap.xml at build time (works with output: "export").
export const dynamic = "force-static";

/** `DATA_UPDATED_AT` is display text ("Aug 9, 2026"); fall back to build time
    if it is ever reformatted into something Date can't parse. */
function lastModified(): Date {
  const parsed = new Date(DATA_UPDATED_AT);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/* /us-canada is deliberately absent — it is a noindex redirect stub. */
const ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/markets", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard", priority: 0.9, changeFrequency: "weekly" },
  { path: "/us-economy", priority: 0.8, changeFrequency: "weekly" },
  { path: "/canada-economy", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = lastModified();

  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: updated,
    changeFrequency,
    priority,
  }));
}
