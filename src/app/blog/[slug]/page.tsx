import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyLedgerRedirect from "@/components/ledger/LegacyLedgerRedirect";
import { BLOG_ARTICLES } from "@/lib/blog-data";
import { generateMetadata as ledgerMetadata } from "../../ledger/[slug]/page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return {
    ...await ledgerMetadata(props),
    robots: { index: false, follow: true },
  };
}

export default async function LegacyBlogArticlePage({ params }: Props) {
  const { slug } = await params;
  if (!BLOG_ARTICLES.some(article => article.slug === slug)) notFound();
  return <LegacyLedgerRedirect href={`/ledger/${slug}/`} />;
}
