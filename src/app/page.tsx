import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, CalendarCheck, CalendarClock, TrendingUp } from "lucide-react";
import MarketTicker from "@/components/markets/MarketTicker";
import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import WeeklyCommentary from "@/components/home/WeeklyCommentary";
import TrendingHeadlines from "@/components/home/TrendingHeadlines";
import { EQUITY_INDICES } from "@/lib/site-data";
import { formatNumber, formatChange, FONT_MONO } from "@/lib/utils";

function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-screen-2xl mx-auto">
        {/* Last / Next update row */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={12} style={{ color: "var(--color-market-up)" }} />
            <span
              className="text-xs"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              Last Updated
            </span>
            <span
              className="text-xs font-semibold"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-text-secondary)",
              }}
            >
              Jun 13, 2026
            </span>
          </div>
          <div
            className="w-px h-3 hidden sm:block"
            style={{ background: "var(--color-space-border)" }}
          />
          <div className="flex items-center gap-1.5">
            <CalendarClock size={12} style={{ color: "var(--color-neon-cyan)" }} />
            <span
              className="text-xs"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              Next Update
            </span>
            <span
              className="text-xs font-semibold"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-text-secondary)",
              }}
            >
              Jun 21, 2026
            </span>
          </div>
        </div>

        {/* Pre-title */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-4 w-0.5 rounded"
            style={{ background: "var(--color-neon-cyan)" }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-neon-cyan)",
              letterSpacing: "0.16em",
            }}
          >
            Finance with Kunal
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "var(--color-text-primary)" }}>Data. Insight. Action.</span>
          <br />
          <span className="gradient-text-cyan">Beyond the ticker.</span>
        </h1>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/markets"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(167,139,250,0.08))",
              border: "1px solid rgba(167,139,250,0.4)",
              color: "var(--color-neon-cyan)",
            }}
          >
            <BarChart2 size={16} />
            Markets Dashboard
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
            style={{
              background: "rgba(129,140,248,0.1)",
              border: "1px solid rgba(129,140,248,0.3)",
              color: "var(--color-neon-purple)",
            }}
          >
            <TrendingUp size={16} />
            Global Economy
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
            style={{
              background: "rgba(124,58,237,0.05)",
              border: "1px solid var(--color-space-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <BookOpen size={16} />
            Read Blog
          </Link>
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
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.14em",
            }}
          >
            Market Snapshot
          </h2>
          <Link
            href="/markets"
            className="text-xs flex items-center gap-1 transition-colors"
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
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.14em",
            }}
          >
            Economic Snapshot
          </h2>
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
      <MarketSnapshot />
      <EconomicSnapshot />
      <WeeklyCommentary />
      <TrendingHeadlines />
    </>
  );
}
