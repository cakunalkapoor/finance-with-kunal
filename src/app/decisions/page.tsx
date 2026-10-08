import Link from "next/link";
import { ArrowRight, CarFront, House, MoveUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Decision Studio", path: "/decisions", description: "Compare buying or renting a home and buying or leasing a car using your own numbers." });
const comparisons = [
  { href: "/decisions/buy-vs-rent", category: "A place to live", title: "Buy or rent?", icon: House, description: "See how a home purchase compares with renting—and what each path could leave you with.", tags: ["Mortgage & rent", "Wealth over time", "Break-even points"], label: "Compare home options", number: "01" },
  { href: "/decisions/buy-vs-lease", category: "A way to get there", title: "Buy or lease?", icon: CarFront, description: "Look beyond the monthly payment. Compare the cost of owning a car with returning a lease.", tags: ["Loan & lease", "Resale value", "Mileage & fees"], label: "Compare car options", number: "02" },
];
export default function DecisionsPage() {
  return <div className="section-shell py-10 sm:py-16">
    <header className="mb-10 grid gap-6 border-b border-space-border pb-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan">Decision Studio</p><h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Big decisions.<br /><span className="text-text-secondary">Clearer numbers.</span></h1></div>
      <p className="max-w-md text-base leading-relaxed text-text-secondary">Choose a comparison, enter your own assumptions, and explore what changes the outcome. A little clarity before a big commitment.</p>
    </header>
    <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">Choose your comparison</h2><span className="text-xs text-text-muted">Two decisions. Your numbers.</span></div>
    <div className="grid gap-5 md:grid-cols-2">{comparisons.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href} className="group flex min-w-0 flex-col rounded-2xl border border-space-border bg-space-card p-7 transition-colors hover:border-neon-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-cyan sm:p-9">
      <div className="flex items-center justify-between"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-space-void text-neon-cyan"><Icon size={30} strokeWidth={1.5} /></div><span className="font-mono text-xs text-text-muted">{item.number} / DECISION</span></div>
      <p className="mt-9 text-xs uppercase tracking-widest text-text-secondary">{item.category}</p><h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h3><p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">{item.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="rounded-full border border-space-border px-3 py-1.5 text-[11px] text-text-secondary">{tag}</span>)}</div>
      <div className="mt-9 flex items-center justify-between border-t border-space-border pt-5 text-sm font-semibold text-neon-cyan">{item.label}<ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></div>
    </Link>)}</div>
    <div className="mt-10 grid gap-5 border-t border-space-border pt-7 sm:grid-cols-3">{[["Start with your quotes", "Use the prices, payments and terms available to you."], ["Explore the trade-offs", "Change an assumption and watch the comparison update."], ["See the whole picture", "Understand the costs and what remains at the end."]].map(([title, text]) => <div key={title}><p className="flex items-center gap-2 text-sm font-semibold"><MoveUpRight size={14} className="text-neon-cyan" />{title}</p><p className="mt-2 text-xs leading-relaxed text-text-secondary">{text}</p></div>)}</div>
  </div>;
}
