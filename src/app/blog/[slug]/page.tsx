import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import { BLOG_POSTS } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Finance with Kunal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/blog"
        className="flex items-center gap-1.5 text-xs mb-8 w-fit transition-colors"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ArrowLeft size={13} />
        Back to Blog
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span
          className="text-xs px-2.5 py-1 rounded font-bold tracking-wider"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "var(--color-neon-cyan)",
            fontFamily: FONT_MONO,
          }}
        >
          {post.category.toUpperCase()}
        </span>
        <span
          className="text-xs flex items-center gap-1.5"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: FONT_MONO,
          }}
        >
          <Clock size={11} />
          {post.readTime} min read
        </span>
        <span
          className="text-xs"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: FONT_MONO,
          }}
        >
          {post.date}
        </span>
      </div>

      {/* Title */}
      <h1
        className="text-2xl sm:text-3xl font-bold leading-tight mb-4"
        style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
      >
        {post.title}
      </h1>

      {/* Excerpt */}
      <p
        className="text-base leading-relaxed mb-8 pb-8"
        style={{
          color: "var(--color-text-secondary)",
          borderBottom: "1px solid var(--color-space-border)",
        }}
      >
        {post.excerpt}
      </p>

      {/* Placeholder content */}
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "rgba(124,58,237,0.03)",
          border: "1px dashed rgba(124,58,237,0.15)",
        }}
      >
        <p
          className="font-semibold text-sm mb-2"
          style={{ color: "var(--color-neon-cyan)" }}
        >
          Full article coming soon
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Add your blog content in{" "}
          <code
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "var(--color-space-surface)",
              color: "var(--color-text-secondary)",
              fontFamily: FONT_MONO,
            }}
          >
            src/app/blog/[slug]/page.tsx
          </code>{" "}
          or integrate an MDX/CMS solution.
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-8">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded"
            style={{
              background: "var(--color-space-card)",
              border: "1px solid var(--color-space-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
