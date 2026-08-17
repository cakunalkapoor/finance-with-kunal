import type {
  AICapexPlan,
  AIDeal,
  AIFigure,
  AIFundingQuarter,
  AIIndexSeries,
  AILayoffMonth,
  AISeriesPoint,
  AIStock,
} from "@/types";

/*
 * Data for the /ai page.
 *
 * Two kinds of data live here, and the difference matters:
 *
 *   1. AI_STOCKS — real Yahoo Finance quotes on the site's normal weekly
 *      cadence. GENERATED: `npm run fetch:ai && npm run patch:ai` rewrites the
 *      marked block below. Don't hand-edit it.
 *
 *   2. Everything else — hand-curated, because no free provider publishes it.
 *      "AI revenue" is a run-rate a CFO chose to say out loud on a call, not a
 *      reported segment; layoff attribution is one outplacement firm's monthly
 *      press release; private deal terms are whatever the parties announced.
 *      Each figure therefore carries `source`, `sourceUrl` and `asOf`, and the
 *      UI renders all three. If a number can't be sourced it doesn't go on the
 *      page — same rule as index P/E on the markets tables.
 *
 * MAINTENANCE: the curated blocks below go stale on a quarterly earnings
 * rhythm, not a weekly one. `AI_DATA_ASOF` is the honest "curated as of" date
 * shown on the page — bump it whenever you revise the curated figures, and
 * leave it alone when only the stock quotes refresh.
 */

/** Date the curated (non-quote) figures on /ai were last reviewed. */
export const AI_DATA_ASOF = "Aug 15, 2026";

/* ── Company AI revenue ─────────────────────────────────────────────────────
   Note how few of these are audited segment figures. Microsoft and Amazon give
   a run rate on the call and nothing in the 10-Q ties to it; Google Cloud and
   NVIDIA Data Center ARE reported segments; Anthropic and OpenAI are private.
   The `detail` line says which is which, because a $37B run rate and a $75.2B
   reported segment are not the same class of number. */
export const AI_REVENUE: AIFigure[] = [
  {
    id: "nvda-dc",
    label: "NVIDIA Data Center",
    value: "$75.2B",
    detail: "Reported segment, quarter ended Apr 2026 · +92% YoY · compute $60.4B, networking $14.8B",
    source: "NVIDIA Q1 FY2027 results",
    sourceUrl:
      "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027",
    asOf: "2026-05-27",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    value: "$47B",
    detail: "Annualized run rate, private company · up from ~$9B at end-2025",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/05/28/anthropic-open-ai-startup-value.html",
    asOf: "2026-05-28",
  },
  {
    id: "msft-ai",
    label: "Microsoft AI business",
    value: "$37B",
    detail: "Annual run rate quoted on the call, not a reported segment · +123% YoY",
    source: "Microsoft FY26 Q2",
    sourceUrl:
      "https://www.microsoft.com/en-us/investor/earnings/fy-2026-q2/press-release-webcast",
    asOf: "2026-01-29",
  },
  {
    id: "gcp",
    label: "Google Cloud",
    value: "$24.8B",
    detail: "Reported segment, Q2 2026 · +82% YoY · backlog $514B",
    source: "Alphabet Q2 2026",
    sourceUrl: "https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html",
    asOf: "2026-07-22",
  },
  {
    id: "openai",
    label: "OpenAI",
    value: "~$25B",
    detail: "Annualized run rate, private company · roughly flat since Feb 2026",
    source: "Forbes",
    sourceUrl:
      "https://www.forbes.com/sites/paulocarvao/2026/05/21/anthropic-openai-enterprise-ai-profitability/",
    asOf: "2026-05-21",
  },
  {
    id: "aws-ai",
    label: "AWS AI business",
    value: "$25B+",
    detail: "Annual run rate quoted on the call · triple-digit growth · AWS backlog $496B",
    source: "Amazon Q2 2026",
    sourceUrl: "https://www.cnbc.com/2026/07/30/aws-earnings-q2-2026.html",
    asOf: "2026-07-30",
  },
];

/* ── Capex ──────────────────────────────────────────────────────────────────
   The single biggest number on the page. Guidance was raised repeatedly
   through 2026, so each row carries the figure as most recently published
   rather than the one given in January — and `raised` flags the ones that
   moved, because the revision is itself the story.

   `priorYear` is deliberately taken from ONE source for all four companies
   (Epoch AI's hyperscaler tracker, compiled from 10-Q/10-K filings) rather
   than four separate press reports. Mixing sources here is a trap: Microsoft's
   fiscal year ends in June, so a "FY2025" capex headline covers a different
   twelve months than Amazon's, and some outlets count finance leases while
   others report cash capex only. Epoch's series is calendar-quarter and
   includes new finance leases throughout, so the four bars are comparable to
   each other. As a check, they sum to $408.6B against the $410B aggregate the
   context card cites — the two agree. */
export const AI_CAPEX_PRIOR_YEAR_SOURCE = {
  label: "Epoch AI hyperscaler capex tracker (SEC 10-Q/10-K)",
  url: "https://epoch.ai/data-insights/hyperscaler-capex-trend",
  asOf: "2026-02-27",
} as const;

export const AI_CAPEX: AICapexPlan[] = [
  {
    company: "Amazon",
    ticker: "AMZN",
    low: 220,
    high: 220,
    priorYear: 134.7,
    raised: true,
    note: "Raised at Q2 on AWS capacity constraints; backlog $496B",
    source: "Amazon Q2 2026",
    sourceUrl: "https://www.cnbc.com/2026/07/30/amazon-amzn-q2-earnings-report-2026.html",
    asOf: "2026-07-30",
  },
  {
    company: "Alphabet",
    ticker: "GOOGL",
    low: 175,
    high: 205,
    priorYear: 93.1,
    raised: true,
    note: "Ceiling lifted to $205B at Q2; the capex hike, not the beat, moved the stock",
    source: "Alphabet Q2 2026",
    sourceUrl: "https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html",
    asOf: "2026-07-22",
  },
  {
    company: "Microsoft",
    ticker: "MSFT",
    low: 190,
    high: 190,
    priorYear: 108.3,
    raised: false,
    note: "Azure capacity-constrained through the year on management's own account",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/02/06/google-microsoft-meta-amazon-ai-cash.html",
    asOf: "2026-02-06",
  },
  {
    company: "Meta",
    ticker: "META",
    low: 125,
    high: 145,
    priorYear: 72.5,
    raised: true,
    note: "Guidance raised twice in 2026, from an initial $115–135B range",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/07/28/hyperscalers-face-higher-capex-scrutiny-after-alphabet-report-panned.html",
    asOf: "2026-07-28",
  },
];

export const AI_CAPEX_CONTEXT: AIFigure[] = [
  {
    id: "capex-total",
    label: "Combined 2026 capex plans",
    value: "~$725B",
    detail: "Four hyperscalers · up ~77% on 2025's $410B · sell-side sees >$1T in 2027",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/02/06/google-microsoft-meta-amazon-ai-cash.html",
    asOf: "2026-02-06",
  },
  {
    // The IEA publishes a 2024 baseline and a 2030 projection — it does NOT
    // publish a 2026 figure, so this card states the projection as a
    // projection. Older "data centres pass 1,000 TWh in 2026" numbers in
    // circulation come from a superseded 2024 IEA report, not this one.
    id: "power",
    label: "Data-centre electricity demand",
    value: "945 TWh",
    detail:
      "IEA projection for 2030 — double 2024's 415 TWh (1.5% of world electricity) · AI-accelerated servers +30%/yr",
    source: "IEA, Energy and AI",
    sourceUrl: "https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai",
    asOf: "2026-04-10",
  },
  {
    id: "backlog",
    label: "Contracted-but-undelivered cloud",
    value: "$1.01T",
    detail: "Google Cloud $514B + AWS $496B backlog — demand booked years ahead of capacity",
    source: "Alphabet & Amazon Q2 2026",
    sourceUrl: "https://www.cnbc.com/2026/07/30/aws-earnings-q2-2026.html",
    asOf: "2026-07-30",
  },
];

/* ── Chips & supply chain ───────────────────────────────────────────────── */
export const AI_CHIPS: AIFigure[] = [
  {
    id: "skhynix",
    label: "SK hynix Q2 2026",
    value: "₩79.3T",
    detail:
      "Revenue, with ₩60.5T operating profit — a 76% operating margin · HBM4 mass shipments began",
    source: "SK hynix newsroom",
    sourceUrl: "https://news.skhynix.com/en/q2-2026-business-results/",
    asOf: "2026-07-29",
  },
  {
    id: "tsmc",
    label: "TSMC July revenue",
    value: "+44.7%",
    detail: "Year on year, monthly revenue disclosure — the cleanest high-frequency read on AI silicon",
    source: "Reuters via Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/technology/ai/articles/tsmc-july-2026-revenue-jumps-110802277.html",
    asOf: "2026-08-10",
  },
  {
    id: "asml",
    label: "ASML 2026 guidance",
    value: "€43–45B",
    detail: "Full-year revenue guidance, raised · Q2 net sales €9.3B · sole EUV supplier",
    source: "ASML interim report (SEC 6-K)",
    sourceUrl:
      "https://www.sec.gov/Archives/edgar/data/0000937966/000162828026048235/statutoryinterimreport20.htm",
    asOf: "2026-07-15",
  },
  {
    id: "hbm",
    label: "HBM market share",
    value: "58%",
    detail: "SK hynix share of HBM revenue in Q1 2026, down from 69% a year earlier · Samsung and Micron 21% each",
    source: "Counterpoint Research",
    sourceUrl: "https://counterpointresearch.com/en/insights/global-dram-and-hbm-market-share",
    asOf: "2026-06-30",
  },
];

/* ── Labour ─────────────────────────────────────────────────────────────────
   Attribution, not measurement. Challenger counts the reason an employer gives
   in its own announcement — so this tracks how willing companies are to SAY
   "AI", which is not the same as how many jobs AI displaced. The card says so.

   June 2026 is absent on purpose: the reports sourced here give a cumulative
   H1 figure but not June's own share, and interpolating it would invent a data
   point. A gap is the honest rendering. */
export const AI_LAYOFF_MONTHS: AILayoffMonth[] = [
  { month: "Jan 2026", aiSharePct: 7 },
  { month: "Feb 2026", aiSharePct: 10 },
  { month: "Mar 2026", aiSharePct: 25 },
  { month: "Apr 2026", aiSharePct: 26 },
  { month: "May 2026", aiSharePct: 40, aiCuts: 38579, totalCuts: 97006 },
  { month: "Jul 2026", aiSharePct: 33, aiCuts: 10970, totalCuts: 33429 },
];

export const AI_LABOUR: AIFigure[] = [
  {
    id: "cuts-ytd",
    label: "AI-attributed US job cuts",
    value: "101,743",
    detail: "Announced through June 2026 — against 54,836 in all of 2025",
    source: "Challenger, Gray & Christmas",
    sourceUrl:
      "https://www.challengergray.com/blog/challenger-report-layoffs-fall-hiring-picks-up-ai-leads-for-fifth-straight-month/",
    asOf: "2026-07-02",
  },
  {
    id: "leading-reason",
    label: "Months as the #1 stated reason",
    value: "5",
    detail: "Consecutive months through July 2026 in which AI led all cited reasons for cuts",
    source: "Challenger, Gray & Christmas",
    sourceUrl:
      "https://www.challengergray.com/blog/challenger-report-layoffs-fall-hiring-picks-up-ai-leads-for-fifth-straight-month/",
    asOf: "2026-08-06",
  },
  {
    id: "concentration",
    label: "Where the cuts land",
    value: "Tech",
    detail:
      "Cuts stay concentrated in technology (38,242 in May) — displacement is sectoral, not economy-wide",
    source: "CNBC",
    sourceUrl:
      "https://www.cnbc.com/2026/06/05/ai-is-now-the-leading-reason-companies-give-for-cutting-jobs-says-new-report-what-that-means-for-workers.html",
    asOf: "2026-06-05",
  },
  {
    id: "total-falling",
    label: "Total announced cuts, July",
    value: "33,429",
    detail: "Lowest monthly total in two years — AI's share is rising while the base shrinks",
    source: "Challenger, Gray & Christmas",
    sourceUrl:
      "https://www.challengergray.com/blog/challenger-report-layoffs-fall-hiring-picks-up-ai-leads-for-fifth-straight-month/",
    asOf: "2026-08-06",
  },
];

/* ── Private capital ────────────────────────────────────────────────────── */
export const AI_FUNDING_QUARTERS: AIFundingQuarter[] = [
  { quarter: "Q1 2026", totalUsdBn: 305, aiSharePct: 80 },
  { quarter: "Q2 2026", totalUsdBn: 205, aiSharePct: 70 },
];

export const AI_DEALS: AIDeal[] = [
  {
    company: "Anthropic",
    round: "Series H",
    amount: 65,
    valuation: 965,
    date: "2026-05-28",
    leadInvestors: "Altimeter, Dragoneer, Greenoaks, Sequoia",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/05/28/anthropic-open-ai-startup-value.html",
  },
  {
    company: "OpenAI",
    round: "Late-stage",
    amount: 122,
    valuation: 852,
    date: "2026-03-31",
    leadInvestors: "Amazon $50B · NVIDIA & SoftBank $30B each",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html",
  },
];

export const AI_PRIVATE_CAPITAL: AIFigure[] = [
  {
    id: "h1-total",
    label: "Global venture funding, H1 2026",
    value: "$510B",
    detail: "A record half-year — more than the $440B invested in all of 2025",
    source: "Crunchbase",
    sourceUrl:
      "https://news.crunchbase.com/venture/global-startup-exits-ipo-ma-soar-ai-q2-h1-2026/",
    asOf: "2026-07-02",
  },
  {
    id: "ai-share",
    label: "AI share of Q2 funding",
    value: ">70%",
    detail: "Up from under 50% a year earlier · 88% of AI capital went to US-based firms",
    source: "Crunchbase",
    sourceUrl:
      "https://news.crunchbase.com/venture/global-startup-exits-ipo-ma-soar-ai-q2-h1-2026/",
    asOf: "2026-07-02",
  },
  {
    id: "two-companies",
    label: "Raised by two companies",
    value: "$217B",
    detail: "OpenAI and Anthropic together — 43% of ALL global startup funding in H1 2026",
    source: "Crunchbase",
    sourceUrl:
      "https://news.crunchbase.com/venture/global-startup-exits-ipo-ma-soar-ai-q2-h1-2026/",
    asOf: "2026-07-02",
  },
  {
    id: "mega-rounds",
    label: "Billion-dollar rounds, Q2",
    value: "16",
    detail: "Totalling $108.6B — 53% of all second-quarter funding in sixteen cheques",
    source: "Crunchbase",
    sourceUrl:
      "https://news.crunchbase.com/venture/global-startup-exits-ipo-ma-soar-ai-q2-h1-2026/",
    asOf: "2026-07-02",
  },
];

/* ── Adoption ───────────────────────────────────────────────────────────────
   The Census Bureau's BTOS is the only nationally representative, regularly
   published measure of US business AI use — everything else on adoption is a
   vendor survey with a vendor's incentive. Firm-size cut included because the
   headline rate hides the real story: adoption is a large-firm phenomenon. */
/* Only the two large bands are published as point estimates. The Census story
   characterises firms under 20 employees as "less than 20%" without giving a
   figure, and does not break out 20–99 at all — so those bands are absent here
   rather than interpolated, and the chart says why. */
export const AI_ADOPTION_BY_SIZE: AISeriesPoint[] = [
  { label: "100–249 employees", value: 32.0 },
  { label: "250+ employees", value: 37.0 },
];

/** National rate for the same period, drawn as a reference line on the chart. */
export const AI_ADOPTION_NATIONAL_RANGE: [number, number] = [17, 20];

export const AI_ADOPTION: AIFigure[] = [
  {
    id: "btos-headline",
    label: "US firms using AI",
    value: "17–20%",
    detail:
      "In a business function · range across BTOS waves, Dec 2025 – May 2026 · adoption is a large-firm story",
    source: "US Census Bureau BTOS",
    sourceUrl: "https://www.census.gov/library/stories/2026/05/ai-use-businesses.html",
    asOf: "2026-05-28",
  },
  {
    id: "btos-expected",
    label: "Expect to use AI within 6 months",
    value: "20–23%",
    detail: "Range across BTOS waves, Dec 2025 – May 2026 · the adoption curve is flattening",
    source: "US Census Bureau BTOS",
    sourceUrl: "https://www.census.gov/library/stories/2026/05/ai-use-businesses.html",
    asOf: "2026-05-28",
  },
  {
    id: "inference-cost",
    label: "Cost per unit of capability",
    value: "9–900×",
    detail:
      "Annual rate of per-token price decline for a fixed benchmark score · frontier list prices still rose in 2026",
    source: "Epoch AI",
    sourceUrl: "https://epoch.ai/data-insights/llm-inference-price-trends",
    asOf: "2026-06-30",
  },
  {
    id: "concentration-mkt",
    label: "Magnificent 7 share of S&P 500",
    value: "~32%",
    detail: "By market cap, mid-2026 · the top-10 share averaged 24% historically",
    source: "Forbes",
    sourceUrl:
      "https://www.forbes.com/sites/investor-hub/article/sp-500-weight-mag-7-stocks-diversification-risk/",
    asOf: "2026-06-30",
  },
];

/* AI_STOCKS:START — generated by patch-ai-stocks.mjs; do not edit by hand */
export const AI_STOCKS: AIStock[] = [
  {
    symbol: "MSFT",
    ticker: "MSFT",
    company: "Microsoft",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 495.4,
    dailyChange: -0.3,
    weekChange: -0.92,
    monthChange: 23.51,
    ytdChange: 4.75,
    high52w: 542.07,
    low52w: 352.83,
    realizedVol: 49.16,
    sparkline: [299.72, 301.14, 295.71, 299.87, 299.35, 289.1, 294.85, 304.21, 309.16, 331.62, 336.06, 336.72, 343.11, 329.68, 323.01, 342.54, 323.8, 334.69, 336.32, 314.04, 310.2, 296.03, 308.26, 305.94, 295.04, 287.93, 297.31, 289.86, 280.07, 300.43, 303.68, 309.42, 296.97, 279.83, 274.03, 277.52, 274.73, 261.12, 252.56, 273.24, 270.02, 252.99, 247.65, 267.7, 259.58, 267.66, 256.72, 260.36, 280.74, 282.91, 291.91, 286.15, 268.09, 256.06, 264.46, 244.74, 237.92, 232.9, 234.24, 228.56, 242.12, 235.87, 221.39, 247.11, 241.22, 247.49, 255.02, 245.42, 244.69, 238.73, 239.82, 224.93, 239.23, 240.22, 248.16, 258.35, 263.1, 258.06, 249.22, 255.29, 248.59, 279.43, 280.57, 288.3, 291.6, 286.14, 285.76, 307.26, 310.65, 308.97, 318.34, 332.89, 335.4, 326.79, 342.33, 335.02, 340.54, 337.22, 345.24, 343.77, 338.37, 327.78, 321.01, 316.48, 322.98, 328.66, 334.27, 330.22, 317.01, 315.75, 327.26, 327.73, 326.67, 329.81, 352.8, 369.67, 369.85, 377.43, 374.51, 374.23, 370.73, 374.58, 376.04, 367.75, 388.47, 398.67, 403.93, 411.22, 420.55, 404.06, 410.34, 415.5, 406.22, 416.42, 428.74, 420.72, 425.52, 421.9, 399.12, 406.32, 406.66, 414.74, 420.21, 430.16, 415.13, 423.85, 442.57, 449.78, 446.95, 467.56, 453.55, 437.11, 425.27, 408.49, 406.02, 418.47, 416.79, 417.14, 401.7, 430.59, 435.27, 428.02, 416.06, 416.32, 418.16, 428.15, 410.37, 422.54, 415, 417, 423.46, 443.57, 447.27, 436.6, 430.53, 423.35, 418.95, 429.03, 444.06, 415.06, 409.75, 408.43, 408.21, 396.99, 393.31, 388.56, 391.26, 378.8, 359.84, 388.45, 367.78, 391.85, 435.28, 438.73, 454.27, 450.18, 460.36, 470.38, 474.96, 477.4, 495.94, 498.84, 503.32, 510.05, 513.71, 524.11, 522.04, 520.17, 507.23, 506.69, 495, 509.9, 517.93, 511.46, 517.35, 510.96, 513.58, 523.61, 517.81, 496.82, 510.18, 472.12, 492.01, 483.16, 478.53, 485.92, 487.71, 472.94, 479.28, 459.86, 465.95, 430.29, 401.14, 401.32, 397.23, 392.74, 408.96, 395.55, 381.87, 356.77, 373.46, 370.87, 422.79, 424.62, 414.44, 415.12, 421.92, 418.57, 450.24, 416.67, 390.74, 379.4, 372.97, 390.49, 385.1, 393.82, 381.7, 464.72, 499.99, 495.4],
  },
  {
    symbol: "GOOGL",
    ticker: "GOOGL",
    company: "Alphabet",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 345.9,
    dailyChange: -0.13,
    weekChange: -2.37,
    monthChange: -2.41,
    ytdChange: 9.76,
    high52w: 402.62,
    low52w: 199.32,
    realizedVol: 43.87,
    sparkline: [144, 143.74, 140.88, 140.8, 142.21, 136.54, 139.79, 141.37, 137.57, 148.05, 148.85, 148.68, 148.93, 142.18, 142, 148, 141.73, 146.92, 144.85, 137.02, 139.48, 130.35, 133.35, 143.29, 134.28, 130.4, 134.46, 131.91, 129.87, 136.13, 141.67, 140.15, 133.29, 126.73, 119.64, 114.11, 115.75, 116.05, 108.91, 112.32, 114.54, 111.16, 107.14, 117.97, 108.74, 119.35, 111.78, 107.9, 116.32, 117.47, 121.68, 117.21, 110.34, 107.85, 110.65, 102.8, 98.74, 95.65, 98.68, 96.56, 101.13, 96.29, 86.58, 96.41, 97.43, 97.46, 100.44, 92.83, 90.26, 89.23, 88.23, 87.34, 92.12, 98.02, 99.37, 104.78, 94.57, 94.35, 89.13, 93.65, 90.63, 101.62, 105.44, 103.73, 108.42, 108.87, 105.41, 107.34, 105.57, 117.51, 122.76, 124.61, 124.67, 122.23, 123.53, 122.34, 119.7, 119.48, 125.42, 120.02, 132.58, 128.11, 129.56, 127.46, 129.88, 135.66, 136.38, 137.4, 130.25, 130.86, 137.58, 137.36, 135.6, 122.17, 129.1, 132.59, 135.31, 136.69, 131.86, 134.99, 132.6, 141.49, 139.69, 135.73, 142.65, 146.38, 152.19, 142.38, 149, 140.52, 143.96, 137.14, 135.41, 141.18, 150.77, 150.93, 152.5, 157.73, 154.09, 171.95, 167.24, 168.65, 176.06, 174.99, 172.5, 174.46, 176.79, 179.63, 182.15, 190.6, 185.07, 177.66, 167, 166.66, 163.67, 162.96, 165.62, 163.38, 150.92, 157.46, 163.59, 163.95, 167.06, 163.24, 163.42, 165.27, 171.29, 178.35, 172.49, 164.76, 168.95, 174.71, 189.82, 191.41, 192.76, 191.79, 192.04, 196, 200.21, 204.02, 185.34, 185.23, 179.66, 170.28, 173.86, 165.49, 163.99, 154.33, 145.6, 157.14, 151.16, 161.96, 164.03, 152.75, 166.19, 168.47, 171.74, 173.68, 174.67, 166.64, 178.53, 179.53, 180.19, 185.06, 193.18, 189.13, 201.42, 203.9, 206.09, 212.91, 235, 240.8, 254.72, 246.54, 245.35, 236.57, 253.3, 259.92, 281.19, 278.83, 276.41, 299.66, 320.18, 321.27, 309.29, 307.16, 313.51, 315.15, 328.57, 330, 327.93, 338, 322.86, 305.72, 314.98, 311.76, 298.52, 302.28, 301, 274.34, 295.77, 317.24, 341.68, 344.4, 385.69, 400.8, 396.78, 382.97, 380.34, 368.53, 359.68, 368.03, 337.39, 359.91, 357.18, 346.77, 319.74, 356.13, 354.3, 345.9],
  },
  {
    symbol: "AMZN",
    ticker: "AMZN",
    company: "Amazon",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 262.65,
    dailyChange: -0.94,
    weekChange: -4.31,
    monthChange: 5.11,
    ytdChange: 15.96,
    high52w: 284.02,
    low52w: 198.79,
    realizedVol: 51.43,
    sparkline: [167.48, 173.9, 173.46, 173.13, 171.28, 164.16, 164.43, 170.45, 166.78, 168.62, 175.95, 176.26, 183.83, 175.23, 169.49, 172.21, 170.02, 171.07, 166.72, 162.55, 162.14, 142.64, 143.98, 157.64, 153.29, 152.6, 153.79, 145.64, 145.52, 161.25, 164.77, 163.56, 154.46, 151.71, 144.35, 124.28, 114.77, 113.06, 107.59, 115.15, 122.35, 109.65, 106.22, 116.46, 109.56, 115.54, 113.55, 122.42, 134.95, 140.8, 143.55, 138.23, 130.75, 127.51, 133.27, 123.53, 113.78, 113, 114.56, 106.9, 119.32, 103.41, 90.98, 100.79, 94.14, 93.41, 94.13, 89.09, 87.86, 85.25, 84, 86.08, 98.12, 97.25, 102.24, 103.39, 97.61, 97.2, 93.5, 94.9, 90.73, 98.95, 98.13, 103.29, 102.06, 102.51, 106.96, 105.45, 105.66, 110.26, 116.25, 120.11, 124.25, 123.43, 125.49, 129.33, 130.36, 129.78, 134.68, 130, 132.21, 139.57, 138.41, 133.22, 133.26, 138.12, 138.23, 140.39, 129.12, 127.12, 127.96, 129.79, 125.17, 127.74, 138.6, 143.56, 145.18, 146.74, 147.03, 147.42, 149.97, 153.42, 151.94, 145.24, 154.62, 155.34, 159.12, 171.81, 174.45, 169.51, 174.99, 178.22, 175.35, 174.42, 178.87, 180.38, 185.07, 186.13, 174.63, 179.62, 186.21, 187.48, 184.7, 180.75, 176.44, 184.3, 183.66, 189.08, 193.25, 200, 194.49, 183.13, 182.5, 167.9, 166.94, 177.06, 177.04, 178.5, 171.39, 186.49, 191.6, 187.97, 186.51, 188.82, 188.99, 187.83, 197.93, 208.18, 202.61, 197.12, 207.89, 227.03, 227.46, 224.92, 223.75, 224.19, 218.94, 225.94, 234.85, 237.68, 229.15, 228.68, 216.58, 212.28, 199.25, 197.95, 196.21, 192.72, 171, 184.87, 172.61, 188.99, 189.98, 193.06, 205.59, 200.99, 205.01, 213.57, 212.1, 209.69, 223.3, 223.41, 225.02, 226.13, 231.44, 214.75, 222.69, 231.03, 228.84, 229, 232.33, 228.15, 231.48, 219.78, 219.51, 216.37, 213.04, 224.21, 244.22, 244.41, 234.69, 220.69, 233.22, 229.53, 226.19, 227.35, 232.52, 226.5, 247.38, 239.12, 239.16, 239.3, 210.32, 198.79, 210.11, 210, 213.21, 207.67, 205.37, 199.34, 209.77, 238.38, 250.56, 263.99, 268.26, 272.68, 264.14, 266.32, 270.64, 246.03, 238.55, 244.39, 232.69, 242.67, 245.34, 247.23, 232.11, 271.58, 274.48, 262.65],
  },
  {
    symbol: "META",
    ticker: "META",
    company: "Meta Platforms",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 589.85,
    dailyChange: -0.86,
    weekChange: -0.38,
    monthChange: -11.24,
    ytdChange: -9.31,
    high52w: 785.23,
    low52w: 525.72,
    realizedVol: 47.48,
    sparkline: [372.63, 376.26, 378.69, 364.72, 352.96, 343.01, 330.05, 324.76, 324.61, 323.57, 341.13, 340.89, 345.3, 333.12, 306.84, 329.75, 333.79, 335.24, 336.35, 331.79, 331.9, 303.17, 301.71, 237.09, 219.55, 206.16, 210.48, 200.06, 187.61, 216.49, 221.82, 224.85, 222.33, 210.18, 184.11, 200.47, 203.77, 198.62, 193.54, 195.13, 190.78, 175.57, 163.74, 170.16, 160.03, 170.88, 164.7, 169.27, 159.1, 167.11, 180.5, 167.96, 161.78, 160.32, 169.15, 146.29, 140.41, 135.68, 133.45, 126.76, 130.01, 99.2, 90.79, 113.02, 112.05, 111.41, 123.49, 115.9, 119.43, 118.04, 120.34, 130.02, 136.98, 139.37, 151.74, 186.53, 174.15, 172.88, 170.39, 185.25, 179.51, 195.61, 206.01, 211.94, 216.1, 221.49, 212.89, 240.32, 232.78, 233.81, 245.64, 262.04, 272.61, 264.95, 281, 288.73, 286.98, 290.53, 308.87, 294.26, 325.48, 310.73, 301.64, 283.25, 285.5, 296.38, 297.89, 300.31, 299.08, 300.21, 315.43, 314.69, 308.65, 296.73, 314.6, 328.77, 335.04, 338.23, 324.82, 332.75, 334.92, 353.39, 353.96, 351.95, 374.49, 383.45, 394.14, 474.99, 468.11, 473.32, 484.03, 502.3, 505.95, 484.1, 509.58, 485.58, 527.34, 511.9, 481.07, 443.29, 451.96, 476.2, 471.91, 478.22, 466.83, 492.96, 504.16, 494.78, 504.22, 539.91, 498.87, 476.79, 465.7, 488.14, 517.77, 527.42, 528, 521.31, 500.27, 524.62, 561.35, 567.36, 595.94, 589.95, 576.47, 573.25, 567.16, 589.34, 554.08, 559.14, 574.32, 623.77, 620.35, 585.25, 599.81, 604.63, 615.86, 612.77, 647.49, 689.18, 714.52, 736.67, 683.55, 668.2, 625.66, 607.6, 596.25, 576.74, 504.73, 543.57, 501.48, 547.27, 597.02, 592.49, 640.34, 627.06, 647.49, 697.71, 682.87, 682.35, 733.63, 719.01, 717.51, 704.28, 712.68, 750.01, 769.3, 785.23, 754.79, 738.7, 752.45, 755.59, 778.38, 743.75, 710.56, 705.3, 716.92, 738.36, 648.35, 621.71, 609.46, 594.25, 647.95, 673.42, 644.23, 658.77, 663.29, 650.41, 653.06, 620.25, 658.76, 716.5, 661.46, 639.77, 655.66, 648.18, 644.86, 613.71, 593.66, 525.72, 574.46, 629.86, 688.55, 675.03, 608.75, 609.63, 614.23, 610.26, 632.51, 593, 566.98, 577.22, 550.25, 582.9, 669.21, 646.01, 595.19, 556.71, 592.1, 589.85],
  },
  {
    symbol: "PLTR",
    ticker: "PLTR",
    company: "Palantir",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 174.04,
    dailyChange: -2.78,
    weekChange: 1.18,
    monthChange: 29.46,
    ytdChange: 3.68,
    high52w: 207.18,
    low52w: 107.27,
    realizedVol: 91.05,
    sparkline: [25.71, 26.64, 26.28, 28.71, 28.56, 24.33, 23.5, 24, 24.43, 25.88, 26, 22.83, 21.41, 21.03, 18.98, 18.94, 19.06, 18.93, 18.21, 16.56, 16.01, 13.53, 12.71, 12.94, 13.13, 11.02, 11.47, 10.96, 11.39, 12.82, 12.97, 13.83, 12.7, 12.42, 11.96, 10.4, 9.48, 8.34, 8.08, 8.85, 8.94, 8.26, 8.24, 10.19, 9.27, 10.17, 9.04, 9.84, 10.35, 11.45, 9.91, 8.51, 7.94, 7.4, 7.79, 7.78, 7.4, 8.13, 8.15, 7.53, 8.29, 8.64, 7.93, 8.41, 7.39, 7.28, 7.66, 7.11, 6.9, 6.29, 6.42, 6.4, 6.96, 7.02, 7.55, 8.41, 7.51, 9.2, 8.09, 8.33, 7.35, 7.88, 8.2, 8.45, 8.09, 8.81, 8.18, 7.75, 7.41, 9.5, 11.71, 13.65, 14.52, 15.02, 16.3, 14.03, 15.33, 15.34, 16.4, 16.43, 17.81, 18.2, 15.41, 14.4, 14.53, 15.18, 15.13, 15.33, 14.13, 16, 16.61, 17.36, 16.11, 15.07, 18.89, 19.67, 20.49, 19.2, 20.27, 17.77, 18.2, 17.41, 17.17, 15.98, 16.76, 16.78, 16.35, 17.02, 24.38, 24.44, 22.97, 24.93, 26.04, 23.49, 24.18, 23.01, 22.96, 22.67, 20.47, 22.52, 23.33, 20.6, 21.76, 21.01, 21.68, 23.31, 23.57, 23.84, 25.33, 27.23, 28.07, 28.58, 27.18, 24.74, 30.01, 32.08, 31.78, 31.48, 30.33, 35.59, 37.2, 36.84, 40.01, 43.51, 42.97, 44.86, 41.92, 58.39, 65.77, 64.35, 67.08, 76.34, 76.07, 80.55, 79.08, 79.89, 67.26, 71.77, 78.98, 82.49, 110.85, 119.16, 101.35, 84.92, 84.91, 86.24, 90.96, 85.85, 74.01, 88.55, 93.78, 112.78, 124.28, 117.3, 129.52, 123.31, 131.78, 127.72, 137.4, 137.3, 130.74, 134.36, 142.1, 153.52, 158.8, 154.27, 186.96, 177.17, 158.74, 156.71, 153.11, 171.43, 182.39, 177.57, 173.07, 175.44, 178.15, 184.63, 200.47, 177.93, 174.01, 154.85, 168.45, 181.76, 183.57, 193.38, 188.71, 167.86, 177.49, 170.96, 169.6, 146.59, 135.9, 131.41, 135.24, 137.19, 157.16, 150.95, 150.68, 143.06, 148.46, 128.06, 146.39, 143.09, 144.07, 137.8, 133.99, 136.88, 156.54, 135.53, 127.99, 128.47, 112.93, 129.3, 126.79, 132.38, 122.92, 123.06, 172.01, 174.04],
  },
  {
    symbol: "NOW",
    ticker: "NOW",
    company: "ServiceNow",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 124,
    dailyChange: -2.55,
    weekChange: -0.7,
    monthChange: 19.22,
    ytdChange: -15.9,
    high52w: 192.23,
    low52w: 83,
    realizedVol: 56.33,
    sparkline: [126.48, 135.73, 129.6, 130.21, 133.26, 126.56, 123.52, 132.64, 137.33, 139.55, 138.4, 138.28, 135.19, 129.91, 122.62, 129.4, 123.13, 129.71, 129.82, 113.28, 106.2, 101.55, 112.22, 115.5, 116.74, 111.2, 116.05, 109.41, 102.43, 115.98, 112.37, 109.74, 103.12, 101.47, 94.28, 95.62, 91.35, 90.53, 86.61, 95.26, 98.5, 94.63, 88.76, 100.82, 96.87, 98.83, 87.12, 89.35, 89.33, 98.97, 101.3, 95.25, 88.94, 86.9, 94.01, 85.16, 75.41, 75.52, 80.24, 68.35, 72.13, 84.08, 72.35, 81.98, 79.88, 81.44, 82.57, 78.72, 78.87, 76.37, 77.65, 73.31, 82.98, 88.37, 91.77, 94.44, 91.67, 87.8, 85.12, 88.8, 83.02, 88.2, 86.58, 92.94, 94.63, 92.61, 94.66, 91.88, 86.96, 91.04, 102.06, 107.49, 109.64, 106.81, 113.1, 108.6, 112.39, 110.6, 116.08, 116.4, 113.91, 110.33, 111.49, 108.3, 112.73, 118.18, 120.01, 115.92, 110.82, 111.79, 112.14, 109.93, 108.5, 110.8, 121.35, 126.95, 130.87, 134.78, 138.16, 139.82, 139.65, 139.51, 141.3, 135.23, 145.84, 149.82, 153.89, 156.26, 162.59, 153, 154.19, 154.73, 151.54, 148.78, 154.83, 152.48, 156.7, 153.74, 142.78, 144.71, 143.33, 145.96, 153.01, 147.7, 131.39, 139.76, 145.72, 149.87, 157.33, 161.29, 151.7, 150.24, 165.52, 158.13, 162.22, 165.51, 165.65, 171, 165.01, 175.79, 187.47, 176.36, 183.54, 187.72, 184.35, 190.17, 188.68, 201.62, 202.28, 212.12, 209.89, 224.87, 224.22, 218.25, 216.29, 214.75, 204.91, 214.3, 225, 203.68, 201.66, 197.33, 187.68, 185.95, 170.13, 168.87, 165.55, 159.55, 144.33, 157.13, 154.43, 189.05, 195.47, 196.01, 208.04, 200.87, 202.22, 206.04, 197.73, 194.28, 204.48, 208.94, 187.76, 192.68, 193.76, 182.87, 174.5, 173.45, 177.35, 183.49, 182.76, 185.79, 192.23, 187.2, 182.47, 177.74, 180.72, 186.03, 183.86, 172.37, 170.09, 162.69, 162.48, 170.87, 173.01, 155.31, 153.89, 147.45, 141.8, 127.31, 133.11, 117.01, 100.74, 107.08, 104.27, 108.01, 124.34, 113.62, 110.38, 99.41, 102, 83, 96.66, 90.17, 91.16, 91.18, 95.07, 102.13, 124.37, 112.45, 102.15, 95.04, 98.34, 106.32, 107.71, 103.24, 98.78, 111.23, 124.88, 124],
  },
  {
    symbol: "BABA",
    ticker: "BABA",
    company: "Alibaba (ADR)",
    layer: "platform",
    country: "China",
    flag: "🇨🇳",
    currency: "USD",
    value: 123.81,
    dailyChange: 1.35,
    weekChange: -3.58,
    monthChange: 5.38,
    ytdChange: -20.5,
    high52w: 189.34,
    low52w: 94.81,
    realizedVol: 46.07,
    sparkline: [159.47, 170.3, 168.1, 160.05, 145.08, 144.2, 161.52, 168, 177.7, 164.94, 158.73, 166.81, 140.34, 133.35, 111.96, 125.06, 122.1, 118.66, 118.79, 129.81, 131.57, 123.23, 115.23, 122.22, 122.25, 118.99, 107.94, 100.6, 86.71, 108.3, 112.99, 110.2, 103.53, 95.49, 86.49, 97.09, 90.05, 87.99, 86.79, 93.41, 93.21, 109.84, 102.24, 117.62, 116, 120.9, 102.44, 100.61, 89.37, 92.56, 94.77, 89.63, 98, 91.8, 92.14, 86.43, 78.8, 79.99, 81.24, 73.02, 72.18, 63.74, 69.81, 70.77, 80.48, 75.5, 90.06, 91.34, 86.79, 85.65, 88.09, 107.4, 117.01, 119.86, 118.38, 106.33, 103.65, 100.01, 89, 89.7, 82.96, 81.67, 86.9, 102.18, 102.74, 94.55, 89.13, 84.69, 83.22, 85.34, 83.98, 80.97, 84.27, 85.5, 92.1, 84.92, 83.35, 90.55, 94.56, 92.17, 100.55, 96.9, 95.72, 88.03, 89.82, 95.01, 90.05, 87.07, 88.3, 86.74, 86.06, 84.02, 79.94, 82.82, 85.31, 82.75, 77.6, 78.49, 73.99, 72.14, 74.51, 75.28, 77.51, 73.01, 71.84, 69.42, 74.01, 71.85, 72.02, 73.91, 75.96, 74.62, 73.55, 73.42, 72.13, 72.36, 71.66, 71.29, 69.07, 75.55, 81.33, 80.04, 88.54, 81.26, 78.34, 78.41, 73.35, 73.67, 72, 74.52, 79.65, 75.27, 76.53, 77.45, 79.99, 83.18, 85.41, 83.34, 81.18, 84.69, 88.29, 107.33, 114.53, 110.14, 102.43, 97.42, 97.58, 94.19, 88.59, 83.13, 87.37, 85.93, 87.82, 82.28, 85.06, 85.54, 80.53, 85.12, 89.14, 98.84, 103.51, 124.73, 143.75, 132.51, 140.62, 141.1, 135.14, 132.43, 116.54, 107.73, 108.87, 120.28, 125.76, 125.33, 123.46, 120.73, 113.84, 119.38, 112.87, 113.01, 114.08, 108.7, 106.72, 120.23, 120.03, 117.07, 120.36, 121.26, 122.94, 135, 135.58, 155.06, 162.81, 171.91, 188.03, 159.01, 167.05, 174.7, 170.43, 166.34, 153.8, 152.93, 157.3, 158.32, 155.68, 149.79, 152.24, 155.74, 150.96, 165.4, 173.23, 169.56, 162.51, 155.73, 154.45, 144.11, 130.79, 135.21, 122.41, 122.69, 122.05, 127.33, 141.01, 135.82, 131.5, 140.06, 132.59, 130, 124.22, 121.06, 112.82, 107.1, 94.81, 96.14, 112.33, 114.97, 112.14, 122.25, 128.41, 123.81],
  },
  {
    symbol: "NVDA",
    ticker: "NVDA",
    company: "NVIDIA",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 225.16,
    dailyChange: -0.06,
    weekChange: 0.54,
    monthChange: 8.56,
    ytdChange: 19.23,
    high52w: 235.74,
    low52w: 165.17,
    realizedVol: 39.34,
    sparkline: [22.64, 22.84, 22.48, 21.9, 22.08, 20.74, 20.83, 21.86, 22.73, 25.57, 29.75, 30.39, 32.99, 31.5, 30.69, 30.2, 27.8, 29.64, 29.41, 27.25, 26.94, 23.37, 22.84, 24.32, 23.95, 23.64, 24.16, 22.94, 22.1, 26.45, 27.69, 26.71, 23.12, 21.26, 19.51, 18.55, 18.67, 17.71, 16.69, 18.81, 18.72, 16.97, 15.88, 17.13, 14.52, 15.84, 15.76, 17.32, 18.16, 18.99, 18.71, 17.85, 16.26, 13.65, 14.39, 13.2, 12.52, 12.14, 12.08, 11.23, 12.47, 13.83, 14.16, 16.33, 15.41, 16.27, 16.88, 17, 16.57, 15.21, 14.61, 14.86, 16.9, 17.84, 20.36, 21.1, 21.26, 21.39, 23.29, 23.89, 22.97, 25.73, 26.78, 27.78, 27.04, 26.76, 27.12, 27.75, 28.68, 28.34, 31.26, 38.95, 39.33, 38.77, 42.69, 42.21, 42.3, 42.5, 45.47, 44.31, 46.75, 44.68, 40.85, 43.3, 46.02, 48.51, 45.57, 43.9, 41.61, 43.5, 45.76, 45.46, 41.39, 40.5, 45.01, 48.33, 49.3, 47.78, 46.76, 47.51, 48.89, 48.83, 49.52, 49.1, 54.71, 59.49, 61.03, 66.16, 72.13, 72.61, 78.82, 82.28, 87.53, 87.84, 94.29, 90.36, 88.01, 88.19, 76.2, 87.74, 88.79, 89.88, 92.48, 106.47, 109.63, 120.89, 131.88, 126.57, 123.54, 125.83, 129.24, 117.93, 113.06, 107.27, 104.75, 124.58, 129.37, 119.37, 102.83, 119.1, 116, 121.4, 124.92, 134.8, 138, 141.54, 135.4, 147.63, 141.98, 141.95, 138.25, 142.44, 134.25, 134.7, 137.01, 144.47, 135.91, 137.71, 142.62, 120.07, 129.84, 138.85, 134.43, 124.92, 112.69, 121.67, 117.7, 109.67, 94.31, 110.93, 101.49, 111.01, 114.5, 116.65, 135.4, 131.29, 135.13, 141.72, 141.97, 143.85, 157.75, 159.34, 164.92, 172.41, 173.5, 173.72, 182.7, 180.45, 177.99, 174.18, 167.02, 177.82, 176.67, 178.19, 187.62, 183.16, 183.22, 186.26, 202.49, 188.15, 190.17, 178.88, 177, 182.41, 175.02, 180.99, 190.53, 188.85, 184.86, 186.23, 187.67, 191.13, 185.41, 182.81, 189.82, 177.19, 177.82, 180.25, 172.7, 167.52, 177.39, 188.63, 201.68, 208.27, 198.45, 215.2, 225.32, 215.33, 211.14, 205.1, 205.19, 210.69, 192.53, 194.83, 210.96, 202.81, 206.84, 200.75, 223.96, 225.16],
  },
  {
    symbol: "AVGO",
    ticker: "AVGO",
    company: "Broadcom",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 392.99,
    dailyChange: -5.94,
    weekChange: -8.13,
    monthChange: 4.95,
    ytdChange: 13.05,
    high52w: 481.57,
    low52w: 289.6,
    realizedVol: 44.88,
    sparkline: [49.59, 49.77, 49.81, 50.6, 50.49, 48.74, 49.28, 50.33, 51.54, 53.17, 55.89, 56.32, 56.87, 54.66, 55.81, 63.17, 63.5, 66.48, 66.54, 61.92, 59.64, 53.32, 56.01, 59.02, 57.34, 58, 58.8, 59.6, 57.78, 61.04, 62.89, 62.7, 58.7, 57.38, 58.69, 55.44, 58.01, 58.82, 54.32, 58.33, 56.33, 54.13, 49.87, 50.91, 47.78, 49.87, 49.45, 51.25, 53.55, 55.14, 55.82, 54.84, 52.09, 50.02, 52.24, 50.25, 46.87, 44.4, 46.05, 42.71, 44.97, 47.29, 46.53, 51.81, 51.52, 52.99, 54.08, 54.47, 55.59, 55.24, 55.91, 58.84, 57.9, 57.08, 59.1, 59.76, 59.33, 59.56, 57.78, 63.28, 61.48, 63.1, 63.62, 64.15, 62.26, 61.95, 63.29, 62.65, 63.01, 63.12, 68.22, 81.27, 81.2, 80.46, 86.81, 82.21, 86.74, 84.68, 88.86, 89.68, 89.98, 88.17, 82.98, 82.58, 85.18, 87.25, 85.75, 85.17, 82.91, 83.06, 84.53, 88.32, 85.36, 83.84, 88.27, 95.75, 97.77, 97.89, 93, 94.43, 112.97, 112.2, 111.62, 104.93, 110.77, 121.12, 120.49, 122.43, 128.34, 124.55, 129.64, 139.92, 130.87, 123.55, 135.35, 132.54, 133.94, 134.41, 120.47, 134.41, 127.81, 133.28, 139.53, 140.78, 132.85, 140.66, 173.5, 165.86, 160.55, 170.33, 170.07, 157.35, 151.63, 143.82, 148.26, 165.72, 166.36, 162.82, 137, 167.69, 171.1, 172.69, 176.64, 181.48, 179.89, 173, 168.92, 183.64, 164.84, 164.23, 162.08, 179.53, 224.8, 220.79, 241.75, 232.55, 224.31, 237.44, 244.7, 221.27, 224.87, 233.04, 218.66, 199.43, 194.96, 195.54, 191.66, 169.12, 146.29, 181.94, 170.99, 192.31, 203.64, 208.2, 228.61, 228.72, 242.07, 246.93, 248.7, 249.99, 269.35, 275.18, 274.38, 283.34, 290.18, 288.64, 304.97, 306.34, 294, 297.39, 334.89, 359.87, 344.94, 334.53, 338.37, 324.63, 349.33, 354.13, 369.63, 349.43, 342.46, 340.2, 402.96, 390.24, 359.93, 340.36, 352.13, 347.62, 344.97, 351.71, 320.05, 331.3, 332.92, 325.17, 332.65, 319.55, 330.48, 322.16, 310.51, 300.68, 314.55, 371.55, 406.54, 422.76, 421.28, 430, 425.19, 414.14, 446.77, 385.73, 382.07, 411.35, 365.02, 360.45, 399.97, 370.83, 381.92, 389.28, 427.76, 392.99],
  },
  {
    symbol: "AMD",
    ticker: "AMD",
    company: "AMD",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 514.39,
    dailyChange: 6.5,
    weekChange: 6.42,
    monthChange: 2.68,
    ytdChange: 130.18,
    high52w: 580.91,
    low52w: 151.14,
    realizedVol: 78.83,
    sparkline: [111.4, 109.92, 105.2, 103.88, 105.8, 102.45, 105.06, 112.12, 119.82, 120.23, 136.34, 147.89, 155.41, 154.81, 144.01, 138.55, 137.75, 146.14, 143.9, 132, 136.88, 118.81, 105.24, 123.6, 113.18, 113.83, 121.06, 108.41, 104.29, 113.46, 119.67, 108.19, 101, 93.06, 88.14, 85.52, 95.34, 95.12, 93.5, 102.26, 106.3, 94.82, 81.57, 87.08, 73.67, 79.35, 81.11, 88.1, 94.47, 102.31, 100.83, 95.95, 91.18, 80.24, 85.45, 76.51, 67.96, 63.36, 58.44, 55.94, 58.82, 62.01, 62.19, 72.37, 73.57, 75.14, 74.98, 68.59, 65.41, 64.52, 64.77, 63.96, 71, 70.07, 75.4, 86.09, 81.48, 78.5, 78.09, 81.52, 82.67, 97.84, 97.95, 98.01, 92.47, 91.75, 88.43, 89.37, 89.84, 95.26, 105.82, 127.03, 117.86, 124.92, 120.08, 110.01, 113.91, 113.17, 115.94, 110.95, 112.96, 115.82, 107.57, 105.45, 102.25, 109.45, 106.09, 101.49, 96.2, 102.82, 107.24, 105.09, 101.81, 96.43, 112.25, 118.59, 120.62, 122.31, 121.39, 128.92, 139.15, 139.6, 147.41, 138.58, 146.56, 174.23, 177.25, 177.66, 172.48, 173.87, 176.52, 202.64, 207.39, 191.06, 179.65, 180.49, 170.42, 163.28, 146.64, 157.4, 150.6, 151.92, 164.47, 166.36, 166.9, 167.87, 159.63, 161.23, 162.21, 171.9, 181.61, 151.58, 139.99, 132.5, 134.27, 148.56, 154.98, 148.56, 134.35, 152.31, 155.95, 164.35, 170.9, 167.89, 155.97, 156.23, 141.86, 147.95, 134.9, 138.35, 137.18, 138.59, 126.91, 119.21, 125.19, 125.37, 116.04, 121.46, 122.84, 115.95, 107.56, 113.1, 110.84, 99.86, 100.31, 100.97, 106.44, 103.22, 85.76, 93.4, 87.5, 96.65, 98.8, 102.84, 117.17, 110.31, 110.73, 116.19, 116.16, 128.24, 143.81, 137.91, 146.42, 156.99, 166.47, 171.7, 172.76, 177.51, 167.76, 162.63, 151.14, 158.57, 157.39, 159.46, 164.67, 214.9, 233.08, 252.92, 256.12, 233.54, 246.81, 203.78, 217.53, 217.97, 210.78, 213.43, 214.99, 223.47, 203.17, 231.83, 259.68, 236.73, 208.44, 207.32, 200.15, 200.21, 192.43, 193.39, 201.33, 201.99, 217.5, 245.04, 278.39, 347.81, 360.54, 455.19, 424.1, 467.51, 516.1, 466.38, 511.57, 537.37, 521.58, 517.82, 557.89, 495.76, 521.95, 476.15, 483.36, 514.39],
  },
  {
    symbol: "TSM",
    ticker: "TSM",
    company: "TSMC (ADR)",
    layer: "silicon",
    country: "Taiwan",
    flag: "🇹🇼",
    currency: "USD",
    value: 426.35,
    dailyChange: -0.96,
    weekChange: 1.5,
    monthChange: 4.05,
    ytdChange: 33.4,
    high52w: 477.57,
    low52w: 227.33,
    realizedVol: 40.96,
    sparkline: [118.49, 123.97, 122.97, 117.75, 115.64, 111.56, 110.04, 114.86, 114.23, 113.7, 117.8, 118.69, 124.26, 117.09, 119.33, 119.13, 116.32, 120.68, 120.31, 123.5, 140.66, 124.53, 117.61, 121.02, 121.01, 119.31, 111.23, 105.06, 101.41, 106.72, 106.73, 102.79, 99.29, 98.36, 95.68, 92.93, 91.63, 90.96, 90.78, 93.77, 93.77, 88.68, 85, 85.92, 77, 81.51, 85.63, 86.32, 88.48, 89.77, 90.86, 87.2, 84.74, 80.9, 81.53, 77.89, 73.87, 68.56, 69.75, 63.92, 63.75, 62.01, 62.48, 73.83, 82.27, 81.4, 81.5, 80.69, 76.3, 74.89, 74.49, 78.07, 86.8, 91.03, 93.3, 94.66, 95.37, 90.1, 88.11, 89.79, 87.25, 89.47, 92.79, 93.02, 90.24, 87.2, 85.37, 84.3, 84.97, 83.43, 92.58, 103.21, 98.94, 102.8, 104.57, 101.91, 100.92, 100.23, 105.14, 97.25, 100.86, 96.16, 91.99, 91.1, 93.1, 93.19, 89.64, 89.25, 85.64, 86.9, 89.29, 90.46, 91.31, 85.99, 91.79, 97.44, 99.58, 97.83, 98.55, 100.35, 102.54, 103.15, 104, 99.61, 101.24, 114.2, 117.26, 115.75, 133.11, 126.69, 129.53, 133.9, 146.37, 136.98, 140.54, 136.05, 141.36, 142.52, 127.7, 138.3, 141.56, 149.26, 151.68, 160, 151.04, 164.39, 172.51, 173.96, 173.81, 183.99, 187.35, 165.77, 161.94, 149.86, 167.12, 174.54, 171.28, 171.7, 156.82, 172.5, 174.08, 177.97, 181.16, 190.81, 200.78, 203.44, 192.95, 201.2, 186.01, 190.08, 184.66, 203.02, 200.99, 197.21, 201.63, 208.61, 208.37, 211.5, 221.88, 209.32, 206.12, 203.9, 198.24, 180.53, 177.1, 174.09, 176.73, 165.25, 146.8, 157.08, 151.74, 165.1, 179.28, 176.52, 194.22, 191.98, 193.32, 205.18, 211.1, 209.51, 228.57, 234.8, 230.4, 240.4, 245.6, 235.21, 241.83, 238.88, 232.99, 230.87, 243.41, 259.33, 264.87, 273.36, 292.19, 280.66, 295.08, 294.96, 300.43, 286.5, 284.82, 275.06, 291.51, 294.72, 292.04, 288.95, 302.84, 319.61, 323.63, 342.4, 334.87, 330.56, 348.85, 366.36, 370.54, 374.58, 338.89, 338.31, 329.24, 326.74, 339.04, 370.6, 370.5, 402.46, 397.67, 411.68, 404.35, 404.52, 418.45, 415.17, 423.93, 462.12, 432.35, 434.16, 434.11, 398.37, 403.41, 404.25, 420.04, 426.35],
  },
  {
    symbol: "ASML",
    ticker: "ASML",
    company: "ASML (ADR)",
    layer: "silicon",
    country: "Netherlands",
    flag: "🇳🇱",
    currency: "USD",
    value: 1844.08,
    dailyChange: -0.21,
    weekChange: 5.92,
    monthChange: 3.32,
    ytdChange: 58.46,
    high52w: 1989.44,
    low52w: 725.85,
    realizedVol: 45.51,
    sparkline: [832.92, 858.11, 858.87, 859.85, 868.82, 741.81, 730.27, 789.4, 800.97, 812.88, 847, 851.63, 857.17, 782.02, 771.52, 781.84, 749.87, 801.41, 796.14, 756.1, 744.53, 694.73, 644.97, 652.81, 628.24, 647.83, 667.12, 594.32, 585.85, 679.86, 687.36, 667.73, 610.93, 597.87, 607.61, 563.77, 551, 548.32, 532.84, 583.38, 563.65, 521.53, 473.35, 515.26, 449.83, 452.95, 475.63, 534.26, 574.44, 577.31, 575.96, 545.26, 509.94, 467.19, 501, 467.25, 436.14, 415.35, 434.26, 379.13, 462.23, 489.18, 468.76, 576.44, 593.16, 591.84, 605.71, 597.7, 574.32, 551.37, 546.4, 595.85, 659.69, 648.85, 667.39, 679.62, 656.35, 651.93, 618.38, 637.38, 601.21, 633.69, 647.53, 680.71, 657.12, 666.2, 634.47, 636.86, 650.32, 647.51, 694, 735.93, 724.65, 715.86, 721.88, 697.89, 724.75, 696.74, 754.02, 693.36, 718.37, 678.04, 661.78, 655.33, 651.01, 662.52, 627.86, 596.66, 587.1, 588.66, 597.36, 599.75, 580.1, 590, 642.41, 661.28, 686.09, 691.18, 692.2, 696.43, 752.96, 752.53, 756.92, 703.34, 713.22, 757.83, 867.75, 890.66, 949.6, 928.94, 933.25, 990.94, 994.33, 940.21, 979.96, 970.47, 979.55, 961.84, 859.54, 918.97, 901.63, 930.29, 924.97, 956.22, 960.35, 1028.42, 1027.9, 1036.6, 1022.73, 1074.48, 1085.26, 895.37, 888.39, 809.35, 860.55, 918.66, 907.26, 903.87, 752.79, 816.36, 795.28, 841.54, 833, 840.69, 723.26, 711.7, 674.73, 669.47, 658.63, 672.88, 686.61, 708.98, 718.58, 705.68, 713.59, 714.36, 739.01, 756.33, 732.25, 739.31, 727.7, 751.55, 737.21, 709.08, 732.22, 714, 716.22, 674.58, 605.55, 668.81, 640.16, 677.27, 690.33, 706.21, 748.1, 732.49, 736.77, 753.02, 761, 756.53, 795.95, 794.5, 801.93, 734.58, 711.25, 689.82, 722.32, 742.16, 754.89, 742.62, 781.7, 813.87, 932.15, 951.52, 1032.22, 936.19, 1029.27, 1033.1, 1059.23, 1016.96, 1006.98, 966.57, 1060, 1099.47, 1080.85, 1056.02, 1072.75, 1163.78, 1273.88, 1358.57, 1389.04, 1423, 1413.01, 1406.61, 1469.59, 1450.56, 1292.8, 1345.69, 1317.25, 1302.47, 1317.23, 1478.28, 1459.8, 1457.7, 1427.02, 1592.02, 1501.81, 1632.9, 1612.76, 1641.74, 1863.55, 1929.68, 1794.62, 1769.32, 1797.32, 1747.58, 1757.09, 1629, 1740.99, 1844.08],
  },
  {
    symbol: "MU",
    ticker: "MU",
    company: "Micron",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 971.66,
    dailyChange: 2.3,
    weekChange: 10.72,
    monthChange: 13.88,
    ytdChange: 208.05,
    high52w: 1213.56,
    low52w: 115.79,
    realizedVol: 94.17,
    sparkline: [74, 73.81, 73.5, 74.3, 74.05, 70.99, 70.12, 67.68, 67.51, 69.1, 72.92, 77.3, 83.03, 83.42, 81.62, 85.54, 83, 94.42, 93.15, 94.45, 97.36, 81.93, 79.27, 81.17, 89.76, 90.8, 90.1, 81.91, 72.82, 79.41, 78.1, 76.18, 72.14, 70.13, 69.41, 68.19, 70.35, 71.92, 68.9, 73.32, 69.94, 62.62, 55.75, 58.44, 53.65, 59.14, 61.53, 61.29, 61.86, 62.46, 65.04, 60.51, 57.63, 56.33, 57.44, 52.85, 50.1, 50.1, 52.91, 52.72, 56.05, 54.04, 56.16, 62.52, 58.58, 58.41, 54.68, 54.87, 52.07, 50.2, 49.98, 56.77, 56.93, 58.46, 63.87, 62.41, 59.82, 59.01, 58.18, 56.78, 54.93, 56.66, 61.16, 60.34, 58.56, 62.63, 61.13, 64.36, 61.23, 60.92, 68.17, 73.93, 69.17, 65.43, 67.66, 65.28, 63.11, 60.65, 64.08, 65.65, 71.2, 69.91, 64.37, 63.59, 63.72, 70.39, 70.18, 69.88, 68.88, 68.03, 69.96, 69.21, 67.22, 65.65, 72.58, 75.36, 77.56, 76.87, 75.93, 74.96, 81.41, 86.49, 85.34, 83.45, 82.39, 87.51, 88.05, 86.48, 85.56, 79.5, 86, 95.15, 97.62, 93.25, 110.21, 117.89, 123.58, 122.52, 106.77, 114.84, 114.7, 121.24, 125.29, 129.49, 125, 130.94, 141.36, 139.54, 131.53, 131.6, 133.55, 114.26, 109.41, 92.7, 93.08, 107.99, 102.85, 96.24, 86.38, 91.22, 90.9, 107.5, 102.25, 106.92, 111.15, 107.91, 99.73, 111.9, 96.34, 102.64, 97.95, 101.17, 102.5, 90.12, 88.63, 89.87, 99.34, 105.75, 103.19, 91.24, 92.3, 99.52, 98.84, 93.63, 92.96, 100.79, 94.72, 88.44, 64.72, 69.55, 68.8, 79.78, 80.72, 85.86, 98, 93.37, 94.46, 108.56, 115.6, 123.6, 124.76, 122.29, 124.53, 114.39, 111.26, 104.88, 118.89, 120.87, 117.68, 119.01, 131.37, 157.23, 162.73, 157.27, 187.83, 181.6, 202.38, 219.02, 223.77, 237.92, 246.83, 207.37, 236.48, 237.22, 241.14, 265.92, 284.79, 315.42, 345.09, 362.75, 399.65, 414.88, 394.69, 411.66, 428.17, 412.37, 370.3, 426.13, 422.9, 357.22, 366.24, 420.59, 455.07, 496.72, 542.21, 746.81, 724.66, 751, 971, 864.01, 981.61, 1133.99, 1132.33, 975.56, 979.3, 848.95, 920.95, 823.03, 877.57, 971.66],
  },
  {
    symbol: "ARM",
    ticker: "ARM",
    company: "Arm Holdings",
    layer: "silicon",
    country: "United Kingdom",
    flag: "🇬🇧",
    currency: "USD",
    value: 279.44,
    dailyChange: 0.28,
    weekChange: -1.11,
    monthChange: 6.65,
    ytdChange: 143.56,
    high52w: 439.46,
    low52w: 104.55,
    realizedVol: 89.04,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 60.75, 51.32, 53.52, 54.08, 50.78, 47.87, 49.09, 53.49, 52.27, 54.99, 63.88, 63.9, 67.23, 71.03, 72.29, 75.14, 67.05, 70, 78.58, 71.17, 71, 115.21, 128.34, 133.34, 141.62, 131.48, 126.97, 134.15, 124.99, 124.82, 126.33, 87.19, 101.95, 101.7, 108.84, 110.35, 114.64, 120.52, 136.57, 157.89, 160.3, 163.62, 181.19, 181.18, 163.4, 149, 113.45, 117, 130.3, 135.63, 132.88, 117.29, 147.37, 138.9, 145.58, 140.55, 151.46, 153.03, 143.75, 141.48, 147.48, 128.73, 135.99, 134.29, 140.89, 151.91, 132.15, 129.2, 141.08, 140.49, 149.26, 162.52, 159.55, 162.51, 159.54, 144.84, 131.69, 125.55, 117.94, 119.07, 107.8, 87.71, 103.99, 100.73, 113.34, 123.27, 115.8, 135.96, 127.18, 124.54, 133.11, 135.55, 145.04, 165.46, 155.09, 145.94, 156.74, 163.17, 137.58, 138.5, 138.91, 137.92, 138.31, 138.17, 150.64, 142.91, 139.62, 152.64, 154.81, 165.61, 170.68, 169.82, 152.38, 139.77, 131.57, 135.56, 141.31, 130.89, 114.03, 110.27, 114.73, 111.79, 105.78, 116.07, 105.36, 123.7, 125.28, 125.58, 127.45, 114.38, 115.75, 132.35, 144.13, 149.11, 148.93, 166.73, 234.81, 211.18, 213.27, 209.16, 306.51, 353.29, 342.93, 380.81, 439.46, 334.27, 315.28, 323.39, 267.19, 260.01, 239.69, 282.57, 279.44],
  },
  {
    symbol: "MRVL",
    ticker: "MRVL",
    company: "Marvell",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 222.02,
    dailyChange: -0.07,
    weekChange: 1.51,
    monthChange: 17.91,
    ytdChange: 148.37,
    high52w: 316.43,
    low52w: 62.31,
    realizedVol: 87.73,
    sparkline: [61.34, 61.51, 61.17, 62.1, 63.61, 59.83, 64.62, 65.65, 66.31, 68.5, 71.86, 73.48, 74.58, 71.99, 83.59, 89.02, 84.03, 87.68, 87.49, 83.11, 83, 72.55, 66.32, 71.1, 67.99, 67.34, 68.75, 63.41, 63.09, 71.33, 74.37, 71.07, 63.15, 60.97, 58.44, 58.08, 57.75, 57.57, 54.07, 60.82, 58.96, 53.07, 46.04, 48.22, 42.55, 46.99, 48.22, 52.02, 55.68, 56.94, 55.36, 53.14, 50.17, 45.76, 49.74, 46.35, 43.29, 42.91, 42.35, 37.01, 39.54, 41.01, 38.97, 43.35, 44, 42.98, 44.72, 41.5, 38.99, 37.19, 37.04, 36.1, 40.67, 39.48, 44.25, 46.58, 44.55, 44.14, 43.85, 44.04, 38.68, 39.97, 41.07, 43.3, 39.26, 40.29, 39.02, 39.48, 40.97, 40.12, 45.46, 65.51, 60.18, 60.01, 61.12, 57.82, 59.78, 59.15, 63.45, 63.41, 64.91, 62.69, 57.09, 57.59, 53.5, 57.95, 55.74, 54.49, 52.3, 54.13, 54.53, 52.62, 49.47, 47.26, 51.36, 54.62, 55.58, 56.03, 52.8, 52.88, 59.59, 60.25, 60.31, 59.92, 65.68, 71.08, 68.04, 67.53, 68.83, 66.29, 67.58, 77.61, 75.42, 66.87, 66.54, 70.88, 72.65, 70.16, 62.13, 69.62, 68.51, 68.47, 71.92, 76.68, 68.81, 67.99, 73.27, 71.89, 69.9, 72.08, 73.59, 66.51, 65.72, 59.25, 60.56, 69.32, 71.84, 76.24, 66.2, 74.48, 73.87, 70.99, 73.41, 74.01, 79.85, 81.61, 84.77, 93.8, 87.83, 92.51, 92.69, 113.51, 120.77, 111.9, 113.62, 118.18, 114.32, 124.76, 124.02, 112.86, 110.62, 106.51, 103.81, 91.82, 70.84, 68.74, 70.39, 62.04, 49.43, 53.39, 51.7, 58.92, 62.33, 59.65, 63.76, 60.69, 60.19, 68.35, 67.19, 73.51, 77.16, 75.18, 72.71, 74.65, 74.21, 74.45, 77.34, 76.19, 73, 62.87, 63.33, 67.35, 74.26, 83.17, 86.22, 85.61, 87.95, 84.13, 93.74, 90.92, 86.45, 77.45, 89.4, 98.91, 84.43, 84.09, 86.34, 89.39, 83.22, 80.46, 80.23, 78.92, 80.28, 78.61, 79.48, 81.69, 89.57, 87.86, 87.91, 94.88, 107.11, 128.49, 139.69, 164.31, 164.95, 170.13, 176.89, 196.33, 205, 263.47, 279.7, 310.58, 266.77, 245.29, 235.81, 188.68, 194.23, 187.56, 218.72, 222.02],
  },
  {
    symbol: "8035.T",
    ticker: "8035",
    company: "Tokyo Electron",
    layer: "silicon",
    country: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    value: 60090,
    dailyChange: 1.62,
    weekChange: 10.26,
    monthChange: -19.06,
    ytdChange: 62.71,
    high52w: 78800,
    low52w: 19945,
    realizedVol: 72.26,
    sparkline: [15360, 16330, 18183.33, 18476.67, 18143.33, 16300, 15793.33, 16516.67, 16916.67, 17616.67, 18866.67, 19210, 20940, 20280, 19766.67, 20613.33, 20423.33, 21420, 22093.33, 21640, 21740, 19170, 17656.67, 18680, 19050, 18936.67, 18866.67, 18196.67, 17593.33, 19453.33, 21163.33, 20560, 18473.33, 17960, 18493.33, 18493.33, 18443.33, 18996.67, 19463.33, 19706.67, 19986.67, 18553.33, 16013.33, 15576.67, 14220, 14516.67, 14346.67, 15086.67, 15336.67, 16286.67, 15473.33, 15533.33, 15290, 14180, 14310, 13636.67, 13470, 11900, 12943.33, 12220, 12796.67, 12993.33, 12650, 14790, 14863.33, 15340, 15580, 15233.33, 14593.33, 13066.67, 12960, 13723.33, 15030, 14816.67, 15160, 15833.33, 16090, 15396.67, 15923.33, 15710, 16010, 16186.67, 16666.67, 16040, 15400, 15415, 15590, 15495, 15730, 16395, 18530, 19635, 19275, 18910, 20400, 19775, 20560, 20205, 20190, 19300, 20910, 21095, 20450, 20605, 20460, 21435, 21120, 21895, 20410, 20440, 19440, 21210, 20085, 19610, 21060, 22190, 24115, 24005, 23850, 22240, 24370, 24905, 25255, 24120, 26250, 28230, 27970, 28100, 29755, 35350, 36580, 38380, 38360, 35410, 39330, 39580, 37270, 39500, 33530, 34230, 35010, 35000, 36090, 35790, 33630, 34460, 34950, 34920, 34900, 36370, 35700, 31170, 27625, 27055, 25810, 28955, 27105, 25805, 22000, 23680, 24245, 27475, 25355, 25620, 23500, 23220, 22485, 23250, 22300, 22250, 23310, 23950, 23860, 23300, 24380, 24185, 27025, 26655, 27135, 26205, 25500, 24825, 25455, 22125, 21115, 21480, 22365, 21525, 18960, 19640, 19515, 21250, 21140, 22555, 23465, 22755, 23000, 23650, 23800, 23985, 27515, 27175, 27000, 27850, 27960, 22405, 21290, 21505, 20095, 20665, 20240, 22585, 25610, 26545, 28490, 29280, 30080, 30270, 34180, 32800, 31850, 30180, 31800, 33140, 31500, 31200, 34330, 34320, 37910, 42150, 41720, 41310, 41030, 41990, 43960, 44010, 41790, 38340, 39330, 39290, 38420, 44040, 44010, 45850, 47450, 52450, 50290, 49830, 52420, 59450, 68000, 75360, 72920, 73200, 72940, 65100, 62660, 55500, 54500, 59130],
  },
  {
    symbol: "VRT",
    ticker: "VRT",
    company: "Vertiv",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 293.84,
    dailyChange: 2.36,
    weekChange: 7.87,
    monthChange: -0.09,
    ytdChange: 67.33,
    high52w: 376.23,
    low52w: 121.82,
    realizedVol: 78.44,
    sparkline: [28.29, 28.19, 24.53, 23.73, 23.83, 24.54, 22.43, 22.92, 24.07, 25.68, 27.63, 26.71, 26.98, 25.78, 25.51, 25.78, 23.95, 24.86, 24.97, 22.55, 23.29, 21.34, 20.05, 21.33, 21.14, 20.47, 13.2, 10.57, 11.84, 13.4, 12.85, 14.58, 13.54, 12.38, 11.63, 12.53, 12.21, 11.3, 10.84, 11.44, 10.87, 10.09, 9.18, 10.23, 8.29, 9.03, 8.94, 10.61, 11.42, 12.83, 13.52, 12.33, 11.83, 11.21, 13.37, 12.33, 9.95, 9.72, 10.95, 10.22, 13.21, 14.96, 14.18, 15.36, 13.84, 13.74, 14.76, 13.64, 13.14, 12.82, 13.66, 14.12, 14.97, 14.52, 14.38, 14.59, 14.46, 16.06, 15.81, 16.36, 14.24, 13.12, 13.09, 14.31, 12.38, 12.43, 12.18, 14.92, 14.98, 15.1, 15.56, 19.74, 19.8, 21.19, 22.54, 23.64, 24.77, 24.65, 26.35, 25.68, 25.95, 35.71, 33.51, 33.97, 37.5, 39.87, 39.2, 38.17, 36.45, 37.2, 39.77, 39.1, 36.74, 36.42, 40.44, 41.83, 43.29, 42.68, 45.14, 47.14, 47.73, 48.78, 48.03, 46.31, 49.52, 53.67, 53.46, 61.47, 63.52, 62.97, 62.7, 70.57, 69.37, 74.16, 82.5, 81.67, 85.34, 83.89, 75.01, 93.49, 93.01, 95.4, 96.81, 106.17, 98.07, 87.68, 91.48, 90.62, 86.57, 91.78, 89.67, 85.31, 77.12, 69.46, 71.46, 79.42, 78.55, 83.03, 71.77, 85.76, 94.54, 98.41, 105.2, 111.84, 112.25, 112.17, 106.9, 125.75, 120.87, 140.15, 127.6, 133.85, 125.78, 120.04, 115.11, 125.67, 128.93, 135.88, 146.32, 117.02, 121.38, 108.05, 95.99, 95.17, 85.04, 87.45, 88.63, 74.25, 59.41, 69.61, 73.21, 86.95, 95, 94.06, 106.04, 104.14, 107.93, 115.36, 110.97, 118.54, 127.16, 127.84, 123.3, 129.06, 137.47, 141.59, 139.93, 133.07, 125.97, 127.55, 124, 134.84, 143.6, 138.62, 160.2, 169.01, 174, 186.06, 192.86, 179.8, 170.97, 159.83, 179.73, 189.02, 161.27, 159.82, 167.58, 175.61, 163.58, 176.93, 182.49, 186.18, 195.58, 234.53, 243.75, 254.89, 241.78, 258.88, 255.88, 251.07, 261.29, 295.11, 307.34, 323.46, 328.31, 339.97, 370.94, 327.46, 315.71, 300.51, 302.87, 333.05, 303.95, 300.53, 318.86, 289.56, 290.36, 241.57, 272.4, 293.84],
  },
  {
    symbol: "ANET",
    ticker: "ANET",
    company: "Arista Networks",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 198.82,
    dailyChange: -2.36,
    weekChange: 5.38,
    monthChange: 17.95,
    ytdChange: 48.82,
    high52w: 210.5,
    low52w: 116.13,
    realizedVol: 62.92,
    sparkline: [23.3, 22.69, 21.93, 22.45, 22.51, 21.91, 23.25, 24.36, 24.41, 25.61, 33.16, 32.86, 32.24, 31.24, 30.3, 32.67, 33.76, 35.46, 35.94, 32.37, 32.44, 29.66, 30.05, 30.58, 30.23, 31.48, 30.88, 29.64, 29.98, 32.81, 34.6, 34.87, 32.76, 31.65, 29.42, 28.89, 27.75, 27.16, 25.66, 26.47, 25.79, 23.74, 22.74, 24.95, 23.35, 25.75, 25.42, 25.59, 29.16, 31.67, 31.72, 32.5, 30.76, 29.33, 31.1, 28.93, 27.49, 28.22, 29.1, 25.09, 27.63, 30.37, 32.77, 32.14, 33.87, 33.94, 33.76, 31.98, 30.92, 29.94, 30.34, 28.11, 28.75, 28.78, 31.51, 32.99, 33.32, 34.56, 33.88, 35.17, 36.62, 40.81, 42.24, 41.97, 39.96, 40.9, 38.97, 40.04, 34.49, 34.66, 35.98, 42.59, 40.62, 40.63, 39.45, 37.21, 40.51, 39.5, 41.4, 42.91, 37.77, 44.9, 43.74, 45.13, 45.22, 49.34, 49.12, 46.18, 45.08, 45.98, 48.51, 47.46, 46.53, 44.05, 53.12, 51.71, 53.66, 54.6, 54.16, 56.01, 58.9, 59.56, 58.88, 57.73, 63.01, 65.88, 66.1, 68.28, 70.61, 65.44, 66.92, 71.93, 68.28, 69.43, 76.61, 72.5, 74.4, 67.81, 61.52, 66.18, 68.6, 78.51, 79.97, 76.64, 74.41, 74.2, 82.12, 84.34, 87.62, 91.54, 90.47, 82.64, 79.8, 79.83, 83.95, 88.47, 88.78, 88.35, 78.58, 89.94, 96.11, 95.07, 98.99, 104.23, 100.5, 98.52, 98.54, 100.11, 93.6, 101.62, 101.46, 108.25, 112.37, 112.81, 113.03, 115.2, 114.34, 119.95, 129.17, 115.23, 118.47, 106.87, 98.3, 93.05, 83.36, 83.51, 83.13, 77.94, 64.37, 72.67, 71.2, 77.91, 91.02, 86.52, 96.42, 91.2, 86.64, 97.25, 92.35, 86.25, 99.39, 102.52, 108.57, 111.78, 114.28, 117.57, 139.18, 137.3, 133.25, 136.55, 142.85, 139.39, 149.61, 142.5, 145.5, 154.1, 143.1, 153.82, 157.69, 134.65, 131.37, 117.43, 130.68, 128.59, 124.76, 131.12, 131.84, 133.6, 122.89, 129.83, 136.34, 141.74, 137.49, 141.59, 132.79, 133.5, 132.89, 133.57, 131.22, 120.77, 126.68, 147.35, 164.23, 176.91, 172.7, 141.77, 141.97, 154.03, 159.47, 154.27, 163.24, 169.67, 157.6, 159.99, 186.96, 168.61, 173.99, 180.35, 188.67, 198.82],
  },
  {
    symbol: "ETN",
    ticker: "ETN",
    company: "Eaton",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 451.51,
    dailyChange: -0.4,
    weekChange: 0.63,
    monthChange: 13.94,
    ytdChange: 37.95,
    high52w: 459.96,
    low52w: 315.82,
    realizedVol: 48.08,
    sparkline: [170.03, 166.38, 160.39, 157.53, 156.01, 150.65, 153.56, 161.45, 162.38, 164.76, 171.3, 171.8, 172.3, 167.51, 166.44, 170.46, 165.07, 168.04, 172.82, 167.85, 170.92, 160.54, 156.69, 151, 150.66, 153.36, 154.12, 149.78, 146.92, 155.58, 154.18, 151.81, 145.18, 139.91, 146.04, 145.02, 147.29, 141.33, 134.14, 139.82, 140.35, 137.03, 125.52, 131.83, 127.37, 127.82, 128.99, 136.65, 148.39, 148.65, 152.44, 150.84, 141.08, 137.3, 145.71, 138.27, 134.14, 133.36, 136.83, 134.31, 139.33, 150.28, 158.69, 161.6, 165.01, 166.11, 163.31, 158.28, 154.5, 156.8, 156.95, 161.1, 164.45, 155.51, 162.24, 163.24, 170.91, 175.24, 173.25, 177.55, 170.3, 160.15, 163.64, 171.34, 156.25, 161.82, 162.88, 167.12, 171.05, 168.58, 174.15, 182.46, 186.48, 187.3, 191.26, 194.46, 201.1, 198.46, 203.46, 207.69, 203.3, 215.9, 218.36, 214.65, 224.25, 233.67, 236.13, 217.64, 212.66, 213.28, 210.19, 208.6, 193.99, 195.31, 214.79, 221.82, 227.8, 228.72, 230.46, 232.31, 237.41, 238.64, 240.82, 234.86, 242.11, 244.6, 245.89, 270.1, 277.96, 277.52, 284.93, 293.7, 297.49, 297.9, 316.58, 312.68, 330.51, 318.5, 303.02, 324.3, 320.5, 330.57, 330.24, 340.89, 332.85, 314.83, 319.02, 320.06, 313.55, 317.37, 330.48, 311.89, 297.79, 280.26, 291.64, 296.68, 300, 306.93, 284.97, 305.8, 330.6, 328.45, 333.05, 341.39, 348.18, 344.49, 335, 366.67, 358.99, 377.41, 375.42, 371.22, 356.01, 338.12, 334.63, 342.58, 341.45, 346.28, 368.98, 326.44, 313.05, 309.17, 297.37, 293.32, 284.98, 293.61, 295.44, 274.17, 246.52, 277.53, 268.32, 288.82, 299.71, 309.87, 329.07, 321.06, 320.2, 331.45, 323.66, 331.23, 353.23, 362.22, 360.62, 378.62, 392.17, 381.29, 362.84, 351.03, 347.61, 349.14, 349.03, 365.9, 374.5, 365.58, 373.46, 369.08, 373.3, 376.29, 381.56, 373.77, 352.39, 331.71, 345.89, 337.66, 331.98, 317.8, 322.17, 327.31, 324.51, 343.75, 331.22, 351.42, 373.82, 389.25, 373.38, 375.92, 347.75, 355.4, 356.8, 357.36, 361.1, 403, 406.21, 423.92, 425.55, 401.51, 399.44, 391.35, 400.6, 395.94, 391.39, 421.77, 402.68, 398.52, 407.28, 399.99, 404.07, 415.2, 448.68, 451.51],
  },
  {
    symbol: "CEG",
    ticker: "CEG",
    company: "Constellation Energy",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 282.5,
    dailyChange: 1.39,
    weekChange: 4.67,
    monthChange: 12.21,
    ytdChange: -22.87,
    high52w: 403.95,
    low52w: 236.5,
    realizedVol: 33.77,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 45, 46.75, 50.14, 48.09, 45.41, 43.91, 51, 49.32, 49.01, 53.8, 58.02, 64.02, 62.55, 62.43, 59.21, 60.27, 54.61, 56.65, 66.6, 65.17, 59.79, 58.1, 59.28, 57.6, 59.65, 55.66, 54, 66.1, 74.3, 81.5, 80.84, 80.83, 81.07, 87.51, 85.57, 83.85, 83.19, 84.39, 81.26, 87.28, 93.75, 94.32, 92.31, 93.3, 97.16, 92.04, 89.72, 88.2, 88.04, 86.21, 83.5, 85.16, 83, 86.58, 83.2, 86.81, 84.55, 79.27, 78.98, 77.55, 76.77, 73.44, 78.5, 76.96, 76.43, 76.55, 77.4, 79.49, 79.85, 82.3, 83.85, 87.54, 93.29, 92.89, 90.36, 91.55, 91.33, 95, 96.6, 95.74, 103.94, 106.56, 104.77, 105.87, 107.29, 108.64, 109.93, 110.36, 109.08, 110.17, 113.69, 112.1, 110.78, 117.07, 121.77, 121.69, 123.86, 119.88, 111.21, 118.75, 115.33, 116.89, 116.24, 112.91, 114.45, 121.27, 129.71, 132.17, 131.16, 133.99, 169.99, 170.57, 165.52, 178.24, 184.85, 193.08, 191.67, 180.9, 188.37, 194.86, 214.93, 213.11, 230.63, 217.25, 198, 214.9, 218.13, 200.27, 211.29, 217.14, 189.3, 175.04, 167.08, 189.87, 189.98, 194.99, 196.7, 173.11, 195.98, 254.98, 257, 285.52, 266.22, 270.16, 264.41, 258.1, 239.37, 224.28, 249.89, 256.56, 253.63, 239.07, 227.02, 226.54, 252.4, 305.19, 316.36, 347.44, 299.98, 309.79, 317.3, 284.44, 250.54, 212.54, 216.46, 222.48, 205.39, 170.96, 208.25, 206.68, 222.99, 247.26, 271.37, 291.12, 297.49, 306.15, 298.8, 296.89, 304.92, 320.17, 311.88, 321.54, 321.42, 327.35, 340.77, 335.77, 322.23, 310.16, 307.98, 301.58, 323.48, 330.9, 331.26, 360, 368.49, 386.5, 389.19, 377, 358.39, 338.52, 338.11, 364.36, 359.82, 351.98, 355.4, 360.46, 366.25, 342.52, 307.71, 289.06, 280.68, 261.42, 288.43, 294.84, 329.88, 319.06, 301.77, 281.99, 301.49, 272.82, 286.5, 296.21, 313.53, 307.81, 303.63, 267.2, 294.07, 287.75, 254.83, 253.76, 274.06, 264.02, 239.25, 251.38, 252.39, 274.35, 262.75, 269.89, 282.5],
  },
  {
    symbol: "GEV",
    ticker: "GEV",
    company: "GE Vernova",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 1063.25,
    dailyChange: 1.32,
    weekChange: 7.36,
    monthChange: 2.61,
    ytdChange: 56.46,
    high52w: 1174.86,
    low52w: 547.96,
    realizedVol: 55.77,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 136.75, 122.7, 134, 135.1, 153.07, 166.26, 167.27, 162.62, 177.43, 175.9, 162.08, 170.17, 175.73, 171.51, 176.23, 180.45, 163.34, 173.11, 164.73, 179.11, 184.06, 183.29, 201, 198.33, 225.59, 245.46, 249.86, 265.59, 266.89, 272.72, 293.54, 301.09, 341.18, 329.76, 349.16, 334.12, 346.51, 332.01, 342.66, 333.8, 354.03, 367.1, 401.41, 420.49, 372.88, 377.97, 367.59, 327.88, 335.18, 289.3, 313.63, 333.87, 302.93, 271.48, 321.43, 323.55, 372.42, 396.32, 399.26, 428.06, 464.39, 472.98, 485, 478.45, 486.96, 519.66, 517.04, 539.16, 574.6, 644.59, 656.5, 649.09, 621.91, 607.07, 612.97, 582.08, 625.55, 624.17, 605.17, 594.99, 604.56, 600, 584.39, 585.14, 575.13, 578.31, 555.84, 599.77, 631.32, 671.71, 658.28, 663.46, 679.55, 622.5, 681.55, 657.78, 726.37, 779.35, 802.13, 830.34, 873.6, 789.23, 805.02, 851.07, 853.16, 898.57, 991.32, 1002.75, 1149.19, 1062.95, 1040.15, 1049.23, 1038.74, 968.32, 933.61, 940.66, 1109.73, 1045.17, 1113.11, 1091.57, 1057.84, 1014.75, 990.29, 990.32, 1063.25],
  },
  {
    symbol: "EQIX",
    ticker: "EQIX",
    company: "Equinix",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 1102.1,
    dailyChange: 2.64,
    weekChange: 5.7,
    monthChange: 9.21,
    ytdChange: 44.23,
    high52w: 1115.94,
    low52w: 726.09,
    realizedVol: 30.84,
    sparkline: [824.81, 882.83, 844, 872.58, 834.68, 789.32, 750.96, 781.39, 821.02, 837.07, 781.92, 775.39, 788.53, 793.84, 794.03, 797.89, 822.26, 818.76, 845.84, 774.94, 746.76, 721.58, 707.56, 702.15, 671.52, 692.94, 715.74, 720.92, 693.55, 732.26, 710.14, 763, 768.78, 735.24, 745.41, 719.08, 713.44, 659.8, 651.79, 693.68, 678.44, 649.17, 632.81, 689.17, 673.03, 650.52, 619.75, 653.78, 703.74, 697.51, 704.56, 696.79, 670.74, 631.16, 657.89, 624.75, 593.13, 568.84, 541.86, 505.39, 534.6, 568.05, 611.09, 660.6, 647.41, 674.66, 691.47, 675.8, 667.84, 657.68, 655.03, 673.94, 721.89, 720.06, 730.22, 733, 729.75, 716.76, 684.8, 705.41, 665.63, 690.85, 681.7, 721.04, 711.23, 688.68, 713, 724.08, 740, 739.23, 723.58, 729.15, 757.61, 743.69, 778.61, 746.11, 783.94, 772.31, 805.73, 807.12, 797.36, 757.88, 774.17, 749.77, 770.92, 777.52, 771.44, 776.22, 731.91, 726.26, 723.66, 742.64, 705.62, 710.39, 770.76, 767.27, 774.64, 795, 824.42, 801.77, 803.73, 799.68, 805.39, 788.39, 815.02, 802.69, 810.98, 843.47, 855.76, 856.23, 882.29, 900.53, 910.1, 850.39, 800.97, 825.33, 784.41, 764.05, 748, 731.61, 700.18, 757.68, 799.83, 766.12, 762.98, 753.39, 766.26, 765, 756.6, 754.49, 804.84, 786.82, 772.43, 806.65, 818.88, 828.66, 827.96, 834.36, 817.96, 871.54, 877.2, 882.69, 876.88, 871.56, 895.2, 914.33, 888.3, 921.06, 897.37, 936.37, 981.48, 985, 965, 927.22, 942.66, 959.97, 899.83, 915.59, 940.85, 913.66, 933.27, 933.6, 919.68, 904.62, 859.52, 837.68, 834.59, 803, 766.21, 776.83, 790.15, 838.1, 875.85, 864.39, 875.92, 863.46, 888.82, 914.43, 892.64, 882.88, 785.11, 787, 756.7, 777.78, 801.43, 771.75, 776.2, 781.31, 786.47, 786.19, 773.68, 788.61, 791.25, 790.34, 778.74, 800.6, 813.93, 839.49, 846.01, 824.75, 785.57, 754.68, 753.31, 741.58, 750.32, 758.51, 763.3, 764.11, 800.35, 801.78, 791.27, 820.93, 848.12, 956.19, 928.11, 974.26, 937.2, 969.9, 959.16, 963, 1000.37, 1030.24, 1088.62, 1108.76, 1085.03, 1072.08, 1059.44, 1079.79, 1068.04, 1080.95, 1055.85, 1092.19, 1091.3, 1002.02, 1051.21, 1020, 1084.24, 1019.28, 1042.62, 1102.1],
  },
  {
    symbol: "SU.PA",
    ticker: "SU",
    company: "Schneider Electric",
    layer: "infra",
    country: "France",
    flag: "🇫🇷",
    currency: "EUR",
    value: 308.2,
    dailyChange: 0.59,
    weekChange: 1.97,
    monthChange: 16.59,
    ytdChange: 30.01,
    high52w: 311,
    low52w: 210.05,
    realizedVol: 38.18,
    sparkline: [152.2, 153.88, 153, 152.98, 149.86, 142.52, 140.76, 144.28, 141.8, 148.9, 153.2, 156.02, 161.42, 151.58, 159.88, 166.92, 165.68, 170.5, 172.46, 169.4, 162.98, 157.98, 147.56, 146.66, 146.46, 144.84, 140.24, 129.62, 141.42, 151.04, 145.88, 154.38, 145.5, 141.32, 142.32, 137.7, 127, 129.48, 125.62, 127.8, 129.98, 123.5, 115.78, 116.74, 111.26, 117.24, 117.56, 125.58, 134.54, 132.14, 135.14, 134.5, 124.7, 120.9, 126.06, 120.92, 114.4, 116.94, 118.72, 121.88, 125.42, 130.22, 131.64, 141.98, 142.28, 142.32, 140.48, 138.38, 130.82, 131.18, 130.72, 141.9, 148.38, 143.44, 147.88, 154.84, 150.02, 156.26, 149, 154.88, 152.32, 146.08, 142.3, 153.68, 142.64, 150.42, 152.6, 157.82, 158.64, 158.16, 164.6, 164, 165.62, 163.94, 162.98, 158.1, 166.46, 156.92, 162.24, 162.58, 162.14, 160.96, 159.34, 154.32, 156.52, 157.44, 157.12, 157.44, 154.14, 156.98, 155.58, 153.12, 141.44, 143.06, 150.7, 160.8, 166.02, 166.28, 169.8, 174.94, 181.14, 180.96, 181.78, 173.1, 178.42, 177.5, 183.12, 188.7, 195.96, 201.9, 209.8, 209.9, 212.05, 215, 218.05, 209.65, 207.65, 209.4, 208.4, 217.35, 216.3, 234, 229.15, 238.2, 227.45, 226.85, 221.2, 226.5, 224.3, 227.75, 234.9, 222.9, 219.55, 203.5, 210.45, 221.9, 226.9, 229.7, 214.95, 227.2, 234.2, 240.35, 234.75, 241.55, 246.05, 242.35, 239.9, 240.75, 242.25, 241.75, 243.5, 251.7, 244.7, 239.75, 241.05, 240.2, 250.55, 258.95, 270.65, 245.35, 237.1, 246.55, 257.4, 233.95, 223.9, 228, 231.75, 217.15, 189.5, 197, 205.3, 217.85, 215.8, 214.8, 219.15, 217.15, 221.35, 227.65, 220.45, 214.05, 230, 221.9, 225.2, 237.15, 236.25, 213.9, 222, 220.6, 215.4, 210.05, 218.3, 232, 231.1, 235.25, 249.7, 245.25, 246.1, 253.65, 246.1, 230.85, 235.65, 222.3, 231, 235.5, 235.4, 235.85, 235.25, 237.05, 235.45, 235.15, 231.85, 242.3, 252.9, 262.9, 261.9, 276.7, 249.35, 248, 237.15, 229.2, 236.15, 260.2, 278.65, 276, 268.6, 272.6, 263.75, 269.05, 269.95, 269.05, 265.3, 289.25, 276.05, 280.1, 269.65, 262.45, 268.05, 284.6, 303.7, 306.4],
  },
  {
    symbol: "SMCI",
    ticker: "SMCI",
    company: "Super Micro",
    layer: "systems",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 39.84,
    dailyChange: 1.74,
    weekChange: 27.98,
    monthChange: 61.43,
    ytdChange: 28.68,
    high52w: 58.68,
    low52w: 20.53,
    realizedVol: 101.14,
    sparkline: [3.57, 3.8, 3.66, 3.72, 3.73, 3.73, 3.69, 3.54, 3.53, 3.54, 4.66, 4.37, 4.22, 4.04, 4.32, 4.29, 4.09, 4.27, 4.39, 4.41, 4.56, 4.1, 4.01, 3.82, 3.81, 3.92, 4.02, 4.16, 4.16, 4.29, 4.2, 3.79, 3.53, 3.65, 4.24, 4.21, 5.12, 5.24, 4.98, 4.95, 5.48, 4.88, 4.31, 4.27, 3.91, 4.05, 4.22, 5.07, 5.4, 5.91, 6.53, 6.98, 6.98, 6.45, 6.69, 6.23, 5.34, 5.51, 5.89, 5.4, 6.45, 6.87, 7.66, 8.35, 8.65, 9.39, 8.67, 8.4, 8.07, 8.22, 8.21, 8.44, 8.06, 7.2, 7.43, 8.43, 9, 9.2, 9.82, 9.78, 9.28, 9.55, 11.08, 10.65, 10.07, 10.91, 10.73, 10.54, 13.72, 13.45, 16.42, 21.92, 22.19, 26.17, 23.08, 21.61, 24.92, 26, 29.54, 30.32, 33.45, 33.81, 25.44, 24.35, 25.4, 28.22, 28.07, 24.93, 23.58, 27.42, 28.97, 28.52, 24.86, 24.14, 25.5, 26.6, 28.86, 28.57, 26.96, 27.26, 30.01, 28.97, 28.43, 29.21, 33.96, 42.34, 47.42, 57.96, 74.03, 80.33, 86, 90.55, 114, 106.88, 97.27, 101, 94.8, 89.85, 71.36, 85.74, 78.27, 79.85, 88.79, 88.39, 78.45, 76.91, 84.45, 90.53, 81.93, 84.66, 91, 79.68, 71.22, 62.47, 50.88, 62.88, 61.32, 43.77, 38.65, 45.72, 45.73, 41.97, 41.23, 47.8, 47.26, 47.27, 26.05, 24.52, 18.58, 33.15, 32.64, 43.93, 36.45, 31.59, 31.98, 33.33, 32.6, 30.82, 33.27, 28.52, 36.28, 47.91, 56.07, 41.46, 38.24, 42.17, 42.15, 34.26, 29.82, 33.15, 31.51, 36.47, 33.71, 31.99, 46.15, 40.09, 40.02, 41.55, 41.56, 45.32, 47.58, 48.56, 49.24, 51.77, 54.47, 56.64, 44.6, 45.37, 43.88, 41.54, 40.41, 45, 45.81, 45.82, 51.96, 52.86, 52.18, 48.29, 51.96, 39.76, 36.42, 32.19, 33.85, 34.69, 32.33, 31.11, 30.64, 30.96, 30.16, 32.64, 31.7, 29.11, 34.38, 30.54, 32.42, 32.39, 31.31, 30.75, 20.53, 21.97, 23.22, 25.26, 28.56, 29.08, 27.09, 35.37, 31.04, 35.58, 46.09, 41.64, 30.46, 30.66, 30.63, 27.22, 28.31, 24.18, 30.1, 28.4, 31.13, 39.84],
  },
  {
    symbol: "DELL",
    ticker: "DELL",
    company: "Dell Technologies",
    layer: "systems",
    country: "United States",
    flag: "🇺🇸",
    currency: "USD",
    value: 490.81,
    dailyChange: -0.75,
    weekChange: 8.16,
    monthChange: 25.4,
    ytdChange: 284.05,
    high52w: 494.51,
    low52w: 111.07,
    realizedVol: 84.02,
    sparkline: [49.14, 49.23, 48.27, 50.95, 52.65, 53.61, 53.25, 54.59, 58.05, 55.75, 56.36, 56, 55.02, 56.18, 58.48, 57.6, 54.65, 55.88, 56.17, 57.99, 60.53, 55.57, 56.24, 58.74, 59.51, 58.9, 51.46, 51.96, 52.01, 51.83, 54.79, 48.8, 47.39, 46.94, 46.87, 47.01, 45.58, 45.09, 40.05, 49.58, 51.02, 49.16, 47.59, 50.25, 42.74, 42.92, 43.46, 43.34, 45.06, 45.41, 48.22, 47.67, 41.43, 37.79, 39.79, 37.96, 35.52, 34.17, 34.6, 34.26, 36.85, 39.16, 39, 42.68, 42.04, 44.63, 44.54, 41.83, 39.25, 39.12, 40.22, 42.42, 40.18, 40.26, 40.31, 42.24, 42.72, 42.48, 41.61, 39.79, 36.72, 37.22, 37.38, 40.21, 40.23, 43.28, 43.11, 43.49, 45.39, 44.76, 47.75, 48.51, 47.27, 47.61, 49.67, 50.87, 54.11, 53.53, 55.42, 53.56, 52.61, 53.24, 56.84, 54.93, 56.21, 68.19, 70.5, 69.29, 70.05, 68.9, 66.41, 68.04, 65.91, 65.96, 69.51, 73.5, 73.6, 74.41, 71.93, 68.7, 71.62, 75.71, 76.5, 75.84, 79.31, 83.19, 84.22, 86.32, 86.2, 84.21, 90.35, 124.59, 116.25, 107, 112.24, 114.11, 132.72, 117.76, 114.87, 125.06, 125.1, 132.77, 149.52, 160.18, 139.56, 129.97, 134.98, 145.06, 137.91, 138.96, 139.57, 125.79, 113.56, 102.29, 92.55, 111.3, 112.01, 115.54, 102, 114.3, 117.5, 120.22, 120.42, 127.73, 126.46, 122.55, 130.87, 134.23, 131.64, 144.21, 127.59, 123.4, 118.45, 115.77, 117.33, 119.91, 114.77, 109.64, 113.73, 103.6, 106.37, 114.38, 117.6, 102.76, 91.46, 95.67, 97.57, 92.29, 71.63, 81.93, 84.8, 94.89, 94.59, 95.91, 114.19, 112.11, 111.27, 113.75, 109.56, 119.37, 123.99, 125.22, 126.83, 131.24, 131.22, 127.32, 137.61, 138.28, 130.84, 122.15, 124.83, 125.04, 131.94, 130.76, 140.74, 150.57, 149.59, 158.64, 162.01, 146.7, 133.76, 122.51, 133.35, 138.91, 129.98, 126.42, 129.24, 127.8, 120.62, 120.53, 115.43, 114.44, 121.05, 117.49, 122.27, 148.08, 146.48, 151.62, 157.67, 171.81, 174.37, 177.8, 196.55, 216.09, 210.17, 260.46, 241.99, 295.19, 420.91, 394.39, 395.57, 409.5, 399.49, 394.32, 434.97, 396.34, 437.5, 405.37, 453.77, 490.81],
  },
  {
    symbol: "000660.KS",
    ticker: "000660",
    company: "SK hynix",
    layer: "systems",
    country: "South Korea",
    flag: "🇰🇷",
    currency: "KRW",
    value: 1645000,
    dailyChange: 3.26,
    weekChange: 15.68,
    monthChange: -20.99,
    ytdChange: 142.98,
    high52w: 2919000,
    low52w: 245000,
    realizedVol: 139.99,
    sparkline: [103500, 107000, 105000, 107000, 104000, 100000, 94000, 98400, 98500, 103000, 107000, 106500, 111500, 115500, 118000, 120500, 122000, 128000, 131000, 127000, 128500, 119000, 120500, 124500, 132000, 131500, 123000, 129000, 118000, 124000, 118000, 116000, 112000, 108000, 110500, 112500, 107500, 112500, 112500, 106000, 107000, 103500, 96400, 91600, 87500, 94800, 98700, 100000, 97900, 98500, 93300, 96400, 95100, 91700, 90400, 91200, 83500, 83100, 91200, 95500, 90500, 83400, 84500, 93500, 88400, 85100, 81900, 81500, 78400, 77800, 75000, 83100, 85700, 87600, 91500, 92200, 93500, 92000, 91000, 87300, 83300, 84000, 87300, 88600, 89100, 89300, 89100, 89500, 88700, 87200, 97300, 109200, 110300, 115400, 118900, 113600, 115200, 111800, 118000, 115100, 128000, 120100, 115300, 117200, 116500, 120000, 113700, 122400, 117300, 114700, 120400, 124700, 126200, 119100, 125800, 130500, 129900, 128000, 132600, 127500, 140000, 140600, 141500, 137500, 134100, 141300, 136000, 134900, 142800, 146800, 161400, 156200, 171900, 161200, 169800, 183000, 182800, 187400, 173300, 177800, 173200, 179900, 189900, 198600, 189200, 207500, 221000, 234000, 236500, 236000, 233000, 209500, 191800, 173200, 171500, 199700, 185500, 173700, 156400, 162800, 157100, 183800, 174100, 186000, 187300, 201000, 182200, 200500, 178200, 176700, 159900, 167100, 175500, 168500, 174500, 181900, 203500, 214500, 221000, 199200, 203000, 210000, 209500, 190200, 192400, 204500, 215500, 199300, 182200, 180800, 175000, 184400, 186000, 190100, 204500, 200000, 204500, 224500, 235500, 257000, 284000, 270500, 294500, 269000, 266000, 258000, 256500, 276500, 251000, 269000, 273500, 328500, 355500, 336500, 395500, 428000, 465500, 510000, 559000, 580000, 560000, 521000, 530000, 544000, 571000, 547000, 599000, 677000, 744000, 756000, 767000, 909000, 839000, 880000, 949000, 1061000, 924000, 910000, 1007000, 933000, 876000, 1027000, 1128000, 1222000, 1286000, 1686000, 1819000, 1941000, 2333000, 2070000, 2150000, 2764000, 2673000, 2425000, 2180000, 1842000, 1759000, 1718000, 1422000, 1645000],
  },
  {
    symbol: "005930.KS",
    ticker: "005930",
    company: "Samsung Electronics",
    layer: "systems",
    country: "South Korea",
    flag: "🇰🇷",
    currency: "KRW",
    value: 274500,
    dailyChange: 2.43,
    weekChange: 18.83,
    monthChange: -1.79,
    ytdChange: 113.62,
    high52w: 362500,
    low52w: 67600,
    realizedVol: 117.24,
    sparkline: [74300, 76600, 75300, 77200, 77300, 73200, 71500, 70100, 70400, 69800, 70200, 70600, 71200, 72300, 75600, 76900, 78000, 80500, 78300, 78300, 77300, 75600, 73300, 74000, 74900, 74300, 71900, 72900, 70000, 70700, 69800, 69100, 67800, 66600, 67000, 67400, 66500, 66500, 68000, 66500, 66800, 63800, 59800, 58400, 56200, 58700, 60000, 61300, 61400, 61500, 60200, 60900, 60000, 57500, 55600, 56200, 54500, 53100, 56200, 56300, 55900, 57300, 59400, 62900, 61800, 61000, 60400, 60400, 59500, 58100, 55300, 59000, 60800, 61800, 64600, 63500, 62900, 62600, 61300, 60500, 59500, 61300, 63000, 64000, 65000, 65100, 65700, 65500, 65100, 64100, 68400, 70300, 72200, 72000, 71800, 71600, 72200, 69900, 73400, 70300, 70600, 68300, 67500, 66300, 67100, 71000, 70300, 72000, 68800, 68400, 66000, 68000, 68800, 67300, 69600, 70500, 72500, 71700, 72000, 72600, 73300, 75900, 78500, 76600, 73100, 74700, 73400, 75200, 74100, 72800, 72900, 73400, 73300, 72300, 78900, 82400, 84500, 83700, 77600, 76700, 77600, 79200, 77400, 75900, 73500, 77300, 79600, 80000, 81500, 87100, 84400, 84400, 80900, 79600, 74700, 80200, 77700, 74300, 68900, 64400, 63000, 64200, 60600, 59300, 59200, 55900, 58300, 57000, 53500, 56000, 54200, 54100, 56100, 53000, 53700, 54400, 55300, 53700, 53700, 52400, 53700, 56000, 58200, 54500, 53700, 54700, 61700, 60200, 56100, 55200, 55300, 55700, 54300, 54800, 56800, 54200, 56200, 59100, 58300, 59500, 60800, 63300, 62600, 67100, 65900, 68900, 71800, 71600, 71400, 69700, 69500, 75400, 80300, 83300, 89750, 94400, 97900, 98800, 107500, 97900, 97200, 94800, 100500, 108400, 108900, 106300, 117000, 128500, 139000, 148900, 152100, 160500, 158600, 181200, 190100, 216500, 188200, 183500, 199400, 180100, 186200, 206000, 216000, 219500, 220500, 268500, 270500, 292500, 317000, 329000, 322500, 354000, 339500, 309500, 285000, 255000, 249500, 262500, 231000, 274500],
  },
  {
    symbol: "2317.TW",
    ticker: "2317",
    company: "Hon Hai (Foxconn)",
    layer: "systems",
    country: "Taiwan",
    flag: "🇹🇼",
    currency: "TWD",
    value: 255,
    dailyChange: -1.73,
    weekChange: -3.59,
    monthChange: 8.97,
    ytdChange: 9.91,
    high52w: 309,
    low52w: 184.5,
    realizedVol: 44.48,
    sparkline: [108, 112.5, 108, 108.5, 107.5, 103, 108, 109.5, 107.5, 107, 109, 109, 106.5, 103.5, 105, 105, 103.5, 104, 104, 106.5, 103.5, 102, 102, 102, 106, 105.5, 103, 105, 103.5, 106, 106, 104.5, 103, 103, 103.5, 102, 104, 104, 107, 110, 114, 114, 109.5, 110, 106, 102, 105, 106, 109, 108, 112.5, 111, 110.5, 107.5, 107, 107.5, 106.5, 102, 107.5, 105, 103.5, 104, 100.5, 100, 100.5, 100.5, 105.5, 102, 100.5, 101, 99.9, 98.4, 98.6, 98.1, 98.1, 99.6, 101.5, 103.5, 101, 102.5, 102, 103.5, 105.5, 104, 103, 104.5, 104, 104.5, 105, 102.5, 103, 102.5, 108, 108, 111, 113, 113, 105.5, 109.5, 107.5, 109.5, 111, 108.5, 106, 108, 107.5, 106, 106, 105, 104, 105.5, 107.5, 103.5, 98.2, 95.8, 97.2, 102.5, 101.5, 100.5, 101.5, 101.5, 103.5, 104.5, 104, 100.5, 100.5, 102.5, 102, 101.5, 101.5, 103, 102, 105, 132, 145.5, 151.5, 159, 150.5, 143, 155, 156, 169.5, 170, 176, 172, 177.5, 198, 212, 214, 214.5, 216, 204, 192, 186.5, 168.5, 184, 180, 184.5, 176.5, 176, 177, 191, 194, 200, 207.5, 216, 208, 218, 207, 203, 195.5, 198, 186.5, 181, 186.5, 181, 181.5, 173.5, 180, 180, 178, 178, 183, 174, 172, 170, 165, 154, 153.5, 134.5, 135.5, 139, 147.5, 147, 158, 154, 156, 153, 156.5, 155.5, 165, 161, 161.5, 165.5, 174.5, 178, 194.5, 207, 202.5, 203.5, 205, 217.5, 214, 219.5, 226.5, 221.5, 226.5, 239, 257.5, 244, 241, 225, 225.5, 231, 227, 221.5, 225.5, 232, 230.5, 234.5, 221.5, 220.5, 215, 227, 227, 243, 223, 214.5, 203, 199.5, 193, 200.5, 206, 221.5, 219.5, 250, 248.5, 250, 289, 284.5, 260.5, 268.5, 248.5, 240.5, 237.5, 234, 252.5, 250.5, 260, 259.5],
  },
];

/** The 12 global equity indices as 5-year weekly series, for the basket
 *  comparison. Same length and cadence as AI_STOCKS[].sparkline — enforced by
 *  patch-ai-stocks.mjs, which refuses to write a mismatch. */
export const AI_INDEX_SERIES: AIIndexSeries[] = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    region: "USA",
    flag: "🇺🇸",
    series: [4509.37, 4535.43, 4458.58, 4432.99, 4455.48, 4357.04, 4391.34, 4471.37, 4544.9, 4605.38, 4697.53, 4682.85, 4697.96, 4594.62, 4538.43, 4712.02, 4620.64, 4725.79, 4766.18, 4677.03, 4662.85, 4397.94, 4431.85, 4500.53, 4418.64, 4348.87, 4384.65, 4328.87, 4204.31, 4463.12, 4543.06, 4545.86, 4488.28, 4392.59, 4271.78, 4131.93, 4123.34, 4023.89, 3901.36, 4158.24, 4108.54, 3900.86, 3674.84, 3911.74, 3825.33, 3899.38, 3863.16, 3961.63, 4130.29, 4145.19, 4280.15, 4228.48, 4057.66, 3924.26, 4067.36, 3873.33, 3693.23, 3585.62, 3639.66, 3583.07, 3752.75, 3901.06, 3770.55, 3992.93, 3965.34, 4026.12, 4071.7, 3934.38, 3852.36, 3844.82, 3839.5, 3895.08, 3999.09, 3972.61, 4070.56, 4136.48, 4090.46, 4079.09, 3970.04, 4045.64, 3861.59, 3916.64, 3970.99, 4109.31, 4105.02, 4137.64, 4133.52, 4169.48, 4136.25, 4124.08, 4191.98, 4205.45, 4282.37, 4298.86, 4409.59, 4348.33, 4450.38, 4398.95, 4505.42, 4536.34, 4582.23, 4478.03, 4464.05, 4369.71, 4405.71, 4515.77, 4457.49, 4450.32, 4320.06, 4288.05, 4308.5, 4327.78, 4224.16, 4117.37, 4358.34, 4415.24, 4514.02, 4559.34, 4594.63, 4604.37, 4719.19, 4754.63, 4769.83, 4697.24, 4783.83, 4839.81, 4890.97, 4958.61, 5026.61, 5005.57, 5088.8, 5137.08, 5123.69, 5117.09, 5234.18, 5254.35, 5204.34, 5123.41, 4967.23, 5099.96, 5127.79, 5222.68, 5303.27, 5304.72, 5277.51, 5346.99, 5431.6, 5464.62, 5460.48, 5567.19, 5615.35, 5505, 5459.1, 5346.56, 5344.16, 5554.25, 5634.61, 5648.4, 5408.42, 5626.02, 5702.55, 5738.17, 5751.07, 5815.03, 5864.67, 5808.12, 5728.8, 5995.54, 5870.62, 5969.34, 6032.38, 6090.27, 6051.09, 5930.85, 5970.84, 5942.47, 5827.04, 5996.66, 6101.24, 6040.53, 6025.99, 6114.63, 6013.13, 5954.5, 5770.2, 5638.94, 5667.56, 5580.94, 5074.08, 5363.36, 5282.7, 5525.21, 5686.67, 5659.91, 5958.38, 5802.82, 5911.69, 6000.36, 5976.97, 5967.84, 6173.07, 6279.35, 6259.75, 6296.79, 6388.64, 6238.01, 6389.45, 6449.8, 6466.91, 6460.26, 6481.5, 6584.29, 6664.36, 6643.7, 6715.79, 6552.51, 6664.01, 6791.69, 6840.2, 6728.8, 6734.11, 6602.99, 6849.09, 6870.4, 6827.41, 6834.5, 6929.94, 6858.47, 6966.28, 6940.01, 6915.61, 6939.03, 6932.3, 6836.17, 6909.51, 6878.88, 6740.02, 6632.19, 6506.48, 6368.85, 6582.69, 6816.89, 7126.06, 7165.08, 7230.12, 7398.93, 7408.5, 7473.47, 7580.06, 7383.74, 7431.46, 7500.58, 7354.02, 7483.24, 7575.39, 7457.69, 7411.98, 7489.72, 7757.64, 7785.76],
  },
  {
    symbol: "^NDX",
    name: "NASDAQ 100",
    region: "USA",
    flag: "🇺🇸",
    series: [15432.95, 15652.86, 15440.75, 15333.47, 15329.68, 14791.87, 14820.75, 15146.92, 15355.07, 15850.47, 16359.38, 16199.89, 16573.34, 16025.58, 15712.04, 16331.98, 15801.46, 16308.21, 16320.08, 15592.19, 15611.59, 14438.4, 14454.61, 14694.35, 14253.84, 14009.54, 14189.16, 13837.83, 13301.83, 14420.08, 14754.31, 14861.21, 14327.26, 13893.21, 13356.87, 12854.8, 12693.53, 12387.4, 11835.62, 12681.42, 12548.03, 11832.82, 11265.99, 12105.85, 11585.68, 12125.69, 11983.62, 12396.47, 12947.97, 13207.69, 13565.87, 13242.9, 12605.17, 12098.44, 12588.29, 11861.38, 11311.24, 10971.22, 11039.47, 10692.06, 11310.33, 11546.21, 10857.03, 11817.01, 11677.02, 11756.03, 11994.26, 11563.33, 11243.72, 10985.45, 10939.76, 11040.35, 11541.48, 11619.03, 12166.6, 12573.36, 12304.92, 12358.18, 11969.65, 12290.81, 11830.28, 12519.88, 12767.05, 13181.35, 13062.6, 13079.52, 13000.77, 13245.99, 13259.13, 13340.18, 13803.49, 14298.41, 14546.64, 14528.36, 15083.92, 14891.48, 15179.21, 15036.85, 15565.6, 15425.67, 15750.93, 15274.92, 15028.07, 14694.84, 14941.83, 15490.86, 15280.23, 15202.4, 14701.1, 14715.24, 14973.24, 14995.12, 14560.88, 14180.42, 15099.49, 15529.12, 15837.99, 15982.01, 15997.58, 16084.69, 16623.45, 16777.4, 16825.93, 16305.98, 16832.92, 17314, 17421.01, 17642.73, 17962.41, 17685.98, 17937.61, 18302.91, 18018.45, 17808.25, 18339.44, 18254.69, 18108.46, 18003.49, 17037.65, 17718.3, 17890.8, 18161.18, 18546.23, 18808.35, 18536.65, 19000.95, 19659.8, 19700.43, 19682.87, 20391.97, 20331.49, 19522.62, 19023.66, 18440.85, 18513.1, 19508.52, 19720.87, 19574.64, 18421.31, 19514.59, 19791.49, 20008.62, 20035.02, 20271.97, 20324.04, 20352.02, 20033.14, 21117.18, 20394.13, 20776.23, 20930.37, 21622.25, 21780.25, 21289.15, 21473.02, 21326.16, 20847.58, 21441.16, 21774.01, 21478.05, 21491.31, 22114.69, 21614.08, 20884.41, 20201.37, 19704.64, 19753.97, 19281.4, 17397.7, 18690.05, 18258.09, 19432.56, 20102.61, 20061.45, 21427.94, 20915.66, 21340.99, 21761.79, 21631.04, 21626.39, 22534.2, 22866.97, 22780.6, 23065.47, 23272.25, 22763.31, 23611.27, 23712.07, 23498.12, 23415.42, 23652.44, 24092.19, 24626.25, 24503.85, 24785.52, 24221.74, 24817.95, 25358.16, 25858.13, 25059.81, 25008.24, 24239.57, 25434.89, 25692.05, 25196.73, 25346.18, 25644.39, 25206.17, 25766.26, 25529.26, 25605.47, 25552.39, 25075.77, 24732.73, 25012.62, 24960.04, 24643.02, 24380.73, 23898.15, 23132.77, 24045.53, 25116.34, 26672.43, 27303.67, 27710.36, 29234.99, 29125.2, 29481.64, 30333.18, 28957.6, 29635.95, 30406.19, 29118.24, 29329.21, 29825.11, 28592.66, 28128.34, 28274.2, 29722.3, 30046.14],
  },
  {
    symbol: "000001.SS",
    name: "Shanghai Composite",
    region: "China",
    flag: "🇨🇳",
    series: [3522.16, 3581.73, 3703.11, 3613.97, 3613.07, 3568.17, 3592.17, 3572.37, 3582.6, 3547.34, 3491.57, 3539.1, 3560.37, 3564.09, 3607.43, 3666.35, 3632.36, 3618.05, 3639.78, 3579.54, 3521.26, 3522.57, 3361.44, 3361.44, 3462.95, 3490.76, 3451.41, 3447.65, 3309.75, 3251.07, 3212.24, 3282.72, 3251.85, 3211.25, 3086.92, 3047.06, 3001.56, 3084.28, 3146.57, 3130.24, 3195.46, 3284.83, 3316.79, 3349.75, 3387.64, 3356.08, 3228.06, 3269.97, 3253.24, 3227.03, 3276.89, 3258.08, 3236.22, 3186.48, 3262.05, 3126.4, 3088.37, 3024.39, 3024.39, 3071.99, 3038.93, 2915.93, 3070.8, 3087.29, 3097.24, 3101.69, 3156.14, 3206.95, 3167.86, 3045.87, 3089.26, 3157.64, 3195.31, 3264.81, 3264.81, 3263.41, 3260.67, 3224.02, 3267.16, 3328.39, 3230.08, 3250.55, 3265.65, 3272.86, 3327.65, 3338.15, 3301.26, 3323.27, 3334.5, 3272.36, 3283.54, 3212.5, 3230.07, 3231.41, 3273.33, 3197.9, 3202.06, 3196.61, 3237.7, 3167.75, 3275.93, 3288.08, 3189.25, 3131.95, 3064.07, 3133.25, 3116.72, 3117.74, 3132.43, 3110.48, 3110.48, 3088.1, 2983.06, 3017.78, 3030.8, 3038.97, 3054.37, 3040.97, 3031.64, 2969.56, 2942.56, 2914.77, 2974.94, 2929.18, 2881.98, 2832.28, 2910.22, 2730.15, 2865.9, 2865.9, 3004.88, 3027.02, 3046.02, 3054.64, 3048.03, 3041.17, 3069.3, 3019.47, 3065.26, 3088.64, 3104.82, 3154.55, 3154.03, 3088.87, 3086.81, 3051.28, 3032.63, 2998.14, 2967.4, 2949.93, 2971.29, 2982.31, 2890.9, 2905.34, 2862.19, 2879.43, 2854.37, 2842.21, 2765.81, 2704.09, 2736.81, 3087.53, 3336.5, 3217.74, 3261.56, 3299.7, 3272.01, 3452.3, 3330.73, 3267.19, 3326.46, 3404.08, 3391.88, 3368.07, 3400.14, 3211.43, 3168.52, 3241.82, 3252.63, 3250.6, 3303.67, 3346.72, 3379.11, 3320.9, 3372.55, 3419.56, 3364.83, 3351.31, 3342.01, 3238.23, 3276.73, 3295.06, 3279.03, 3342, 3367.46, 3348.37, 3347.49, 3385.36, 3377, 3359.9, 3424.23, 3472.32, 3510.18, 3534.48, 3593.66, 3559.95, 3635.13, 3696.77, 3825.76, 3857.93, 3812.51, 3870.6, 3820.09, 3828.11, 3882.78, 3897.03, 3839.75, 3950.31, 3954.79, 3997.56, 3990.49, 3834.89, 3888.6, 3902.81, 3889.35, 3890.45, 3963.68, 3968.84, 4120.43, 4101.91, 4136.16, 4117.95, 4065.58, 4082.07, 4082.07, 4162.88, 4124.19, 4095.45, 3957.05, 3913.72, 3880.1, 3986.23, 4051.43, 4079.9, 4112.16, 4179.95, 4135.39, 4112.9, 4068.57, 4027.74, 4031.51, 4090.48, 4027.26, 4043.64, 3996.16, 3764.16, 3814.2, 3832.26, 3940.04, 3927.18],
  },
  {
    symbol: "^HSI",
    name: "Hang Seng",
    region: "Hong Kong",
    flag: "🇭🇰",
    series: [25407.89, 25901.99, 26205.91, 24920.76, 24192.16, 24575.64, 24837.85, 25330.96, 26126.93, 25377.24, 24870.51, 25327.97, 25049.97, 24080.52, 23766.69, 23995.72, 23192.63, 23223.76, 23397.67, 23493.38, 24383.32, 24965.55, 23550.08, 24573.29, 24906.66, 24327.71, 22767.18, 21905.29, 20553.79, 21412.4, 21404.88, 22039.55, 21872.01, 21518.08, 20638.52, 21089.39, 20001.96, 19898.77, 20717.24, 20697.36, 21082.13, 21806.18, 21075, 21719.06, 21859.79, 21725.78, 20297.72, 20609.14, 20156.51, 20201.94, 20175.62, 19773.03, 20170.04, 19452.09, 19362.25, 18761.69, 17933.27, 17222.83, 17740.05, 16587.69, 16211.12, 14863.06, 16161.14, 17325.66, 17992.54, 17573.58, 18675.35, 19900.87, 19450.67, 19593.06, 19781.41, 20991.64, 21738.66, 22044.65, 22688.9, 21660.47, 21190.42, 20719.81, 20010.04, 20567.54, 19319.92, 19518.59, 19915.68, 20400.11, 20331.2, 20438.81, 20075.73, 19894.57, 20049.31, 19627.24, 19450.57, 18746.92, 18949.94, 19389.95, 20040.37, 18889.97, 18916.43, 18365.7, 19413.78, 19075.26, 19916.56, 19539.46, 19075.19, 17950.85, 18119.39, 18382.06, 18202.07, 18182.89, 18057.45, 17809.66, 17485.98, 17813.45, 17172.13, 17398.73, 17664.12, 17203.26, 17454.19, 17559.42, 16830.3, 16334.37, 16792.19, 16340.41, 17047.39, 16535.33, 16244.58, 15308.69, 15952.23, 15533.56, 15746.58, 16339.96, 16725.86, 16589.44, 16353.39, 16720.89, 16499.47, 16541.42, 16723.92, 16721.69, 16224.14, 17651.15, 18475.92, 18963.68, 19553.61, 18608.94, 18079.61, 18366.95, 17941.78, 18028.52, 17718.61, 17799.61, 18293.38, 17417.68, 17021.31, 16945.51, 17090.23, 17430.16, 17612.1, 17989.07, 17444.3, 17369.09, 18258.57, 20632.3, 22736.87, 21251.98, 20804.11, 20590.15, 20506.43, 20728.19, 19426.34, 19229.97, 19423.61, 19865.85, 19971.24, 19720.7, 20090.46, 19760.27, 19064.29, 19584.06, 20066.19, 20225.11, 21133.54, 22620.33, 23477.92, 22941.32, 24231.3, 23959.98, 23689.72, 23426.6, 22849.81, 20914.69, 21395.14, 21980.74, 22504.68, 22867.74, 23345.05, 23601.26, 23289.77, 23792.54, 23892.56, 23530.48, 24284.15, 23916.06, 24139.57, 24825.66, 25388.35, 24507.81, 24858.82, 25270.07, 25339.14, 25077.62, 25417.98, 26388.16, 26545.1, 26128.2, 27140.92, 26290.32, 25247.1, 26160.15, 25906.65, 26241.83, 26572.46, 25220.02, 25858.89, 26085.08, 25976.79, 25690.53, 25818.93, 26338.47, 26231.79, 26844.96, 26749.51, 27387.11, 26559.95, 26567.12, 26413.35, 26630.54, 25757.29, 25465.6, 25277.32, 24951.88, 25116.53, 25893.54, 26160.33, 25978.07, 25776.53, 26393.71, 25962.73, 25606.03, 25182.39, 24961.95, 24718.1, 23924.81, 22671.86, 23350.03, 24175.12, 24562.24, 24963.23, 25884.43, 25668.03, 25116.85],
  },
  {
    symbol: "^N225",
    name: "Nikkei 225",
    region: "Japan",
    flag: "🇯🇵",
    series: [27641.14, 29128.11, 30381.84, 30500.05, 30248.81, 28771.07, 28048.94, 29068.63, 28804.85, 28892.69, 29611.57, 29609.97, 29745.87, 28751.62, 28029.57, 28437.77, 28545.68, 28782.59, 28791.71, 28478.56, 28124.28, 27522.26, 26717.34, 27439.99, 27696.08, 27122.07, 26476.5, 25985.47, 25162.78, 26827.43, 28149.84, 27665.98, 26985.8, 27093.19, 27105.26, 26847.9, 27003.56, 26427.65, 26739.03, 26781.68, 27761.57, 27824.29, 25963, 26491.97, 25935.62, 26517.19, 26788.47, 27914.66, 27801.64, 28175.87, 28546.98, 28930.33, 28641.38, 27650.84, 28214.75, 27567.65, 27153.83, 25937.21, 27116.11, 27090.76, 26890.58, 27105.2, 27199.74, 28263.57, 27899.77, 28283.03, 27777.9, 27901.01, 27527.12, 26235.25, 26094.5, 25973.85, 26119.52, 26553.53, 27382.56, 27509.46, 27670.98, 27513.13, 27453.48, 27927.47, 28143.97, 27333.79, 27385.25, 28041.48, 27518.31, 28493.47, 28564.37, 28856.44, 29157.95, 29388.3, 30808.35, 30916.31, 31524.22, 32265.17, 33706.08, 32781.54, 33189.04, 32388.42, 32391.26, 32304.25, 32759.23, 32192.75, 32473.65, 31450.76, 31624.28, 32710.62, 32606.84, 33533.09, 32402.41, 31857.62, 30994.67, 32315.99, 31259.36, 30991.69, 31949.89, 32568.11, 33585.2, 33625.53, 33431.51, 32307.86, 32970.55, 33169.05, 33464.17, 33377.42, 35577.11, 35963.27, 35751.07, 36158.02, 36897.42, 38487.24, 39098.68, 39910.82, 39688.94, 38707.64, 40888.43, 40369.44, 38992.08, 39523.55, 37068.35, 37934.76, 38236.07, 38229.11, 38787.38, 38646.11, 38487.9, 38683.93, 38814.56, 38596.47, 39583.08, 40912.37, 41190.68, 40063.79, 37667.41, 35909.7, 35025, 38062.67, 38364.27, 38647.75, 36391.47, 36581.76, 37723.91, 39829.56, 38635.62, 39605.8, 38981.75, 37913.92, 38053.67, 39500.37, 38642.91, 38283.85, 38208.03, 39091.17, 39470.44, 38701.9, 40281.16, 39894.54, 39190.4, 38451.46, 39931.98, 39572.49, 38787.02, 39149.43, 38776.94, 37155.5, 36887.17, 37053.1, 37677.06, 37120.33, 33780.58, 33585.58, 34730.28, 35705.74, 36830.69, 37503.33, 37753.72, 37160.47, 37965.1, 37741.61, 37834.25, 38403.23, 40150.79, 39810.88, 39569.68, 39819.11, 41456.23, 40799.6, 41820.48, 43378.31, 42633.29, 42718.47, 43018.75, 44768.12, 45045.81, 45354.99, 45769.5, 48088.8, 47582.15, 49299.65, 52411.34, 50276.37, 50376.53, 48625.88, 50253.91, 50491.87, 50836.55, 49507.21, 50750.39, 50339.48, 51939.89, 53936.17, 53846.87, 53322.85, 54253.68, 56941.97, 56825.7, 58850.27, 55620.84, 53819.61, 53372.53, 53373.07, 53123.49, 56924.11, 58475.9, 59716.18, 59513.12, 62713.65, 61409.29, 63339.07, 66329.5, 66588.12, 66020.04, 71250.06, 69360.88, 69744.07, 68557.73, 64141.12, 64611.15, 64362.02, 65606.71, 68713.8],
  },
  {
    symbol: "^NSEI",
    name: "NIFTY 50",
    region: "India",
    flag: "🇮🇳",
    series: [16705.2, 17323.6, 17369.25, 17585.15, 17853.2, 17532.05, 17895.2, 18338.55, 18114.9, 17671.65, 17916.8, 18102.75, 17764.8, 17026.45, 17196.7, 17511.3, 16985.2, 17003.75, 17354.05, 17812.7, 18255.75, 17617.15, 17101.95, 17516.3, 17374.75, 17276.3, 16658.4, 16245.35, 16630.45, 17287.05, 17153, 17670.45, 17784.35, 17475.65, 17171.95, 17102.55, 16411.25, 15782.15, 16266.15, 16352.45, 16584.3, 16201.8, 15293.5, 15699.25, 15752.05, 16220.6, 16049.2, 16719.45, 17158.25, 17397.5, 17698.15, 17758.45, 17558.9, 17539.45, 17833.35, 17530.85, 17327.35, 17094.35, 17314.65, 17185.7, 17576.3, 17786.8, 18117.15, 18349.7, 18307.65, 18512.75, 18696.1, 18496.6, 18269, 17806.8, 18105.3, 17859.45, 17956.6, 18027.65, 17604.35, 17854.05, 17856.5, 17944.2, 17465.8, 17594.35, 17412.9, 17100.05, 16945.05, 17359.75, 17599.15, 17828, 17624.05, 18065, 18069, 18314.8, 18203.4, 18499.35, 18534.1, 18563.4, 18826, 18665.5, 19189.05, 19331.8, 19564.5, 19745, 19646.05, 19517, 19428.3, 19310.15, 19265.8, 19435.3, 19819.95, 20192.35, 19674.25, 19638.3, 19653.5, 19751.05, 19542.65, 19047.25, 19230.6, 19425.35, 19731.8, 19794.7, 20267.9, 20969.4, 21456.65, 21349.4, 21731.4, 21710.8, 21894.55, 21622.4, 21352.6, 21853.8, 21782.5, 22040.7, 22212.7, 22338.75, 22493.55, 22023.35, 22096.75, 22326.9, 22513.7, 22519.4, 22147, 22419.95, 22475.85, 22055.2, 22466.1, 22957.1, 22530.7, 23290.15, 23465.6, 23501.1, 24010.6, 24323.85, 24502.15, 24530.9, 24834.85, 24717.7, 24367.5, 24541.15, 24823.15, 25235.9, 24852.15, 25356.5, 25790.95, 26178.95, 25014.6, 24964.25, 24854.05, 24180.8, 24304.35, 24148.2, 23532.7, 23907.25, 24131.1, 24677.8, 24768.3, 23587.5, 23813.4, 24004.75, 23431.5, 23203.2, 23092.2, 23508.4, 23559.95, 22929.25, 22795.9, 22124.7, 22552.5, 22397.2, 23350.4, 23519.35, 22904.45, 22828.55, 23851.65, 24039.35, 24346.7, 24008, 25019.8, 24853.15, 24750.7, 25003.05, 24718.6, 25112.4, 25637.8, 25461, 25149.85, 24968.4, 24837, 24565.35, 24363.3, 24631.3, 24870.1, 24426.85, 24741, 25114, 25327.05, 24654.7, 24894.25, 25285.35, 25709.85, 25795.15, 25722.1, 25492.3, 25910.05, 26068.15, 26202.95, 26186.45, 26046.95, 25966.4, 26042.3, 26328.55, 25683.3, 25694.35, 25048.65, 25320.65, 25693.7, 25471.1, 25571.25, 25178.65, 24450.45, 23151.1, 23114.5, 22819.6, 22713.1, 24050.6, 24353.55, 23897.95, 23997.55, 24176.15, 23643.5, 23719.3, 23547.75, 23366.7, 23622.9, 24013.1, 24056, 24270.85, 24206.9, 24334.3, 23767.45, 24383.6, 24570.65, 24366],
  },
  {
    symbol: "^GDAXI",
    name: "DAX",
    region: "Germany",
    flag: "🇩🇪",
    series: [15851.75, 15781.2, 15609.81, 15490.17, 15531.75, 15156.44, 15206.13, 15587.36, 15542.98, 15688.77, 16054.36, 16094.07, 16159.97, 15257.04, 15169.98, 15623.31, 15531.69, 15756.31, 15884.86, 15947.74, 15883.24, 15603.88, 15318.95, 15099.56, 15425.12, 15042.51, 14567.23, 13094.54, 13628.11, 14413.09, 14305.76, 14446.48, 14283.67, 14163.85, 14142.09, 14097.88, 13674.29, 14027.93, 13981.91, 14462.19, 14460.09, 13761.83, 13126.26, 13118.13, 12813.03, 13015.23, 12864.72, 13253.68, 13484.05, 13573.93, 13795.85, 13544.52, 12971.47, 13050.27, 13088.21, 12741.26, 12284.19, 12114.36, 12273, 12437.81, 12730.9, 13243.33, 13459.85, 14224.86, 14431.86, 14541.38, 14529.39, 14370.72, 13893.07, 13940.93, 13923.59, 14610.02, 15086.52, 15033.56, 15150.03, 15476.43, 15307.98, 15482, 15209.74, 15578.39, 15427.97, 14768.2, 14957.23, 15628.84, 15597.89, 15807.5, 15881.66, 15922.38, 15961.02, 15913.82, 16275.38, 15983.97, 16051.23, 15949.84, 16357.63, 15829.94, 16147.9, 15603.4, 16105.07, 16177.22, 16469.75, 15951.86, 15832.17, 15574.26, 15631.82, 15840.34, 15740.3, 15893.53, 15557.29, 15386.58, 15229.77, 15186.66, 14798.47, 14687.41, 15189.25, 15234.39, 15919.16, 16029.49, 16397.52, 16759.22, 16751.44, 16706.18, 16751.64, 16594.21, 16704.56, 16555.13, 16961.39, 16918.21, 16926.5, 17117.44, 17419.33, 17735.07, 17814.51, 17936.65, 18205.94, 18492.49, 18175.04, 17930.32, 17737.36, 18161.01, 18001.6, 18772.85, 18704.42, 18693.37, 18497.94, 18557.27, 18002.02, 18163.52, 18235.45, 18475.45, 18748.18, 18171.93, 18417.55, 17661.22, 17722.88, 18322.4, 18633.1, 18906.92, 18301.9, 18699.4, 18720.01, 19473.63, 19120.93, 19373.83, 19657.37, 19463.59, 19254.97, 19215.48, 19210.81, 19322.59, 19626.45, 20384.61, 20405.92, 19884.75, 19984.32, 19906.08, 20214.79, 20903.39, 21394.93, 21732.05, 21787, 22513.42, 22287.56, 22551.43, 23008.94, 22986.82, 22891.68, 22461.52, 20641.72, 20374.1, 21205.86, 22242.45, 23086.65, 23499.32, 23767.43, 23629.58, 23997.48, 24304.46, 23516.23, 23350.55, 24033.22, 23787.45, 24255.31, 24289.51, 24217.5, 23425.97, 24162.86, 24359.3, 24363.09, 23902.21, 23596.98, 23698.15, 23639.41, 23739.47, 24378.8, 24241.46, 23830.99, 24239.89, 23958.3, 23569.96, 23876.55, 23091.87, 23836.79, 24028.14, 24186.49, 24288.4, 24340.06, 24539.34, 25261.64, 25297.13, 24900.71, 24538.81, 24721.46, 24914.88, 25260.69, 25284.26, 23591.03, 23447.29, 22380.19, 22300.75, 23168.08, 23803.95, 24702.24, 24128.98, 24292.38, 24338.63, 23950.57, 24888.56, 25104.7, 24759.05, 24635.3, 24985.82, 24671.22, 25779.31, 25067.09, 24830.98, 25099, 25629.24, 26319.45, 26440.31],
  },
  {
    symbol: "^FTSE",
    name: "FTSE 100",
    region: "UK",
    flag: "🇬🇧",
    series: [7148, 7138.4, 7029.2, 6963.6, 7051.5, 7027.1, 7095.6, 7234, 7204.6, 7237.6, 7304, 7347.9, 7223.6, 7044, 7122.3, 7291.8, 7269.9, 7372.1, 7384.5, 7485.3, 7543, 7494.1, 7466.1, 7516.4, 7661, 7513.6, 7489.5, 6987.1, 7155.6, 7404.7, 7483.4, 7537.9, 7669.6, 7616.4, 7521.7, 7544.6, 7387.9, 7418.2, 7390, 7585.5, 7533, 7317.5, 7016.3, 7208.8, 7168.7, 7196.2, 7159, 7276.4, 7423.4, 7439.7, 7500.9, 7550.4, 7427.3, 7281.2, 7351.1, 7236.7, 7018.6, 6893.8, 6991.1, 6858.8, 6969.7, 7047.7, 7334.8, 7318, 7385.5, 7486.7, 7556.2, 7476.6, 7332.1, 7473, 7451.7, 7699.5, 7844.1, 7770.6, 7765.2, 7901.8, 7882.5, 8004.4, 7878.7, 7947.1, 7748.4, 7335.4, 7405.5, 7631.7, 7741.6, 7871.9, 7914.1, 7870.6, 7778.4, 7754.6, 7756.9, 7627.2, 7607.3, 7562.4, 7642.7, 7461.9, 7531.5, 7256.9, 7434.6, 7663.7, 7694.3, 7564.4, 7524.2, 7262.4, 7338.6, 7464.5, 7478.2, 7711.4, 7683.9, 7608.1, 7494.6, 7599.6, 7402.1, 7291.3, 7417.7, 7360.6, 7504.3, 7488.2, 7529.4, 7554.5, 7576.4, 7697.5, 7733.2, 7689.6, 7624.9, 7461.9, 7635.1, 7615.5, 7572.6, 7711.7, 7706.3, 7682.5, 7659.7, 7727.4, 7930.9, 7952.6, 7911.2, 7995.6, 7895.9, 8139.8, 8213.5, 8433.8, 8420.3, 8317.6, 8275.4, 8245.4, 8146.9, 8237.7, 8164.1, 8203.9, 8252.9, 8155.7, 8285.7, 8174.7, 8168.1, 8311.4, 8327.8, 8376.6, 8181.5, 8273.1, 8230, 8320.8, 8280.6, 8253.7, 8358.3, 8248.8, 8177.2, 8072.4, 8063.6, 8262.1, 8287.3, 8308.6, 8300.3, 8084.6, 8149.8, 8224, 8248.5, 8505.2, 8502.4, 8674, 8700.5, 8732.5, 8659.4, 8809.7, 8679.9, 8632.3, 8646.8, 8658.9, 8055, 7964.2, 8275.7, 8415.3, 8596.4, 8554.8, 8684.6, 8718, 8772.4, 8837.9, 8850.6, 8774.7, 8798.9, 8822.9, 8941.1, 8992.1, 9120.3, 9068.6, 9095.7, 9138.9, 9321.4, 9187.3, 9208.2, 9283.3, 9216.7, 9284.8, 9491.3, 9427.5, 9354.6, 9645.6, 9717.3, 9682.6, 9698.4, 9539.7, 9720.5, 9667, 9649, 9897.4, 9870.7, 9951.1, 10124.6, 10235.3, 10143.4, 10223.5, 10369.8, 10446.4, 10686.9, 10910.6, 10284.8, 10261.2, 9918.3, 9967.4, 10436.3, 10600.5, 10667.6, 10379.1, 10363.9, 10233.1, 10195.4, 10466.3, 10409.3, 10368.1, 10471.7, 10363.3, 10508, 10679, 10497.3, 10600.4, 10736.2, 10868.1, 10901.1, 10750.1],
  },
  {
    symbol: "^FCHI",
    name: "CAC 40",
    region: "France",
    flag: "🇫🇷",
    series: [6681.92, 6689.99, 6663.77, 6570.19, 6638.46, 6517.69, 6559.99, 6727.52, 6733.69, 6830.34, 7040.79, 7091.4, 7112.29, 6739.73, 6765.52, 6991.68, 6926.63, 7086.58, 7153.03, 7219.48, 7143, 7068.59, 6965.88, 6951.38, 7011.6, 6929.63, 6752.43, 6061.66, 6260.25, 6620.24, 6553.68, 6684.31, 6548.22, 6589.35, 6581.42, 6533.77, 6258.36, 6362.68, 6285.24, 6515.75, 6485.3, 6187.23, 5882.65, 6073.35, 5931.06, 6033.13, 6036, 6216.82, 6448.5, 6472.35, 6553.86, 6495.83, 6274.26, 6167.51, 6212.33, 6077.3, 5783.41, 5762.34, 5866.94, 5931.92, 6035.39, 6273.05, 6416.44, 6594.62, 6644.46, 6712.48, 6742.25, 6677.64, 6452.63, 6504.9, 6473.76, 6860.95, 7023.5, 6995.99, 7097.21, 7233.94, 7129.73, 7347.72, 7187.27, 7348.12, 7220.67, 6925.4, 7015.1, 7322.39, 7324.75, 7519.61, 7577, 7491.5, 7432.93, 7414.85, 7491.96, 7319.18, 7270.69, 7213.14, 7388.65, 7163.42, 7400.06, 7111.88, 7374.54, 7432.77, 7476.47, 7315.07, 7340.19, 7164.11, 7229.6, 7296.77, 7240.77, 7378.82, 7184.82, 7135.06, 7060.15, 7003.53, 6816.22, 6795.38, 7047.5, 7045.04, 7233.91, 7292.8, 7346.15, 7526.55, 7596.91, 7568.82, 7543.18, 7420.69, 7465.14, 7371.64, 7634.14, 7592.26, 7647.52, 7768.18, 7966.68, 7934.17, 8028.01, 8164.35, 8151.92, 8205.81, 8061.31, 8010.83, 8022.41, 8088.24, 7957.57, 8219.14, 8167.5, 8094.97, 7992.87, 8001.8, 7503.27, 7628.57, 7479.4, 7675.62, 7724.32, 7534.52, 7517.68, 7251.8, 7269.71, 7449.7, 7577.04, 7630.95, 7352.3, 7465.25, 7500.26, 7791.79, 7541.36, 7577.89, 7613.05, 7497.54, 7409.11, 7338.67, 7269.63, 7255.01, 7235.11, 7426.88, 7409.57, 7274.48, 7355.37, 7282.22, 7431.04, 7709.75, 7927.62, 7950.17, 7973.03, 8178.54, 8154.51, 8111.63, 8120.8, 8028.28, 8042.95, 7916.08, 7274.95, 7104.8, 7285.86, 7536.26, 7770.48, 7743.75, 7886.69, 7734.4, 7751.89, 7804.87, 7684.68, 7589.66, 7691.55, 7696.27, 7829.29, 7822.67, 7834.58, 7546.16, 7743, 7923.45, 7969.69, 7703.9, 7674.78, 7825.24, 7853.59, 7870.68, 8081.54, 7918, 8174.2, 8225.63, 8121.07, 7950.18, 8170.09, 7982.65, 8122.71, 8114.74, 8068.62, 8151.38, 8103.58, 8195.21, 8362.09, 8258.94, 8143.05, 8126.53, 8273.84, 8311.74, 8515.49, 8580.75, 7993.49, 7911.53, 7665.62, 7701.95, 7962.39, 8259.6, 8425.13, 8157.82, 8114.84, 8112.57, 7952.55, 8115.75, 8183.34, 8218.24, 8350.87, 8421.14, 8384.87, 8508.07, 8338.97, 8338.81, 8372.28, 8509.64, 8714.93, 8636.8],
  },
  {
    symbol: "^GSPTSE",
    name: "S&P/TSX Composite",
    region: "Canada",
    flag: "🇨🇦",
    series: [20644.6, 20821.4, 20633.1, 20490.4, 20402.7, 20150.9, 20416.3, 20928.1, 21216.2, 21037.1, 21455.8, 21768.5, 21555, 21125.9, 20633.3, 20890.6, 20739.2, 21229.7, 21222.8, 21084.5, 21357.6, 20621.4, 20741.8, 21271.9, 21548.8, 21008.2, 21106, 21402.4, 21461.8, 21818.5, 22005.9, 21953, 21874.4, 21855.7, 21186.4, 20762, 20633.3, 20099.8, 20197.6, 20748.6, 20790.7, 20274.8, 18930.5, 19062.9, 18861.4, 19022.9, 18394.5, 18982.9, 19692.9, 19620.1, 20179.8, 20111.4, 19873.3, 19270.9, 19773.3, 19385.9, 18481, 18444.2, 18583.1, 18326.4, 18861, 19471.2, 19449.8, 20111.5, 19980.9, 20383.8, 20485.7, 19947.1, 19443.3, 19506.7, 19384.9, 19814.5, 20360.1, 20503.2, 20714.5, 20758.3, 20612.1, 20515.2, 20219.2, 20581.6, 19774.9, 19387.7, 19501.5, 20099.9, 20196.7, 20579.9, 20693.2, 20636.5, 20542, 20419.6, 20351.1, 19920.3, 20024.6, 19892.1, 19975.4, 19418.2, 20155.3, 19831, 20262.1, 20547.5, 20519.4, 20236, 20407.6, 19818.4, 19835.8, 20545.4, 20074.7, 20622.3, 19780, 19541.3, 19246.1, 19462.9, 19115.6, 18737.4, 19824.9, 19654.5, 20175.8, 20103.1, 20452.9, 20331.5, 20529.2, 20881.2, 20958.4, 20937.6, 20990.2, 20906.5, 21125.3, 21085.1, 21009.6, 21255.6, 21413.2, 21552.4, 21737.5, 21849.2, 21984.1, 22167, 22264.4, 21900, 21807.4, 21969.2, 21947.4, 22308.9, 22465.4, 22320.9, 22269.1, 22007, 21639.1, 21554.9, 21875.8, 22059, 22673.5, 22690.4, 22814.8, 22227.6, 22311.3, 23054.6, 23286.1, 23346.2, 22781.4, 23568.7, 23867.4, 23956.8, 24162.8, 24471.2, 24822.5, 24463.7, 24255.2, 24759.4, 24890.7, 25444.3, 25648, 25691.8, 25274.3, 24599.5, 24796.4, 25073.5, 24767.7, 25067.9, 25468.5, 25533.1, 25442.9, 25483.2, 25147, 25393.5, 24758.8, 24553.4, 24968.5, 24759.2, 23193.5, 23587.8, 24192.8, 24710.5, 25031.5, 25357.7, 25971.9, 25880, 26175.1, 26429.1, 26504.4, 26497.6, 26692.3, 27050.9, 27023.3, 27314, 27494.4, 27020.4, 27758.7, 27905.5, 28333.1, 28564.5, 29050.6, 29283.8, 29768.4, 29761.3, 30471.7, 29850.9, 30108.5, 30353.1, 30260.7, 29912.2, 30326.5, 30160.7, 31382.8, 31311.4, 31527.4, 31755.8, 31999.8, 31883.4, 32612.9, 33040.6, 33145, 31923.5, 32471, 33073.7, 33817.5, 34340, 33083.7, 32541.9, 31317.4, 31960.7, 33108.2, 33695.8, 34346.3, 33904.1, 33891.2, 34077.8, 33833.4, 34471.4, 34769.1, 34413.5, 34937.9, 34968.9, 34980, 35247.3, 35305.3, 35263.9, 35369.1, 35226.1, 36381.2, 36730.3],
  },
  {
    symbol: "^KS11",
    name: "KOSPI",
    region: "South Korea",
    flag: "🇰🇷",
    series: [3133.9, 3201.06, 3125.76, 3140.51, 3125.24, 3019.18, 2956.3, 3015.06, 3006.16, 2970.68, 2969.27, 2968.8, 2971.02, 2936.44, 2968.33, 3010.23, 3017.73, 3012.43, 2977.65, 2954.89, 2921.92, 2834.29, 2663.34, 2750.26, 2747.71, 2744.52, 2676.76, 2713.43, 2661.28, 2707.02, 2729.98, 2739.85, 2700.39, 2696.06, 2704.71, 2695.05, 2644.51, 2604.24, 2639.29, 2638.05, 2670.65, 2595.87, 2440.93, 2366.6, 2305.42, 2350.61, 2330.98, 2393.14, 2451.5, 2490.8, 2527.94, 2492.69, 2481.03, 2409.41, 2384.28, 2382.78, 2290, 2155.49, 2232.84, 2212.55, 2213.12, 2268.4, 2348.43, 2483.16, 2444.48, 2437.86, 2434.33, 2389.04, 2360.02, 2313.69, 2236.4, 2289.97, 2386.09, 2395.26, 2484.02, 2480.4, 2469.73, 2451.21, 2423.61, 2432.07, 2394.59, 2395.69, 2414.96, 2476.86, 2490.41, 2571.49, 2544.4, 2501.53, 2500.94, 2475.42, 2537.79, 2558.81, 2601.36, 2641.16, 2625.79, 2570.1, 2564.28, 2526.71, 2628.3, 2609.76, 2608.32, 2602.8, 2591.26, 2504.5, 2519.14, 2563.71, 2547.68, 2601.28, 2508.13, 2465.07, 2408.73, 2456.15, 2375, 2302.81, 2368.34, 2409.66, 2469.85, 2496.63, 2505.01, 2517.85, 2563.56, 2599.51, 2655.28, 2578.08, 2525.05, 2472.74, 2478.56, 2615.31, 2620.32, 2648.76, 2667.7, 2642.36, 2680.35, 2666.84, 2748.56, 2746.63, 2714.21, 2681.82, 2591.86, 2656.33, 2676.63, 2727.63, 2724.62, 2687.6, 2636.52, 2722.67, 2758.42, 2784.26, 2797.82, 2862.23, 2857, 2795.46, 2731.9, 2676.19, 2588.43, 2697.23, 2701.69, 2674.31, 2544.28, 2575.41, 2593.37, 2649.78, 2569.71, 2596.91, 2593.82, 2583.27, 2542.36, 2561.15, 2416.86, 2501.24, 2455.91, 2428.16, 2494.46, 2404.15, 2404.77, 2441.92, 2515.78, 2523.55, 2536.8, 2517.37, 2521.92, 2591.05, 2654.58, 2532.78, 2563.48, 2566.36, 2643.13, 2557.98, 2465.42, 2432.72, 2483.42, 2546.3, 2559.79, 2577.27, 2626.87, 2592.09, 2697.67, 2812.05, 2894.62, 3021.84, 3055.94, 3054.28, 3175.77, 3188.07, 3196.05, 3119.41, 3210.01, 3225.66, 3168.73, 3186.01, 3205.12, 3395.54, 3445.24, 3386.05, 3549.21, 3610.6, 3748.89, 3941.59, 4107.5, 3953.76, 4011.57, 3853.26, 3926.59, 4100.05, 4167.16, 4020.55, 4129.68, 4309.63, 4586.32, 4840.74, 4990.07, 5224.36, 5089.14, 5507.01, 5808.53, 6244.13, 5584.87, 5487.24, 5781.2, 5438.87, 5377.3, 5858.87, 6191.92, 6475.63, 6598.87, 7498, 7493.18, 7847.71, 8476.15, 8160.59, 8123.62, 9052.42, 8411.21, 8088.34, 7475.94, 6820.6, 6690.62, 6595.45, 6258.77, 6977.94],
  },
  {
    symbol: "^TWII",
    name: "TAIEX",
    region: "Taiwan",
    flag: "🇹🇼",
    series: [17209.93, 17516.92, 17474.57, 17276.79, 17260.19, 16570.89, 16640.43, 16781.19, 16888.74, 16987.41, 17296.9, 17518.13, 17818.31, 17369.39, 17697.14, 17826.26, 17812.59, 17961.64, 18218.84, 18169.76, 18403.33, 17899.3, 17674.4, 17674.4, 18310.94, 18232.35, 17652.18, 17736.52, 17264.74, 17456.52, 17676.95, 17625.59, 17284.54, 17004.18, 17025.09, 16592.18, 16408.2, 15832.54, 16144.85, 16266.22, 16552.57, 16460.12, 15641.26, 15303.32, 14343.08, 14464.53, 14550.62, 14949.36, 15000.07, 15036.04, 15288.97, 15408.78, 15278.44, 14673.04, 14583.42, 14561.76, 14118.38, 13424.58, 13702.28, 13128.12, 12819.2, 12788.42, 13026.71, 14007.56, 14504.99, 14778.51, 14970.68, 14705.43, 14528.55, 14271.63, 14137.69, 14373.34, 14824.13, 14932.93, 14932.93, 15602.66, 15586.65, 15479.7, 15503.79, 15608.42, 15526.2, 15452.96, 15914.7, 15868.06, 15836.5, 15929.43, 15602.99, 15579.18, 15626.07, 15502.36, 16174.92, 16505.05, 16706.91, 16886.4, 17288.91, 17202.4, 16915.54, 16664.21, 17283.71, 17030.7, 17292.93, 16843.68, 16601.25, 16381.31, 16481.58, 16644.94, 16576.02, 16920.92, 16344.48, 16353.74, 16520.57, 16782.57, 16440.72, 16134.61, 16507.65, 16682.67, 17208.95, 17287.42, 17438.35, 17383.99, 17673.87, 17596.63, 17930.81, 17519.14, 17512.83, 17681.52, 17995.03, 18059.93, 18096.07, 18607.25, 18889.19, 18935.93, 19785.32, 19682.5, 20228.43, 20294.45, 20337.6, 20736.57, 19527.12, 20120.51, 20330.32, 20708.84, 21258.47, 21565.34, 21174.22, 21858.38, 22504.72, 23253.39, 23032.25, 23556.59, 23916.93, 22869.26, 22119.21, 21638.09, 21469, 22349.33, 22158.05, 22268.09, 21435.19, 21759.65, 22159.42, 22822.79, 22302.71, 22901.64, 23487.27, 23348.45, 22780.08, 23553.89, 22742.77, 22904.32, 22262.5, 23193.27, 23020.48, 22510.25, 23275.68, 22908.3, 23011.86, 23148.08, 23525.41, 23525.41, 23478.27, 23152.61, 23730.25, 23053.18, 22576.07, 21968.05, 22209.1, 21602.89, 21298.22, 19528.77, 19395.03, 19872.73, 20787.64, 20915.04, 21843.69, 21652.24, 21347.3, 21660.66, 22072.95, 22045.74, 22580.08, 22547.5, 22751.03, 23383.13, 23364.38, 23434.38, 24021.26, 24334.48, 23764.47, 24233.1, 24494.58, 25474.64, 25578.37, 25580.32, 26761.06, 27301.92, 27302.37, 27532.26, 28233.35, 27651.41, 27397.5, 26434.94, 27626.48, 27980.89, 28198.02, 27696.35, 28556.02, 29349.81, 30288.96, 31408.7, 31961.51, 32063.75, 31782.92, 33605.71, 33605.71, 35414.49, 33599.54, 33400.32, 33543.88, 33112.59, 32572.43, 35417.83, 36804.34, 38932.4, 38926.63, 41603.94, 41172.36, 42267.97, 44732.94, 45070.94, 44169.04, 46465.2, 44571.76, 46780.62, 45354.61, 42671.27, 43654.84, 43119.75, 44225.91, 45811.01],
  },
];

/** Latest close date across the AI universe, ISO yyyy-mm-dd. */
export const AI_STOCKS_ASOF = "2026-08-17";

/** Weekly points each 5-year series carries — the window maths in
 *  chart-window.ts counts weeks back from the last point. */
export const AI_SERIES_POINTS = 260;
/* AI_STOCKS:END */
