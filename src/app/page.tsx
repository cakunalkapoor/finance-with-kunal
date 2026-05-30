import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, TrendingUp } from "lucide-react";
import MarketTicker from "@/components/markets/MarketTicker";
import { BLOG_POSTS, EQUITY_INDICES, MACRO_SNAPSHOT } from "@/lib/mock-data";
import { formatNumber, formatChange } from "@/lib/utils";

function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-screen-2xl mx-auto">
        {/* Pre-title */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-1.5 h-1.5 rounded-full pulse-dot"
            style={{ background: "var(--color-neon-cyan)" }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              color: "var(--color-neon-cyan)",
              letterSpacing: "0.16em",
            }}
          >
            Global Markets Intelligence
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "var(--color-text-primary)" }}>Where Data Meets</span>
          <br />
          <span className="gradient-text-cyan">Market Perspective</span>
        </h1>

        <p
          className="text-lg max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Real-time global equity markets, economic indicators, and independent commentary.
          Built for investors who think globally.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/markets"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))",
              border: "1px solid rgba(0,212,255,0.4)",
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
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              color: "var(--color-neon-purple)",
            }}
          >
            <TrendingUp size={16} />
            Economic Dashboard
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
            style={{
              background: "rgba(255,255,255,0.04)",
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
              fontFamily: "var(--font-space-mono), monospace",
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
                      fontFamily: "var(--font-space-mono), monospace",
                      color: pos ? "#10d98e" : "#f43f5e",
                      background: pos ? "rgba(16,217,142,0.12)" : "rgba(244,63,94,0.12)",
                    }}
                  >
                    {formatChange(idx.dailyChange)}
                  </span>
                </div>
                <div
                  className="font-bold text-sm leading-none"
                  style={{
                    fontFamily: "var(--font-space-mono), monospace",
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
                    fontFamily: "var(--font-space-mono), monospace",
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

function MacroBar() {
  const items = [
    { label: "US GDP", value: `${MACRO_SNAPSHOT.gdp.value}%`, trend: MACRO_SNAPSHOT.gdp.trend, positive: true },
    { label: "China PMI", value: `${MACRO_SNAPSHOT.pmi.value}`, trend: MACRO_SNAPSHOT.pmi.trend, positive: true },
    { label: "US CPI", value: `${MACRO_SNAPSHOT.inflation.value}%`, trend: MACRO_SNAPSHOT.inflation.trend, positive: false },
    { label: "Brent Oil", value: `$${MACRO_SNAPSHOT.oil.value}`, trend: MACRO_SNAPSHOT.oil.trend, positive: false },
  ];
  return (
    <div
      className="mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-lg py-3 px-5 flex flex-wrap gap-x-8 gap-y-3"
      style={{
        background: "rgba(0,212,255,0.03)",
        border: "1px solid rgba(0,212,255,0.1)",
        maxWidth: "var(--max-w-screen-2xl)",
      }}
    >
      {items.map(({ label, value, trend, positive }) => {
        const good = positive ? trend === "up" : trend === "down";
        const color = trend === "neutral" ? "#f59e0b" : good ? "#10d98e" : "#f43f5e";
        const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "◆";
        return (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
              {label}
            </span>
            <span
              className="text-xs font-bold"
              style={{
                fontFamily: "var(--font-space-mono), monospace",
                color: "var(--color-text-primary)",
              }}
            >
              {value}
            </span>
            <span className="text-xs" style={{ color }}>
              {arrow}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LatestPosts() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              color: "var(--color-text-muted)",
              letterSpacing: "0.14em",
            }}
          >
            Latest Commentary
          </h2>
          <Link
            href="/blog"
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--color-neon-cyan)" }}
          >
            All posts <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BLOG_POSTS.slice(0, 4).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-opacity-80"
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
                    border: "1px solid rgba(0,212,255,0.2)",
                    color: "var(--color-neon-cyan)",
                    fontFamily: "var(--font-space-mono), monospace",
                    letterSpacing: "0.06em",
                  }}
                >
                  {post.category.toUpperCase()}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-space-mono), monospace",
                  }}
                >
                  {post.date} · {post.readTime}min
                </span>
              </div>

              <h3
                className="font-bold text-sm leading-snug group-hover:text-neon-cyan transition-colors"
                style={{ color: "var(--color-text-primary)" }}
              >
                {post.title}
              </h3>

              <p
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {post.excerpt}
              </p>

              <div className="flex items-center gap-1 mt-auto">
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--color-neon-cyan)" }}
                >
                  Read more <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <MarketTicker />
      <HeroSection />
      <MacroBar />
      <MarketSnapshot />
      <LatestPosts />
    </>
  );
}
