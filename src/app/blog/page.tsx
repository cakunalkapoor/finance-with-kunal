import Link from "next/link";
import { ArrowUpRight, Clock, PenLine } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import { BLOG_POSTS } from "@/lib/site-data";
import BriefingHero from "@/components/ui/BriefingHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Long-form finance commentary, market analysis, and economic perspectives by Kunal Kapoor — written to stay useful after the headline has moved on.",
  path: "/blog",
  keywords: ["finance blog", "market commentary", "macro analysis", "economic perspectives"],
});

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <BreadcrumbJsonLd items={[{ name: "Blog", path: "/blog" }]} />
      <BriefingHero
        eyebrow="Journal"
        title="Ideas that outlive the news cycle."
        description="Long-form commentary on the forces moving markets and economies—written to stay useful after the headline has moved on."
        accent="violet"
        // Posts aren't tied to the weekly data refresh, so the briefing week
        // would be labelling this page with something it doesn't show.
        status="none"
        stats={
          posts.length === 0
            ? [
                { label: "Status", value: "Soon", detail: "First piece in progress" },
                { label: "Format", value: "Long", detail: "Deep reads" },
                { label: "Focus", value: "Macro", detail: "Global context" },
              ]
            : [
                { label: "Pieces", value: String(posts.length), detail: "Published" },
                { label: "Format", value: "Long", detail: "Deep reads" },
                { label: "Focus", value: "Macro", detail: "Global context" },
              ]
        }
      />

      {posts.length === 0 ? (
        <div
          className="flex flex-col items-center gap-5 rounded-2xl border px-6 py-20 text-center"
          style={{
            background: "var(--color-space-card)",
            borderColor: "var(--color-space-border)",
          }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--color-wash)", color: "var(--color-neon-cyan)" }}
          >
            <PenLine size={20} />
          </span>
          <p
            className="text-[11px] font-bold uppercase"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.14em",
              color: "var(--color-neon-cyan)",
            }}
          >
            Coming soon
          </p>
          <h2
            className="max-w-xl text-2xl font-semibold leading-snug"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Writing is a work in progress.
          </h2>
          <p
            className="max-w-xl text-sm leading-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The first pieces are being written. In the meantime, the weekly data—markets,
            the global economy, and the US and Canada in detail—is already live.
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: "/markets", label: "Markets" },
              { href: "/dashboard", label: "Economy" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-5 py-2 text-[11px] font-bold uppercase"
                style={{
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.1em",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-space-border)",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="grid gap-px border sm:grid-cols-2"
          style={{
            background: "var(--color-space-border)",
            borderColor: "var(--color-space-border)",
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex min-h-64 flex-col p-6 sm:p-7"
              style={{ background: "var(--color-space-card)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    color: "var(--color-neon-cyan)",
                    background: "var(--color-wash)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {post.category}
                </span>
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--color-neon-cyan)" }}
                />
              </div>

              <h2
                className="mt-6 text-xl font-semibold leading-snug"
                style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}
              >
                {post.title}
              </h2>

              <p
                className="mt-3 flex-1 text-sm leading-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {post.excerpt}
              </p>

              <div
                className="mt-6 flex items-center gap-4 text-[11px]"
                style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
              >
                <span className="flex items-center gap-1.5">
                  <Clock size={11} />
                  {post.readTime} min read
                </span>
                <span>{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
