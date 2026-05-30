import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/mock-data";

export const metadata = {
  title: "Blog — Finance with Kunal",
  description: "Finance commentary, market analysis, and economic perspectives by Kunal Kapoor.",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-4 w-0.5 rounded"
            style={{ background: "var(--color-neon-cyan)" }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              color: "var(--color-neon-cyan)",
              letterSpacing: "0.14em",
            }}
          >
            Commentary
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Market Blog
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Independent analysis on global markets, economics, and capital flows
        </p>
      </div>

      {/* Featured post */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group block rounded-xl p-6 sm:p-8 mb-8 transition-all hover:scale-[1.005]"
        style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(168,85,247,0.04) 100%)",
          border: "1px solid rgba(0,212,255,0.2)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold tracking-wide"
            style={{
              background: "rgba(0,212,255,0.12)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--color-neon-cyan)",
              fontFamily: "var(--font-space-mono), monospace",
            }}
          >
            FEATURED
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--color-text-muted)",
            }}
          >
            {featured.category}
          </span>
        </div>

        <h2
          className="text-xl sm:text-2xl font-bold mb-3 leading-snug"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
        >
          {featured.title}
        </h2>
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {featured.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            >
              {featured.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {featured.readTime} min read
            </span>
          </div>
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--color-neon-cyan)" }}
          >
            Read more <ArrowRight size={12} />
          </span>
        </div>
      </Link>

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.01]"
            style={{
              background: "var(--color-space-card)",
              border: "1px solid var(--color-space-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs px-2 py-0.5 rounded font-semibold"
                style={{
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  color: "var(--color-neon-cyan)",
                  fontFamily: "var(--font-space-mono), monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {post.category.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <Clock size={10} />
                {post.readTime}m
              </div>
            </div>

            <h3
              className="font-bold text-sm leading-snug"
              style={{ color: "var(--color-text-primary)" }}
            >
              {post.title}
            </h3>

            <p
              className="text-xs leading-relaxed flex-1 line-clamp-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-space-mono), monospace",
                }}
              >
                {post.date}
              </span>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--color-neon-cyan)" }}
              >
                Read <ArrowRight size={10} />
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: "1px solid var(--color-space-border)" }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--color-space-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Coming soon notice */}
      <div
        className="mt-12 rounded-xl p-6 text-center"
        style={{
          background: "rgba(168,85,247,0.05)",
          border: "1px dashed rgba(168,85,247,0.2)",
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-neon-purple)" }}
        >
          More posts coming soon
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Weekly macro commentary, trade flow analysis, and market deep-dives
        </p>
      </div>
    </div>
  );
}
