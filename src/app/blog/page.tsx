import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import { BLOG_POSTS } from "@/lib/site-data";
import BriefingHero from "@/components/ui/BriefingHero";

export const metadata = {
  title: "Blog — Finance with Kunal",
  description: "Finance commentary, market analysis, and economic perspectives by Kunal Kapoor.",
};

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <BriefingHero
        eyebrow="Journal"
        title="Ideas that outlive the news cycle."
        description="Long-form commentary on the forces moving markets and economies—written to stay useful after the headline has moved on."
        accent="violet"
        stats={[
          { label: "Pieces", value: String(posts.length), detail: "Published" },
          { label: "Format", value: "Long", detail: "Deep reads" },
          { label: "Focus", value: "Macro", detail: "Global context" },
        ]}
      />

      <div
        className="grid gap-px border sm:grid-cols-2"
        style={{ background: "var(--color-space-border)", borderColor: "var(--color-space-border)" }}
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
    </div>
  );
}
