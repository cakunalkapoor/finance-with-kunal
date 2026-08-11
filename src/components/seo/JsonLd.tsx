import {
  AUTHOR_LINKEDIN,
  AUTHOR_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

/* Schema.org markup, rendered as JSON-LD script tags. Search engines use this
   for the site-name, author, and breadcrumb treatments in results — the pages
   are static HTML, so this is all resolved at build time. */

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped below; `<` is the only character that
      // could break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Site-wide identity: who publishes this and what the site is. Root layout only. */
export function SiteJsonLd() {
  const personId = `${SITE_URL}/#person`;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": personId,
            name: AUTHOR_NAME,
            url: absoluteUrl("/about"),
            image: `${SITE_URL}/kunal.jpg`,
            jobTitle: "Finance & Risk Professional",
            description:
              "Chartered Accountant and MBA writing weekly analysis of global markets and the economy.",
            homeLocation: { "@type": "Place", name: "Vancouver, BC, Canada" },
            sameAs: [AUTHOR_LINKEDIN],
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            alternateName: SITE_TAGLINE,
            url: `${SITE_URL}/`,
            description:
              "Weekly global markets dashboard, economic indicators, and finance commentary by Kunal Kapoor.",
            inLanguage: "en",
            author: { "@id": personId },
            publisher: { "@id": personId },
          },
        ],
      }}
    />
  );
}

/** Breadcrumb trail for a sub-page. Pass the trail without the site root. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}
