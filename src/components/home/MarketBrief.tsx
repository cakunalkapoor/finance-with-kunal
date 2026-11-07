import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, Cpu, Landmark, Layers3 } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { AI_DAILY_DATES, AI_STOCKS } from "@/lib/ai-data";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { BOND_YIELDS, COMMODITIES, CRYPTO, DATA_UPDATED_AT, EQUITY_INDICES } from "@/lib/site-data";
import { FONT_MONO, formatChange, formatNumber } from "@/lib/utils";

type BriefRow = {
  label: string;
  level: string;
  move: number | null;
  date?: string;
};

type PriceQuote = { value: number; weekChange: number; dailyDates?: string[] };

function priceRow(label: string, quote: PriceQuote | undefined, usd = false, date = quote?.dailyDates?.at(-1)): BriefRow {
  return {
    label,
    level: quote ? `${usd ? "$" : ""}${formatNumber(quote.value)}` : "—",
    move: quote?.weekChange ?? null,
    date,
  };
}

const groups = [
  {
    title: "Equity indices", href: "/markets", icon: ChartNoAxesCombined, isYield: false, level: "Index level",
    rows: [
      priceRow("S&P 500", EQUITY_INDICES.find(quote => quote.symbol === "^GSPC")),
      priceRow("S&P/TSX Composite", EQUITY_INDICES.find(quote => quote.symbol === "^GSPTSE")),
      priceRow("Nikkei 225", EQUITY_INDICES.find(quote => quote.symbol === "^N225")),
    ],
  },
  {
    title: "Government bonds", href: "/markets", icon: Landmark, isYield: true, level: "Yield",
    rows: ["United States", "Canada", "Germany"].map(country => {
      const bond = BOND_YIELDS.find(quote => quote.country === country && quote.maturity === "10Y");
      return {
        label: `${country} 10Y`,
        level: bond ? `${formatNumber(bond.yield)}%` : "—",
        move: bond?.oneWeekMove == null ? null : bond.oneWeekMove * 100,
        date: bond?.asOf,
      };
    }),
  },
  {
    title: "AI stocks", href: "/ai", icon: Cpu, isYield: false, level: "USD",
    rows: [["NVIDIA", "NVDA"], ["AMD", "AMD"], ["Microsoft", "MSFT"]].map(([label, symbol]) => {
      const quote = AI_STOCKS.find(stock => stock.symbol === symbol);
      const dateIndex = quote?.daily?.findLastIndex(value => value !== null) ?? -1;
      return priceRow(label, quote, true, AI_DAILY_DATES[dateIndex]);
    }),
  },
  {
    title: "Commodities & crypto", href: "/markets", icon: Layers3, isYield: false, level: "USD",
    rows: [
      priceRow("Brent crude futures", COMMODITIES.find(quote => quote.symbol === "BZ=F"), true),
      priceRow("Gold futures", COMMODITIES.find(quote => quote.symbol === "GC=F"), true),
      priceRow("Bitcoin", CRYPTO.find(quote => quote.symbol === "BTC-USD"), true),
    ],
  },
];

const quoteDate = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

function QuoteDate({ date }: { date: string }) {
  return <time dateTime={date}>{quoteDate.format(new Date(`${date}T00:00:00Z`))}</time>;
}

function BriefPanel({ title, href, icon: Icon, isYield, level, rows }: (typeof groups)[number]) {
  const firstDate = rows[0]?.date;
  const sharedDate = firstDate && rows.every(row => row.date === firstDate) ? firstDate : undefined;

  return (
    <section className="min-w-0 bg-space-card px-4 py-4 sm:px-7 sm:py-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-wash)] text-neon-cyan">
          <Icon size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] leading-tight font-bold text-text-primary sm:text-xl">
            <Link href={href} className="group inline-flex items-center gap-1.5 hover:text-neon-cyan">
              {title} <ArrowUpRight size={13} className="shrink-0 text-neon-cyan" aria-hidden="true" />
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            {sharedDate ? <QuoteDate date={sharedDate} /> : "Observation dates by quote"}
          </p>
        </div>
      </div>
      <table className="w-full text-left text-xs sm:text-sm">
        <caption className="sr-only">{title} levels and {isYield ? "one-week yield moves in basis points" : "one-week price changes"}</caption>
        <thead className="text-[11px] text-text-secondary">
          <tr>
            <th scope="col" className="pb-1.5 font-medium">Instrument</th>
            <th scope="col" className="pb-1.5 pl-2 text-right font-medium">{level}</th>
            <th scope="col" className="pb-1.5 pl-2 text-right font-medium">1W move</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const direction = row.move == null || row.move === 0 || isYield
              ? "bg-space-void text-text-secondary"
              : row.move > 0
                ? "bg-market-up-dim text-market-up"
                : "bg-market-down-dim text-market-down";
            const move = row.move == null ? "—"
              : isYield ? `${row.move > 0 ? "+" : ""}${formatNumber(row.move, 1)} bp`
                : formatChange(row.move);
            return (
              <tr key={row.label} className="border-t border-space-border">
                <th scope="row" className="py-2 font-semibold text-text-primary">
                  {row.label}
                  {!sharedDate && <span className="block text-[11px] font-normal text-text-secondary">
                    {row.date ? <QuoteDate date={row.date} /> : "Date unavailable"}
                  </span>}
                </th>
                <td className="py-2 pl-2 text-right font-bold whitespace-nowrap text-text-primary" style={{ fontFamily: FONT_MONO }}>{row.level}</td>
                <td className="py-2 pl-2 text-right whitespace-nowrap" style={{ fontFamily: FONT_MONO }}>
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold sm:px-2 sm:text-xs ${direction}`}>{move}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default function MarketBrief() {
  return (
    <section className="section-shell pt-5 pb-6 sm:pt-8 sm:pb-8" aria-labelledby="market-brief-title">
      <div id="market-brief" className="overflow-hidden rounded-2xl border border-space-border bg-space-card sm:rounded-3xl">
        <header className="flex flex-col gap-4 border-b border-space-border bg-space-black px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Logo size={22} /> {SITE_NAME}
            </div>
            <h2 id="market-brief-title" className="mt-2 text-4xl leading-none font-semibold tracking-[-0.055em] text-text-primary sm:text-6xl">Market brief</h2>
          </div>
          <div className="text-text-secondary sm:text-right">
            <p className="text-[11px] font-bold tracking-wide uppercase">Snapshot updated</p>
            <p className="mt-0.5 text-base font-bold text-text-primary sm:text-lg" style={{ fontFamily: FONT_MONO }}>{DATA_UPDATED_AT}</p>
          </div>
        </header>
        <div className="grid gap-px bg-space-border md:grid-cols-2">
          {groups.map(group => <BriefPanel key={group.title} {...group} />)}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-space-border bg-space-black px-4 py-3 text-[11px] text-text-secondary sm:px-7 sm:text-xs">
          <p>Yahoo Finance and sovereign yield feeds · Bond moves in basis points</p>
          <p className="font-bold text-text-primary" style={{ fontFamily: FONT_MONO }}>{new URL(SITE_URL).hostname}</p>
        </footer>
      </div>
    </section>
  );
}
