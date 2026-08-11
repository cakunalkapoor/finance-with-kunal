import type { Metadata } from "next";

/* SEO primitives shared by the root layout, every page's `metadata`, the
   sitemap, and robots.txt — so the canonical host is defined exactly once.
   Override the host with NEXT_PUBLIC_SITE_URL when previewing on another
   domain; the trailing slash is stripped so callers can always concatenate. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kunalkapoor.fyi").replace(
  /\/+$/,
  "",
);
export const SITE_NAME = "Finance with Kunal";
export const SITE_TAGLINE = "Data. Insight. Action. Beyond the ticker.";
export const AUTHOR_NAME = "Kunal Kapoor";
export const AUTHOR_LINKEDIN = "https://www.linkedin.com/in/kunal-kapoor/";

/** next.config sets `trailingSlash: true`, so canonicals must carry one too —
    otherwise every page advertises a URL that 301s to a different one. */
export function canonicalPath(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}/` : "/";
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${canonicalPath(path)}`;
}

/* Social card. `postbuild` copies Next's extensionless `out/opengraph-image`
   to `out/og.png` — GitHub Pages serves the extensionless original as
   application/octet-stream, which the scrapers refuse to render. Pointing at
   the .png copy also gives sub-pages an og:image, which they otherwise lose
   by declaring their own `openGraph` block. */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export const OG_IMAGE = {
  url: `${SITE_URL}${BASE_PATH}/og.png`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Global Markets & Economic Intelligence`,
} as const;

interface PageMetaInput {
  /** Bare page title — the root layout's template appends the site name. */
  title: string;
  description: string;
  /** Route path, with or without slashes: "markets", "/markets/". */
  path: string;
  keywords?: string[];
  /** Set for pages that should stay out of the index (e.g. redirect stubs). */
  noIndex?: boolean;
}

/** Builds title + description + canonical + social cards for one page. */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: "en_CA",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
