import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import { BLOG_ARTICLES } from "@/lib/blog-data";
import { FONT_MONO } from "@/lib/utils";

/** Reuse the article's dated evidence so the briefing and full analysis agree. */
export default function AIIPOSetbacks() {
  const article = BLOG_ARTICLES.find((post) => post.slug === "ai-data-center-ipo-setbacks");
  if (!article) throw new Error("Missing AI IPO source article");
  const reviewed = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${article.date}T00:00:00Z`));

  return (
    <section id="ai-ipo-setbacks" className="scroll-mt-24" aria-label="AI infrastructure IPO setbacks">
      <SciFiCard glow="purple">
        <CardHeader
          title="AI infrastructure IPO setbacks"
          subtitle={`Selected cases · reporting reviewed ${reviewed} · original currencies retained`}
        />
        <p className="px-4 pb-4 text-xs leading-6 sm:px-5" style={{ color: "var(--color-text-secondary)" }}>
          Public-market funding is testing the AI buildout. A withdrawn offering, a reported
          postponement and a weak debut have different consequences for issuers and investors.
        </p>
        <div className="grid grid-cols-1 gap-3 px-4 pb-4 lg:grid-cols-3">
          {article.cases.map((item) => {
            const source = article.sources.find((entry) => entry.id === item.source);
            if (!source) throw new Error(`Missing AI IPO source: ${item.source}`);
            return (
              <article key={item.company} className="flex min-w-0 flex-col rounded-lg border p-4"
                style={{ borderColor: "var(--color-space-border)", background: "var(--color-wash)" }}>
                <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.company}</h3>
                <p className="mt-1 text-[10px]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>{item.date}</p>
                <p className="mt-3 text-sm font-semibold" style={{ color: "var(--color-neon-purple)" }}>{item.outcome}</p>
                <p className="mt-3 grow text-xs leading-6" style={{ color: "var(--color-text-secondary)" }}>{item.evidence}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-start gap-1 border-t pt-3 text-[11px] underline underline-offset-4"
                  style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-space-border)" }}>
                  {source.publisher}<ArrowUpRight size={12} className="mt-0.5 shrink-0" aria-hidden />
                </a>
              </article>
            );
          })}
        </div>
        <div className="space-y-3 border-t px-4 py-4 sm:px-5"
          style={{ borderColor: "var(--color-space-border)", color: "var(--color-text-secondary)" }}>
          <p className="text-xs leading-6">
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Kunal&rsquo;s read: </span>
            {article.takeaway} A lower valuation can make the next equity raise more dilutive
            and change the pace of construction. These setbacks put financing and execution
            risk in focus; they do not establish that demand for AI capacity has collapsed.
            Elice completed its capital raise, while AirTrunk&rsquo;s postponement remains an
            attributed report. The cases are examples, not a sector-wide failure rate.
          </p>
          <Link href={`/blog/${article.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
            style={{ color: "var(--color-neon-cyan)" }}>
            Read the full IPO analysis and sources <ArrowUpRight size={13} aria-hidden />
          </Link>
        </div>
      </SciFiCard>
    </section>
  );
}
