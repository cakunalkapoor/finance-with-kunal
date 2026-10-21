import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog-data";
import { AUTHOR_NAME, pageMetadata } from "@/lib/seo";
import { FONT_MONO } from "@/lib/utils";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_ARTICLES.map(({ slug }) => ({ slug }));
}

function findArticle(slug: string) {
  const article = BLOG_ARTICLES.find((post) => post.slug === slug);
  if (!article) notFound();
  return article;
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = findArticle((await params).slug);
  const metadata = pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    keywords: article.tags,
  });
  return {
    ...metadata,
    authors: [{ name: AUTHOR_NAME }],
    openGraph: { ...metadata.openGraph, type: "article", publishedTime: article.date, authors: [AUTHOR_NAME] },
  };
}

function SourceLink({ article, id }: { article: BlogArticle; id: string }) {
  const source = article.sources.find((item) => item.id === id);
  if (!source) throw new Error(`Missing blog source: ${id}`);
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
      style={{ color: "var(--color-neon-cyan)" }}>
      {source.publisher}
    </a>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const article = findArticle((await params).slug);
  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <BreadcrumbJsonLd items={[{ name: "Blog", path: "/blog" }, { name: article.title, path: `/blog/${article.slug}` }]} />
      <ArticleJsonLd post={article} />
      <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold"
        style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO }}>
        <ArrowLeft size={14} /> Back to the journal
      </Link>

      <header className="mt-10 border-b pb-10 sm:pb-12" style={{ borderColor: "var(--color-space-border)" }}>
        <span className="eyebrow">{article.category}</span>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] sm:text-6xl"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.045em" }}>
          {article.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8" style={{ color: "var(--color-text-secondary)" }}>
          {article.excerpt}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
          style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
          <span>By {AUTHOR_NAME}</span>
          <time dateTime={article.date}>{displayDate(article.date)}</time>
          <span className="inline-flex items-center gap-1.5"><Clock size={12} />{article.readTime} min read</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 pt-10 text-base leading-8"
        style={{ color: "var(--color-text-secondary)" }}>
        {article.introduction.map((text) => <p key={text}>{text}</p>)}
        <aside className="border-l-2 p-5 sm:p-7"
          style={{ borderColor: "var(--color-neon-cyan)", background: "var(--color-wash)" }}>
          <p className="eyebrow mb-3">The financing question</p>
          <p className="text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>{article.takeaway}</p>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="outcomes-title">
        <h2 id="outcomes-title" className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Three setbacks, three different outcomes
        </h2>
        <p className="mt-3 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>
          Event dates and reporting times matter. A price observed during trading is not a closing return.
        </p>
        <div className="mt-5 overflow-x-auto border" style={{ borderColor: "var(--color-space-border)" }}>
          <table className="w-full min-w-[640px] border-collapse text-left text-sm leading-6">
            <caption className="sr-only">AI infrastructure IPO setbacks, reporting reviewed October 21, 2026</caption>
            <thead style={{ background: "var(--color-wash)", color: "var(--color-text-primary)" }}>
              <tr>{["Company / date", "Outcome", "What the evidence shows"].map((label) => (
                <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>
              ))}</tr>
            </thead>
            <tbody>
              {article.cases.map((item) => (
                <tr key={item.company} className="border-t align-top" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-card)" }}>
                  <th scope="row" className="w-44 px-5 py-5 font-normal">
                    <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.company}</span>
                    <span className="mt-2 block text-xs" style={{ color: "var(--color-text-muted)" }}>{item.date}</span>
                  </th>
                  <td className="w-48 px-5 py-5 font-medium" style={{ color: "var(--color-neon-purple)" }}>{item.outcome}</td>
                  <td className="px-5 py-5" style={{ color: "var(--color-text-secondary)" }}>
                    {item.evidence}
                    <span className="mt-2 block text-xs">Source: <SourceLink article={article} id={item.source} /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="mb-5 text-2xl font-semibold leading-tight sm:text-3xl"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>{section.title}</h2>
            <div className="space-y-5 text-base leading-8" style={{ color: "var(--color-text-secondary)" }}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.text}>
                  {paragraph.text}
                  {paragraph.sources?.map((id) => (
                    <span key={id} className="ml-2 text-sm">(<SourceLink article={article} id={id} />)</span>
                  ))}
                </p>
              ))}
            </div>
            {section.points && (
              <ol className="mt-6 space-y-5">
                {section.points.map((point, index) => (
                  <li key={point.title} className="border-t pt-5" style={{ borderColor: "var(--color-space-border)" }}>
                    <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{index + 1}. {point.title}</h3>
                    <p className="mt-2 text-base leading-7" style={{ color: "var(--color-text-secondary)" }}>{point.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}

        <section id="sources" className="border-t pt-8" aria-labelledby="sources-title" style={{ borderColor: "var(--color-space-border)" }}>
          <h2 id="sources-title" className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Sources and reporting dates</h2>
          <p className="mt-3 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>
            Reviewed {displayDate(article.date)}. Company explanations and anonymously sourced reporting are attributed above;
            the interpretation and financing questions are the author&rsquo;s analysis. Subsequent events may change an offering&rsquo;s status.
          </p>
          <ul className="mt-5 space-y-4">
            {article.sources.map((source) => (
              <li key={source.id} id={`source-${source.id}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: "var(--color-neon-cyan)" }}>{source.title}<ArrowUpRight size={13} className="mt-1 shrink-0" /></a>
                <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{source.publisher} · {displayDate(source.date)}</p>
              </li>
            ))}
          </ul>
        </section>
        <Link href="/ai" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-neon-cyan)" }}>
          Explore the sourced AI dashboard <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
