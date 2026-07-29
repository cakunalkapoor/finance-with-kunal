import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CalendarCheck,
  CalendarClock,
  Compass,
  Globe2,
  Landmark,
  TrendingUp,
  UserRound,
} from "lucide-react";
import MarketTicker from "@/components/markets/MarketTicker";
import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import WeeklyCommentary from "@/components/home/WeeklyCommentary";
import TrendingHeadlines from "@/components/home/TrendingHeadlines";
import { DATA_UPDATED_AT, EQUITY_INDICES, NEXT_BRIEFING_AT } from "@/lib/site-data";
import { formatNumber, formatChange, FONT_MONO } from "@/lib/utils";

function HeroSection() {
  const heroMarkets = EQUITY_INDICES.slice(0, 4);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-20">
      <div className="max-w-screen-2xl mx-auto">
        <div
          className="relative overflow-hidden rounded-[28px] p-6 sm:p-9 lg:p-12"
          style={{
            background:
              "linear-gradient(135deg, var(--color-space-card) 0%, var(--color-space-card) 54%, var(--color-space-dark) 100%)",
            border: "1px solid var(--color-space-border)",
            boxShadow: "0 24px 80px rgba(79,70,229,0.14)",
          }}
        >
          <div
            className="absolute -right-24 -top-32 h-[430px] w-[430px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 68%)" }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)] lg:items-center">
            <div>
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase"
                style={{
                  background: "rgba(124,58,237,0.10)",
                  border: "1px solid rgba(124,58,237,0.28)",
                  color: "var(--color-neon-cyan)",
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.12em",
                }}
              >
                <Compass size={13} /> Weekly market intelligence
              </div>

              <h1
                className="max-w-4xl text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl"
                style={{ color: "var(--color-text-primary)", letterSpacing: "-0.055em" }}
              >
                See the market.
                <br />
                <span className="gradient-text-cyan">Read the economy.</span>
              </h1>
              <p
                className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Independent, data-led views across global markets and macroeconomics—built to help you connect price action with the forces behind it.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/markets"
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "var(--color-neon-cyan)",
                    color: "var(--color-space-card)",
                    boxShadow: "0 10px 28px rgba(124,58,237,0.24)",
                  }}
                >
                  <BarChart2 size={16} /> Explore markets <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "var(--color-space-card)",
                    border: "1px solid var(--color-space-border-bright)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <TrendingUp size={16} /> Read the economy
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
                  <CalendarCheck size={13} style={{ color: "var(--color-market-up)" }} />
                  Data refreshed <strong style={{ color: "var(--color-text-secondary)" }}>{DATA_UPDATED_AT}</strong>
                </span>
                <span className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
                  <CalendarClock size={13} style={{ color: "var(--color-neon-purple)" }} />
                  Next briefing <strong style={{ color: "var(--color-text-secondary)" }}>{NEXT_BRIEFING_AT}</strong>
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background: "color-mix(in srgb, var(--color-space-card) 88%, transparent)",
                border: "1px solid var(--color-space-border)",
                boxShadow: "0 18px 50px rgba(30,27,58,0.08)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--color-text-primary)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}>
                    Market pulse
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>A quick read across leading indices</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase" style={{ color: "var(--color-market-up)", fontFamily: FONT_MONO, letterSpacing: "0.08em" }}>
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-market-up)" }} /> Live view
                </span>
              </div>

              <div className="space-y-2">
                {heroMarkets.map((market) => {
                  const positive = market.dailyChange >= 0;
                  return (
                    <div key={market.symbol} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl p-3" style={{ background: "rgba(124,58,237,0.035)", border: "1px solid var(--color-space-border)" }}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{market.flag} {market.name}</p>
                        <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>{market.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)", fontFamily: FONT_MONO }}>{formatNumber(market.value, market.value > 10000 ? 0 : 2)}</p>
                        <p className="mt-0.5 text-xs font-bold" style={{ color: positive ? "var(--color-market-up)" : "var(--color-market-down)", fontFamily: FONT_MONO }}>{formatChange(market.dailyChange)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreSection() {
  const destinations = [
    { href: "/markets", icon: BarChart2, label: "Markets", title: "Track cross-asset direction", copy: "Equities, yields, commodities, FX, crypto, and sector breadth." },
    { href: "/dashboard", icon: Globe2, label: "Global economy", title: "Follow the macro cycle", copy: "Growth, inflation, jobs, activity, and energy in historical context." },
    { href: "/us-canada", icon: Landmark, label: "US & Canada", title: "Compare North America", copy: "A side-by-side read across eight economic themes." },
    { href: "/about", icon: UserRound, label: "About", title: "Know the perspective", copy: "The professional experience and principles behind the analysis." },
  ];

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-bold uppercase" style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO, letterSpacing: "0.14em" }}>Explore the briefing</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.035em" }}>Start with the question you’re asking.</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>Each dashboard is designed as a distinct lens, with shared definitions and a consistent weekly rhythm.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {destinations.map(({ href, icon: Icon, label, title, copy }) => (
            <Link key={href} href={href} className="group rounded-2xl p-5 transition-all hover:-translate-y-1" style={{ background: "var(--color-space-card)", border: "1px solid var(--color-space-border)", boxShadow: "0 10px 32px rgba(30,27,58,0.04)" }}>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(124,58,237,0.10)", color: "var(--color-neon-cyan)" }}><Icon size={17} /></span>
                <ArrowRight size={15} style={{ color: "var(--color-text-muted)" }} className="transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase" style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO, letterSpacing: "0.12em" }}>{label}</p>
              <h3 className="mt-2 text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h3>
              <p className="mt-2 text-xs leading-5" style={{ color: "var(--color-text-secondary)" }}>{copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketSnapshot() {
  const top6 = EQUITY_INDICES.slice(0, 6);
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO, letterSpacing: "0.14em" }}>Market snapshot</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>The week’s leading indices</h2>
          </div>
          <Link
            href="/markets"
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "var(--color-neon-cyan)" }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {top6.map((idx) => {
            const pos = idx.dailyChange >= 0;
            return (
              <div
                key={idx.symbol}
                className="rounded-lg p-3 flex flex-col gap-1 transition-all hover:scale-[1.02]"
                style={{
                  background: "var(--color-space-card)",
                  border: "1px solid var(--color-space-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{idx.flag}</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: FONT_MONO,
                      color: pos ? "#34d399" : "#fb7185",
                      background: pos ? "rgba(52,211,153,0.11)" : "rgba(251,113,133,0.11)",
                    }}
                  >
                    {formatChange(idx.dailyChange)}
                  </span>
                </div>
                <div
                  className="font-bold text-sm leading-none"
                  style={{
                    fontFamily: FONT_MONO,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {formatNumber(idx.value, idx.value > 10000 ? 0 : 2)}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {idx.name}
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: FONT_MONO,
                    fontSize: "10px",
                  }}
                >
                  YTD {formatChange(idx.ytdChange)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EconomicSnapshot() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--color-neon-purple)", fontFamily: FONT_MONO, letterSpacing: "0.14em" }}>Economic snapshot</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>Macro, in six signals</h2>
          </div>
          <Link
            href="/dashboard"
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "var(--color-neon-cyan)" }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <MacroSnapshot showHeader={false} />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <MarketTicker />
      <HeroSection />
      <ExploreSection />
      <MarketSnapshot />
      <EconomicSnapshot />
      <WeeklyCommentary />
      <TrendingHeadlines />
    </>
  );
}
