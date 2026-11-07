import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Clock3,
  Radar,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import PointerSpotlight from "@/components/ui/PointerSpotlight";
import MarketBrief from "@/components/home/MarketBrief";
import MarketTicker from "@/components/markets/MarketTicker";
import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import WeeklyCommentary from "@/components/home/WeeklyCommentary";
import TrendingHeadlines from "@/components/home/TrendingHeadlines";
import { FONT_MONO } from "@/lib/utils";
import { OG_IMAGE } from "@/lib/seo";

// Title/description/canonical come from the root layout; this only pins the
// social image to the .png copy (see OG_IMAGE) so the homepage doesn't fall
// back to the extensionless opengraph-image route.
export const metadata = {
  openGraph: { images: [OG_IMAGE] },
  twitter: { images: [OG_IMAGE.url] },
};

function HomeIntro() {
  return (
    <section className="section-shell pt-9 pb-3 sm:pt-14 sm:pb-5">
      <h1 className="text-[clamp(2.5rem,8vw,7.25rem)] leading-[0.92] font-semibold tracking-[-0.065em] text-text-primary">
        <span className="block">See the market.</span>
        <span className="block text-neon-cyan">Read the signal.</span>
      </h1>
      <div className="mt-6 flex max-w-4xl flex-wrap items-end gap-x-10 gap-y-4 sm:mt-8">
        <p className="max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
          A clear, global view of markets and the economy—built for people who want the context behind the move, not just another price feed.
        </p>
        <Link href="/markets" className="signal-button hover-nudge inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold">
          Open dashboard <ArrowRight size={16} aria-hidden="true" />
        </Link>
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
              Inflation, real GDP growth, and job changes in the U.S. and Canada.
            </p>
            <Link href="/dashboard" className="hover-nudge inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-neon-cyan)" }}>
              Open the economy dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <MacroSnapshot />
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HomeIntro />
      <MarketBrief />
      <MarketTicker />
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
