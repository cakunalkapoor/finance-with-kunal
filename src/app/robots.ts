import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Emitted as a static /robots.txt at build time (works with output: "export").
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Redirect stub kept only for old inbound links.
        disallow: ["/us-canada/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
