import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Clock3,
  Globe2,
  Radar,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import PointerSpotlight from "@/components/ui/PointerSpotlight";
import MarketSnapshotBoard, { type SnapshotItem } from "@/components/home/MarketSnapshotBoard";
import MarketTicker from "@/components/markets/MarketTicker";
import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import WeeklyCommentary from "@/components/home/WeeklyCommentary";
import TrendingHeadlines from "@/components/home/TrendingHeadlines";
import { EQUITY_INDICES } from "@/lib/site-data";
import { formatNumber, formatChange, FONT_MONO } from "@/lib/utils";
import { OG_IMAGE } from "@/lib/seo";
import { BRIEFING_WEEK_LABEL } from "@/lib/briefing";

// Title/description/canonical come from the root layout; this only pins the
// social image to the .png copy (see OG_IMAGE) so the homepage doesn't fall
// back to the extensionless opengraph-image route.
export const metadata = {
  openGraph: { images: [OG_IMAGE] },
  twitter: { images: [OG_IMAGE.url] },
};

const QUICK_LINKS = [
  {
    href: "/markets",
    label: "Markets",
    description: "Equities, rates, FX and commodities",
    icon: BarChart2,
  },
  {
    href: "/dashboard",
    label: "Economy",
    description: "The macro picture in one view",
    icon: Globe2,
  },
  {
    href: "/blog",
    label: "Journal",
    description: "Ideas that outlive the news cycle",
    icon: BookOpen,
  },
];

function HeroSection() {
  const pulse = EQUITY_INDICES.slice(0, 4);

  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-space-border)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 76% 24%, var(--color-wash), transparent 28%), linear-gradient(90deg, transparent 0%, transparent 66%, var(--color-wash) 66%, transparent 100%)",
        }}
      />

      <div className="section-shell relative grid min-h-[620px] lg:grid-cols-[1.45fr_0.55fr]">
        <div className="flex flex-col justify-between py-14 pr-0 sm:py-20 lg:border-r lg:pr-14" style={{ borderColor: "var(--color-space-border)" }}>
          <div className="animate-enter flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="eyebrow">Independent market intelligence</span>
            <span
              className="inline-flex items-center gap-2 text-[11px]"
              style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
            >
              <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: "var(--color-neon-cyan)" }} />
              {BRIEFING_WEEK_LABEL.toUpperCase()}
            </span>
          </div>

          <div className="max-w-5xl py-14 sm:py-20">
            {/* Each line rises out of its own mask — see `.line-mask`. The
                masks replace the `<br />`, so the lines stay separate blocks. */}
            <h1
              className="line-stack max-w-5xl text-[clamp(3.25rem,8vw,7.8rem)] font-semibold leading-[0.88]"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.065em" }}
            >
              <span className="line-mask">
                <span style={{ "--line-delay": "90ms" } as CSSProperties}>See the market.</span>
              </span>
              <span className="line-mask">
                <span style={{ "--line-delay": "210ms", color: "var(--color-neon-cyan)" } as CSSProperties}>
                  Read the signal.
                </span>
              </span>
            </h1>

            <div
              className="animate-enter mt-10 flex max-w-3xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
              style={{ "--enter-delay": "200ms" } as CSSProperties}
            >
              <p className="max-w-xl text-base leading-7 sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
                A clear, global view of markets and the economy—built for people who want the context behind the move, not just another price feed.
              </p>

              <Link
                href="/markets"
                className="signal-button hover-nudge inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
              >
                Open dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div
            className="animate-enter grid gap-px border sm:grid-cols-3"
            style={{ background: "var(--color-space-border)", borderColor: "var(--color-space-border)", "--enter-delay": "300ms" } as CSSProperties}
          >
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                href={href}
                key={href}
                className="group hover-accent relative flex items-start gap-3 p-4 sm:p-5 transition-colors"
                style={{ background: "var(--color-space-void)" }}
              >
                <Icon
                  size={17}
                  className="shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: "var(--color-neon-cyan)" }}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {label} <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="mt-1 block text-xs leading-5" style={{ color: "var(--color-text-muted)" }}>
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside
          className="animate-enter flex flex-col justify-center py-10 lg:pl-10"
          style={{ "--enter-delay": "380ms" } as CSSProperties}
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="eyebrow">Market pulse</span>
            <Activity size={16} className="pulse-dot" style={{ color: "var(--color-neon-cyan)" }} />
          </div>

          <div className="border-y" style={{ borderColor: "var(--color-space-border)" }}>
            {pulse.map((item, index) => {
              const positive = item.dailyChange >= 0;
              return (
                <Reveal
                  key={item.symbol}
                  variant="left"
                  delay={440 + index * 70}
                  className="grid grid-cols-[1fr_auto] gap-4 py-5"
                  style={{ borderBottom: index === pulse.length - 1 ? "none" : "1px solid var(--color-space-border)" }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{item.flag}</span>
                      <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{item.name}</span>
                    </div>
                    <span className="mt-1 block text-[10px] tracking-[0.12em]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
                      {item.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: "var(--color-text-primary)", fontFamily: FONT_MONO }}>
                      {formatNumber(item.value, item.value > 10000 ? 0 : 2)}
                    </div>
                    <div
                      className="mt-1 inline-flex items-center gap-0.5 text-xs font-bold"
                      style={{ color: positive ? "var(--color-market-up)" : "var(--color-market-down)", fontFamily: FONT_MONO }}
                    >
                      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {formatChange(item.dailyChange)}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Link href="/markets" className="hover-nudge mt-5 inline-flex items-center justify-between text-xs font-bold" style={{ color: "var(--color-text-secondary)" }}>
            Full cross-asset board <ArrowRight size={14} style={{ color: "var(--color-neon-cyan)" }} />
          </Link>
        </aside>
      </div>
    </section>
  );
}

function MarketSnapshot() {
  // Trimmed to the fields the board renders — the full quotes carry 52-point
  // sparklines that would otherwise cross the server/client boundary unused.
  const top6: SnapshotItem[] = EQUITY_INDICES.slice(0, 6).map(
    ({ symbol, name, flag, value, dailyChange, weekChange, monthChange, ytdChange }) => ({
      symbol, name, flag, value, dailyChange, weekChange, monthChange, ytdChange,
    })
  );

  return (
    <section className="py-16 sm:py-24">
      <div className="section-shell">
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Today at a glance</span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.04em" }}>
              Global market snapshot
            </h2>
          </div>
          <Link href="/markets" className="hover-nudge inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-neon-cyan)" }}>
            Explore all markets <ArrowRight size={15} />
          </Link>
        </Reveal>

        <MarketSnapshotBoard items={top6} />
      </div>
    </section>
  );
}

function EconomicSnapshot() {
  return (
    <section className="border-y py-16 sm:py-24" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-black)" }}>
      <div className="section-shell">
        <Reveal className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="eyebrow">The macro frame</span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.04em" }}>
              Six numbers shaping the conversation.
            </h2>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-2xl text-sm leading-6 lg:text-right" style={{ color: "var(--color-text-secondary)" }}>
              Growth, inflation, labour and energy—condensed into the signals that matter for policy and portfolios.
            </p>
            <Link href="/dashboard" className="hover-nudge inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-neon-cyan)" }}>
              Open the economy dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <MacroSnapshot showHeader={false} />
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <MarketTicker />
      <HeroSection />
      <MarketSnapshot />
      <EconomicSnapshot />
      <WeeklyCommentary />
      <TrendingHeadlines />
      <section className="py-16 sm:py-24">
        <div className="section-shell">
          <Reveal
            variant="scale"
            className="group spotlight-host relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:flex lg:items-center lg:justify-between"
            style={{ background: "var(--color-neon-cyan)", "--spotlight-tint": "rgba(255, 255, 255, 0.22)", "--spotlight-size": "320px" } as CSSProperties}
          >
            <PointerSpotlight />
            <Radar className="absolute -right-8 -top-8 h-40 w-40 opacity-10 transition-transform duration-[1200ms] ease-out group-hover:rotate-45 sm:h-56 sm:w-56" style={{ color: "var(--color-space-void)" }} />
            <div className="relative max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--color-space-void)", fontFamily: FONT_MONO }}>
                <Clock3 size={14} /> Updated weekly
              </div>
              <h2 className="mt-4 text-3xl font-semibold sm:text-5xl" style={{ color: "var(--color-space-void)", letterSpacing: "-0.05em" }}>
                Less noise. Better questions.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: "var(--color-space-void)", opacity: 0.78 }}>
                Follow the weekly brief for a grounded read on global markets, policy and the flows connecting them.
              </p>
            </div>
            <Link href="/about" className="hover-nudge relative mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5 lg:mt-0" style={{ background: "var(--color-space-void)", color: "var(--color-text-primary)" }}>
              Meet Kunal <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
