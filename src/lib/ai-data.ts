import type {
  AICapexPlan,
  AIDeal,
  AIFigure,
  AIFundingQuarter,
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
   moved, because the revision is itself the story. */
export const AI_CAPEX: AICapexPlan[] = [
  {
    company: "Amazon",
    ticker: "AMZN",
    low: 220,
    high: 220,
    priorYear: 118,
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
    priorYear: 91,
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
    priorYear: 88,
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
    priorYear: 72,
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
    id: "power",
    label: "Data-centre electricity demand",
    value: ">1,000 TWh",
    detail: "Global, 2026 — roughly Japan's total consumption · AI-focused sites grew 50% in 2025",
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
    detail: "SK hynix share of HBM revenue in Q1 2026 · Samsung and Micron near 21% each",
    source: "Counterpoint via Silicon Analysts",
    sourceUrl: "https://siliconanalysts.com/market",
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
  { month: "May 2026", aiSharePct: 39, totalCuts: 38242 },
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
    sourceUrl: "https://epoch.ai/data-insights",
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
    currency: "USD",
    value: 495.4,
    dailyChange: -0.3,
    weekChange: -0.92,
    monthChange: 23.51,
    ytdChange: 4.75,
    high52w: 542.07,
    low52w: 352.83,
    realizedVol: 49.16,
    sparkline: [322.93, 316.88, 319.97, 327.76, 329.91, 338.7, 319.53, 313.64, 319.36, 331.16, 331.32, 327.89, 346.07, 363.2, 369.67, 377.85, 378.91, 370.95, 365.93, 373.54, 375.28, 367.75, 388.47, 396.51, 409.72, 405.65, 415.26, 402.79, 407.54, 414.92, 404.52, 417.32, 422.86, 421.44, 426.28, 413.64, 400.96, 402.25, 413.54, 413.72, 425.34, 430.32, 416.07, 427.87, 448.37, 450.95, 459.28, 466.25, 443.52, 428.9, 418.35, 399.61, 414.01, 424.8, 413.84, 408.9, 423.04, 430.81, 432.11, 420.69, 414.71, 418.74, 427.51, 431.95, 411.46, 423.03, 415.76, 418.79, 431.2, 443.33, 454.46, 439.33, 418.58, 418.95, 424.58, 444.06, 415.06, 409.75, 408.43, 404, 388.49, 380.16, 388.56, 391.26, 378.8, 359.84, 388.45, 359.12, 391.16, 436.17, 438.73, 454.27, 450.18, 461.97, 472.75, 479.14, 490.11, 497.41, 496.62, 505.82, 505.27, 512.57, 527.75, 529.24, 509.77, 504.26, 505.12, 498.41, 509.04, 509.23, 517.95, 523.98, 513.57, 516.79, 531.52, 517.03, 506, 507.49, 474, 490, 492.02, 474.82, 484.92, 487.48, 483.47, 459.38, 451.14, 433.5, 414.19, 404.37, 398.46, 401.72, 410.68, 401.86, 389.02, 365.97, 369.37, 373.07, 420.26, 415.75, 407.78, 420.77, 409.43, 419.09, 426.99, 428.05, 390.34, 379.4, 372.97, 386.74, 390.99, 402.29, 381.7, 464.72, 499.99, 495.4],
  },
  {
    symbol: "GOOGL",
    ticker: "GOOGL",
    company: "Alphabet",
    layer: "platform",
    currency: "USD",
    value: 345.9,
    dailyChange: -0.13,
    weekChange: -2.37,
    monthChange: -2.41,
    ytdChange: 9.76,
    high52w: 402.62,
    low52w: 199.32,
    realizedVol: 43.87,
    sparkline: [129.69, 129.92, 129.78, 136.17, 135.26, 138.1, 130.44, 132.31, 135.07, 138.97, 137.75, 122.28, 126.45, 131.84, 134.62, 138.49, 132.53, 136.93, 131.94, 140.42, 140.23, 135.73, 142.65, 145.99, 153.51, 143.68, 147.53, 141.12, 137.57, 133.35, 137.67, 147.68, 150.07, 154.56, 156.6, 154.86, 156.28, 166.15, 168.1, 169.14, 176.92, 176.4, 173.79, 175.01, 177.24, 184.03, 185.24, 191.18, 181.02, 172.63, 171.54, 158.29, 164.16, 167.18, 164.68, 156.45, 151.16, 159.81, 161.49, 166.99, 164.38, 165.46, 165.14, 169.68, 169.74, 181.62, 175.3, 167.65, 171.34, 185.17, 195.42, 196.11, 189.43, 192.04, 192.91, 200.21, 204.02, 185.34, 185.23, 179.25, 167.01, 165.87, 165.49, 163.99, 154.33, 145.6, 157.14, 147.67, 160.61, 164.21, 152.75, 166.19, 168.47, 169.03, 176.09, 176.77, 166.77, 176.23, 174.36, 182, 191.34, 195.75, 194.67, 203.34, 201.57, 208.49, 211.35, 239.63, 251.16, 251.66, 243.1, 245.76, 245.45, 256.55, 269.27, 283.72, 290.1, 285.02, 318.58, 315.81, 317.08, 308.22, 309.78, 313.85, 321.98, 335.84, 330.54, 338.25, 333.04, 310.96, 302.85, 307.38, 300.88, 303.55, 307.13, 280.92, 297.39, 318.49, 336.02, 338.89, 384.8, 397.99, 401.07, 387.66, 390.13, 372.19, 357.77, 368.03, 337.39, 366.46, 352.51, 351.99, 319.74, 356.13, 354.3, 345.9],
  },
  {
    symbol: "AMZN",
    ticker: "AMZN",
    company: "Amazon",
    layer: "platform",
    currency: "USD",
    value: 262.65,
    dailyChange: -0.94,
    weekChange: -4.31,
    monthChange: 5.11,
    ytdChange: 15.96,
    high52w: 284.02,
    low52w: 198.79,
    realizedVol: 51.43,
    sparkline: [138.56, 133.98, 131.84, 138.01, 137.85, 144.72, 129.33, 125.98, 125.96, 132.33, 128.4, 119.57, 137, 142.08, 143.2, 146.71, 146.09, 146.88, 147.42, 153.84, 153.38, 145.24, 154.62, 154.78, 161.26, 170.31, 172.34, 167.08, 174.73, 177.58, 171.96, 174.48, 179.71, 180.69, 185.67, 183.62, 177.23, 180.96, 188.7, 186.57, 183.54, 182.15, 179.34, 187.06, 184.06, 186.34, 200, 199.79, 187.93, 180.83, 186.98, 161.93, 170.23, 178.88, 173.12, 173.33, 184.52, 186.43, 192.53, 185.13, 182.72, 187.69, 189.7, 190.83, 199.5, 208.91, 201.7, 201.45, 213.44, 225.04, 231.15, 229.05, 220.22, 218.94, 220.66, 234.85, 237.68, 229.15, 228.68, 212.71, 205.02, 194.54, 197.95, 196.21, 192.72, 171, 184.87, 167.32, 187.7, 186.35, 193.06, 205.59, 200.99, 206.65, 216.98, 216.1, 212.77, 219.39, 219.36, 226.35, 227.47, 231.01, 213.75, 221.47, 228.01, 227.94, 225.34, 238.24, 234.05, 220.71, 219.57, 221.78, 216.39, 216.48, 226.97, 254, 248.4, 232.87, 226.28, 234.42, 227.92, 222.54, 228.43, 232.53, 241.56, 236.65, 234.34, 241.73, 232.99, 204.08, 204.86, 207.92, 218.94, 209.53, 208.76, 207.54, 210.57, 233.65, 249.7, 255.08, 265.06, 271.17, 267.22, 268.46, 274, 253.79, 241.51, 244.39, 232.69, 244.16, 247.31, 249.99, 232.11, 271.58, 274.48, 262.65],
  },
  {
    symbol: "META",
    ticker: "META",
    company: "Meta Platforms",
    layer: "platform",
    currency: "USD",
    value: 589.85,
    dailyChange: -0.86,
    weekChange: -0.38,
    monthChange: -11.24,
    ytdChange: -9.31,
    high52w: 785.23,
    low52w: 525.72,
    realizedVol: 47.48,
    sparkline: [305.74, 285.09, 286.75, 295.89, 298.67, 311.72, 295.73, 303.96, 304.79, 324.16, 312.81, 288.35, 311.85, 319.78, 332.71, 341.49, 327.15, 326.59, 333.17, 354.09, 358.32, 351.95, 374.49, 381.78, 401.02, 459.41, 468.9, 471.75, 481.74, 498.19, 483.59, 496.98, 503.02, 497.37, 516.9, 500.23, 481.73, 432.62, 465.68, 468.01, 468.84, 479.92, 476.99, 502.6, 506.63, 510.6, 509.5, 534.69, 461.99, 461.27, 474.83, 494.09, 528.54, 526.73, 519.1, 512.74, 511.83, 537.95, 568.31, 576.47, 592.89, 586.27, 582.01, 593.28, 572.43, 584.82, 554.4, 565.11, 613.65, 619.32, 619.44, 607.75, 599.24, 615.86, 611.3, 647.49, 689.18, 714.52, 736.67, 668.13, 655.05, 597.99, 607.6, 596.25, 576.74, 504.73, 543.57, 484.66, 549.74, 599.27, 592.49, 640.34, 627.06, 670.9, 694.06, 702.12, 712.2, 738.09, 720.67, 710.39, 704.81, 700, 763.46, 790, 751.48, 753.3, 735.11, 765.7, 779, 755.4, 734.38, 713.08, 708.65, 732.17, 750.82, 637.71, 631.76, 602.01, 613.05, 647.1, 656.96, 647.51, 661.5, 665.95, 648.69, 615.52, 647.63, 738.31, 668.99, 668.69, 644.78, 657.01, 660.57, 638.18, 606.7, 547.54, 579.23, 628.39, 676.87, 659.15, 611.91, 616.81, 618.43, 607.38, 635.29, 627.57, 568.43, 577.22, 550.25, 600.29, 656.73, 645.85, 595.19, 556.71, 592.1, 589.85],
  },
  {
    symbol: "PLTR",
    ticker: "PLTR",
    company: "Palantir",
    layer: "platform",
    currency: "USD",
    value: 174.04,
    dailyChange: -2.78,
    weekChange: 1.18,
    monthChange: 29.46,
    ytdChange: 3.68,
    high52w: 207.18,
    low52w: 107.27,
    realizedVol: 91.05,
    sparkline: [15.41, 14.15, 14.14, 14.98, 15.21, 15.83, 14, 15.77, 15.81, 17.94, 17.06, 15.29, 14.92, 18.49, 19.95, 19.69, 20.05, 17.22, 18.21, 17.59, 17.56, 15.98, 16.76, 17.6, 17.09, 16.72, 25.05, 23.4, 23.56, 24.04, 25.35, 24, 24.51, 22.72, 22.81, 21.9, 20.97, 22.83, 25.21, 20.94, 21.62, 21.05, 22.1, 23.13, 25.02, 24.56, 25.83, 28.42, 28.22, 26.6, 26.89, 26.59, 30.39, 32.32, 30.84, 30.59, 34.85, 36.38, 37.12, 36.46, 41.45, 42.43, 42.94, 44.93, 51.13, 59.85, 61.26, 64.65, 70.96, 70.89, 74.39, 82.38, 75.19, 67.26, 69.24, 78.98, 82.49, 110.85, 119.16, 90.68, 83.42, 76.38, 86.24, 90.96, 85.85, 74.01, 88.55, 90.8, 114.65, 123.77, 117.3, 129.52, 123.31, 132.04, 132.06, 141.41, 143.23, 136.32, 139.71, 148.58, 149.07, 156.24, 173.27, 186.97, 157.75, 157.17, 157.09, 162.36, 170.26, 182.55, 182.42, 182.17, 179.74, 181.59, 189.18, 207.18, 193.61, 171.25, 162.25, 170.69, 181.84, 183.25, 193.98, 180.84, 181.68, 178.4, 165.9, 151.86, 139.54, 135.68, 134.89, 135.94, 152.67, 153.5, 155.68, 147.56, 146.49, 130.49, 142.76, 141.57, 139.11, 137.05, 133.73, 137.41, 143.34, 141.7, 131.08, 128.47, 112.93, 132.54, 130.04, 134.85, 122.92, 123.06, 172.01, 174.04],
  },
  {
    symbol: "NOW",
    ticker: "NOW",
    company: "ServiceNow",
    layer: "platform",
    currency: "USD",
    value: 124,
    dailyChange: -2.55,
    weekChange: -0.7,
    monthChange: 19.22,
    ytdChange: -15.9,
    high52w: 192.23,
    low52w: 83,
    realizedVol: 56.33,
    sparkline: [111, 108.73, 109.91, 117.77, 119.86, 118.02, 109.91, 110.7, 109.43, 112.03, 112, 110.19, 118.7, 125.07, 130.18, 133.93, 137.15, 137.54, 136.08, 140.15, 140.49, 135.23, 145.84, 150.49, 157.45, 156.97, 157.47, 150.57, 155.93, 155.22, 151.35, 151.16, 154.93, 151.4, 156.44, 147.16, 144.39, 144.23, 145.31, 146.02, 154.84, 145.77, 134.4, 141.83, 145.1, 150.96, 158.82, 148.63, 147.21, 146.17, 162.88, 158.59, 163.76, 167.64, 166.35, 166.97, 175.19, 178.08, 178.01, 173.44, 184.4, 185.59, 183.59, 190.62, 194.21, 209.66, 201.07, 210.54, 211.46, 225.57, 222.94, 221.11, 210.87, 204.91, 211.43, 225, 203.68, 201.66, 197.33, 185.52, 182.06, 156.77, 168.87, 165.55, 159.55, 144.33, 157.13, 151.2, 187.48, 195.61, 196.01, 208.04, 200.87, 202.42, 205.37, 201.03, 199.26, 205.62, 204.6, 191.38, 192.47, 198.64, 181.02, 170.69, 177.36, 175.99, 182.28, 186.73, 186.4, 185.53, 184.06, 180.85, 182.25, 183.51, 189.26, 182.77, 173.26, 167.16, 163.17, 164.88, 170.98, 153.04, 156.68, 154.23, 150.9, 134.61, 128.56, 116.73, 111.07, 100.58, 107.37, 109.3, 120.38, 112.97, 113.27, 103.64, 104.04, 89.81, 96.44, 84.78, 88.31, 93.59, 90.5, 99.69, 108.73, 119.36, 103.08, 95.04, 98.34, 107.93, 111.26, 104.7, 98.78, 111.23, 124.88, 124],
  },
  {
    symbol: "NVDA",
    ticker: "NVDA",
    company: "NVIDIA",
    layer: "silicon",
    currency: "USD",
    value: 225.16,
    dailyChange: -0.06,
    weekChange: 0.54,
    monthChange: 8.56,
    ytdChange: 19.23,
    high52w: 235.74,
    low52w: 165.17,
    realizedVol: 39.34,
    sparkline: [42.39, 43.34, 47.16, 49.35, 46.24, 45.58, 41.02, 43.09, 44.69, 46.94, 42.1, 40.33, 42.33, 46.57, 48.89, 48.72, 46.77, 46.6, 48.35, 48.99, 49.52, 49.1, 54.71, 59.65, 62.47, 69.33, 72.25, 69.45, 79.09, 85.24, 85.77, 88.46, 95, 89.45, 85.35, 86, 79.52, 87.76, 92.14, 90.4, 94.78, 113.9, 116.44, 121.79, 130.98, 126.09, 122.67, 134.91, 117.99, 114.25, 117.02, 104.25, 116.14, 127.25, 128.3, 106.21, 116.91, 113.37, 123.51, 117, 132.89, 131.6, 143.59, 141.25, 139.91, 148.29, 140.15, 136.02, 140.26, 135.07, 130.39, 140.22, 138.31, 135.91, 133.57, 142.62, 120.07, 129.84, 138.85, 130.28, 114.06, 106.98, 121.67, 117.7, 109.67, 94.31, 110.93, 96.91, 108.73, 113.82, 116.65, 135.4, 131.29, 137.38, 142.63, 144.69, 147.9, 157.99, 160, 170.7, 167.03, 175.51, 178.26, 183.16, 175.64, 179.81, 170.78, 170.76, 174.88, 178.43, 186.58, 185.04, 180.03, 182.64, 191.49, 206.88, 199.05, 186.6, 182.55, 181.46, 184.97, 176.29, 183.69, 187.54, 189.11, 183.14, 184.84, 192.51, 174.19, 190.05, 187.9, 184.89, 183.34, 183.14, 178.56, 171.24, 175.75, 183.91, 198.35, 199.64, 199.57, 211.5, 235.74, 219.51, 214.25, 218.66, 204.87, 210.69, 192.53, 195.55, 203.53, 203.28, 206.84, 200.75, 223.96, 225.16],
  },
  {
    symbol: "AVGO",
    ticker: "AVGO",
    company: "Broadcom",
    layer: "silicon",
    currency: "USD",
    value: 392.99,
    dailyChange: -5.94,
    weekChange: -8.13,
    monthChange: 4.95,
    ytdChange: 13.05,
    high52w: 481.57,
    low52w: 289.6,
    realizedVol: 44.88,
    sparkline: [84.29, 82.71, 85.45, 92.29, 85.7, 87.16, 80.84, 83.2, 82.39, 90.56, 86.78, 82.68, 85.29, 91.11, 97.54, 97.2, 92.57, 92.23, 110.65, 112.73, 112.24, 104.93, 110.77, 122.05, 121.78, 124.31, 126.5, 122.65, 130.91, 140.23, 129.31, 123.72, 135.16, 133.88, 133.41, 131.07, 122.45, 133.86, 131.03, 133.75, 141.4, 141.24, 133.08, 144.05, 182.89, 158.08, 165.75, 174.47, 155.98, 151.34, 160.68, 143.92, 156.16, 165.95, 161.39, 154.12, 158.27, 161.67, 175.52, 167.47, 180.73, 175.98, 179.38, 179.24, 173.9, 176.22, 165.67, 164.82, 168.15, 171.81, 240.23, 239.68, 231.98, 224.31, 229.41, 244.7, 221.27, 224.87, 233.04, 207.93, 187.37, 184.45, 195.54, 191.66, 169.12, 146.29, 181.94, 166.21, 192.47, 200.72, 208.2, 228.61, 228.72, 248.71, 244.28, 252.1, 263.77, 275.65, 271.8, 280.94, 278.59, 297.42, 292.93, 312.83, 294.91, 294.23, 298.24, 336.67, 360, 338.94, 329.91, 336.41, 344.13, 349.24, 362.05, 362.55, 358.39, 342.65, 377.96, 381.57, 406.29, 339.81, 341.45, 349.85, 343.5, 339.89, 325.49, 330.73, 308.05, 342.76, 333.99, 321.7, 332.77, 335.97, 319.84, 309.42, 313.49, 354.91, 398.47, 419.94, 417.43, 412.56, 439.79, 414.57, 426.58, 418.91, 385.57, 411.35, 365.02, 373.9, 384.05, 378.16, 381.92, 389.28, 427.76, 392.99],
  },
  {
    symbol: "AMD",
    ticker: "AMD",
    company: "AMD",
    layer: "silicon",
    currency: "USD",
    value: 514.39,
    dailyChange: 6.5,
    weekChange: 6.42,
    monthChange: 2.68,
    ytdChange: 130.18,
    high52w: 580.91,
    low52w: 151.14,
    realizedVol: 78.83,
    sparkline: [110.23, 104.44, 101.8, 105.72, 106.59, 106.63, 96.11, 102.76, 102.91, 108.79, 102.4, 93.67, 108.04, 113.59, 118, 122.51, 121.16, 128.37, 138, 139.91, 148.76, 138.58, 146.56, 168.18, 177.83, 174.23, 171.91, 165.69, 176.01, 205.36, 198.39, 190.65, 178.63, 178.7, 170.78, 160.32, 148.64, 160.2, 155.78, 150.56, 166.33, 171.61, 159.99, 160.34, 158.4, 160.25, 164.31, 183.96, 159.43, 144.63, 144.48, 130.18, 141.13, 156.4, 150.5, 140.87, 149.86, 148.29, 162.02, 159.75, 172.8, 156.64, 154.09, 166.25, 141.66, 143.63, 138.93, 141.13, 141.98, 127.74, 125.02, 126.29, 120.63, 116.04, 118.44, 122.84, 115.95, 107.56, 113.1, 108.11, 98.23, 96.63, 100.97, 106.44, 103.22, 85.76, 93.4, 85.56, 96.39, 100.59, 102.84, 117.17, 110.31, 114.63, 121.73, 126.39, 138.43, 141.9, 137.82, 155.61, 154.72, 177.44, 174.31, 174.95, 166.55, 163.36, 162.32, 155.82, 160.46, 160.9, 161.79, 211.51, 218.09, 240.56, 259.67, 259.65, 243.98, 240.52, 215.05, 215.24, 221.62, 207.58, 214.95, 215.34, 210.02, 223.6, 253.73, 252.18, 200.19, 213.58, 203.37, 203.68, 199.45, 197.74, 205.27, 203.77, 210.21, 236.64, 278.26, 305.33, 354.49, 408.46, 449.7, 449.59, 518.09, 523.2, 488.45, 537.37, 521.58, 552.05, 534.39, 503.57, 521.95, 476.15, 483.36, 514.39],
  },
  {
    symbol: "TSM",
    ticker: "TSM",
    company: "TSMC (ADR)",
    layer: "silicon",
    currency: "USD",
    value: 426.35,
    dailyChange: -0.96,
    weekChange: 1.5,
    monthChange: 4.05,
    ytdChange: 33.4,
    high52w: 477.57,
    low52w: 227.33,
    realizedVol: 40.96,
    sparkline: [94.8, 91.64, 92.53, 93.57, 90.05, 91.47, 85.36, 86.41, 87.03, 92.42, 92.91, 87.45, 87.8, 92, 98.8, 98.65, 97.31, 99.29, 103.45, 102.55, 104.7, 99.61, 101.24, 113.03, 116.98, 118.79, 130.46, 125.33, 130.64, 138.26, 139.02, 136.64, 140.23, 140.22, 145.4, 140.14, 129.75, 138.5, 142.83, 146.41, 153.55, 159.41, 152.47, 168.16, 177.24, 172.6, 175.7, 191.05, 171.2, 159.8, 165.8, 155.39, 172.34, 172.04, 170.55, 160.87, 170.23, 167.28, 182.35, 172.07, 186.05, 187.13, 198.48, 196.94, 195.76, 191.77, 187.48, 185.08, 198.89, 191.94, 200.66, 206.33, 201.58, 208.37, 214.79, 221.88, 209.32, 206.12, 203.9, 191.65, 172.97, 170.65, 174.09, 176.73, 165.25, 146.8, 157.08, 147.86, 163.4, 176.4, 176.52, 194.22, 191.98, 194.84, 207, 215.68, 220.09, 226.49, 227.86, 236.95, 234.6, 241.33, 232.47, 244.29, 232.7, 235.59, 228.39, 250.92, 262.06, 282.71, 279.29, 294.03, 295.94, 297.7, 298.25, 304.86, 295.27, 282.01, 284.64, 292.09, 303.41, 287.74, 293.28, 299.58, 318.68, 327.11, 327.37, 339.55, 325.74, 374.09, 360.39, 376.81, 353.86, 336.71, 338.79, 326.11, 341.49, 365.49, 363.35, 382.66, 396.06, 414.15, 417.72, 407.15, 424.86, 444.92, 421.07, 462.12, 432.35, 451.79, 421.58, 402.3, 403.41, 404.25, 420.04, 426.35],
  },
  {
    symbol: "ASML",
    ticker: "ASML",
    company: "ASML (ADR)",
    layer: "silicon",
    currency: "USD",
    value: 1844.08,
    dailyChange: -0.21,
    weekChange: 5.92,
    monthChange: 3.32,
    ytdChange: 58.46,
    high52w: 1989.44,
    low52w: 725.85,
    realizedVol: 45.51,
    sparkline: [677.81, 644.34, 647.82, 660.53, 637.79, 621.9, 582.12, 580.65, 581.69, 616.76, 587.73, 588.2, 608.27, 639.29, 678, 684.8, 683.76, 699.65, 753.71, 755.27, 757.85, 703.34, 713.22, 766.68, 882.62, 898.54, 929.21, 909.57, 947.59, 998.04, 962.67, 941.34, 978.93, 966.71, 989.83, 954.82, 872.05, 909.77, 916.92, 917.24, 939.44, 991.85, 950.81, 1041.71, 1052.47, 1023.34, 1047.89, 1098.95, 932.06, 872.75, 936.7, 843.01, 869.49, 926.18, 889.88, 811.48, 800.14, 787.84, 818.18, 822.35, 824.26, 730.43, 720.91, 715.14, 676.46, 669.18, 665.23, 684.47, 718.06, 705.27, 735.19, 719.71, 700.42, 739.01, 750.28, 732.25, 739.31, 727.7, 751.55, 735.96, 699.86, 683.11, 714, 716.22, 674.58, 605.55, 668.81, 624.69, 672.76, 683.36, 706.21, 748.1, 732.49, 746.53, 770.2, 775.23, 813.36, 801.39, 794.1, 823.02, 705.48, 718.49, 689.63, 741.79, 743.61, 754.46, 725.85, 805.13, 878.42, 963.51, 968.09, 1002.3, 983.18, 1042.15, 1059.98, 1066.82, 1038.79, 1020, 987.82, 1108.78, 1111.44, 1087.82, 1056.98, 1072.14, 1228.47, 1263.72, 1395, 1455.16, 1339.13, 1435.63, 1458.93, 1463.8, 1368.36, 1351.58, 1366.39, 1329.5, 1359.76, 1448.64, 1410.83, 1417.8, 1438.99, 1516.6, 1584.51, 1592, 1605.77, 1757.47, 1899.48, 1929.68, 1794.62, 1825.07, 1726.04, 1739.02, 1757.09, 1629, 1740.99, 1844.08],
  },
  {
    symbol: "MU",
    ticker: "MU",
    company: "Micron",
    layer: "silicon",
    currency: "USD",
    value: 971.66,
    dailyChange: 2.3,
    weekChange: 10.72,
    monthChange: 13.88,
    ytdChange: 208.05,
    high52w: 1213.56,
    low52w: 115.79,
    realizedVol: 94.17,
    sparkline: [65.44, 63.56, 63.69, 69.94, 69.87, 71.79, 67.9, 65.2, 69.05, 69.75, 67.53, 64.53, 69.4, 72.28, 77.14, 77.1, 76.12, 73.65, 82.19, 85.48, 86, 83.45, 82.39, 89.24, 89.07, 86.98, 85.7, 80.71, 89.46, 95.77, 94.51, 93.78, 117.13, 122.75, 122.63, 121.37, 109.12, 114.36, 120.13, 123, 129, 132.67, 126.64, 134.82, 147.83, 141.12, 132.59, 136.39, 119.5, 110.28, 109.82, 89, 97.44, 107.99, 97.86, 89.29, 90.65, 87.35, 95.77, 100.31, 102.54, 104.32, 107.82, 108.18, 105.49, 104.1, 97.51, 104.48, 99.84, 98.1, 108.6, 89.28, 87.33, 99.34, 102.6, 103.19, 91.24, 92.3, 99.52, 95.41, 90.54, 87.08, 100.79, 94.72, 88.44, 64.72, 69.55, 66.74, 78.56, 80.42, 85.86, 98, 93.37, 98.18, 110.95, 119.84, 127.91, 123.25, 124.42, 120.11, 109.22, 111.96, 109.06, 127.75, 122.05, 116.42, 118.48, 135.24, 158.82, 166.41, 167.32, 185.69, 187.06, 206.77, 220.1, 234.7, 253.3, 241.95, 223.93, 239.49, 252.42, 237.5, 276.59, 292.63, 339.55, 333.35, 397.58, 435.79, 379.4, 410.34, 417.35, 415.56, 397.05, 405.35, 444.27, 355.46, 367.85, 421.51, 457.23, 481.72, 517.16, 646.63, 776.01, 762.1, 923.52, 996, 995.87, 1133.99, 1132.33, 984.75, 937, 865.46, 920.95, 823.03, 877.57, 971.66],
  },
  {
    symbol: "ARM",
    ticker: "ARM",
    company: "Arm Holdings",
    layer: "silicon",
    currency: "USD",
    value: 279.44,
    dailyChange: 0.28,
    weekChange: -1.11,
    monthChange: 6.65,
    ytdChange: 143.56,
    high52w: 439.46,
    low52w: 104.55,
    realizedVol: 89.04,
    sparkline: [63.59, 52.16, 52.99, 53.46, 54.68, 51.9, 52.37, 49.29, 55.27, 51.69, 58.68, 61.92, 63.59, 64.89, 68.87, 73.41, 68.92, 71.88, 69.86, 75.74, 71.97, 72.98, 119.98, 121.77, 137.95, 134.07, 129.5, 129.75, 138.31, 124.28, 129.25, 122.32, 93.11, 103.24, 101.7, 108.84, 110.35, 112.53, 120.52, 136.57, 157.89, 160.3, 163.62, 184.7, 177.53, 163.4, 149, 113.45, 118.43, 130.44, 129.72, 131.93, 123.09, 139.18, 140.59, 146.43, 137.03, 148.43, 152.5, 152.58, 157.17, 140.65, 141.96, 128.66, 139.68, 140.38, 139.64, 145, 126.87, 125.91, 144.38, 147.4, 166.56, 147.6, 173.26, 155.41, 154.36, 138.97, 124.78, 112.7, 119.72, 124.28, 106.98, 88.63, 105.06, 100.55, 111.65, 121.95, 124.81, 132.05, 127.18, 126.06, 138.61, 142.04, 149.33, 161.74, 147.79, 144.54, 161.92, 164.37, 140.05, 138.5, 138.91, 137.92, 142.55, 138.17, 150.64, 142.91, 140.65, 152.15, 170.66, 170.67, 165.71, 170.39, 160.19, 149.74, 136.04, 131.44, 139.19, 141.93, 121.1, 112.02, 110.86, 115.68, 104.99, 119.2, 109.96, 104.9, 125.28, 127.24, 131.74, 124.11, 120.1, 127.31, 134.96, 151.28, 143.86, 161.22, 175.49, 198.65, 203.26, 212.65, 215.12, 306.51, 408.85, 346.39, 412.55, 407.72, 343.58, 300.43, 298.99, 269.61, 266.33, 239.06, 282.57, 279.44],
  },
  {
    symbol: "MRVL",
    ticker: "MRVL",
    company: "Marvell",
    layer: "silicon",
    currency: "USD",
    value: 222.02,
    dailyChange: -0.07,
    weekChange: 1.51,
    monthChange: 17.91,
    ytdChange: 148.37,
    high52w: 316.43,
    low52w: 62.31,
    realizedVol: 87.73,
    sparkline: [58.93, 57.56, 57.29, 58.25, 56.58, 55.84, 51.84, 54, 53.1, 54.62, 50.69, 46.63, 47.7, 51.58, 57.17, 55.5, 55.73, 52.19, 59.29, 60.25, 61.3, 59.92, 65.68, 70.11, 70.14, 67.02, 70.42, 65.04, 68.62, 79.35, 72.36, 67.2, 66.12, 73.59, 73.34, 67.88, 62.88, 68.75, 69.82, 69.02, 74.47, 78.33, 66.38, 69.47, 71.82, 68.26, 71.6, 74.88, 67.93, 64.35, 66.98, 58.22, 64.05, 69.41, 69.71, 70.87, 74.89, 71.55, 71.18, 70.31, 73.11, 79.41, 83.35, 84.87, 87.19, 92.78, 88.71, 92.24, 95.91, 106.68, 112.25, 115.95, 113.56, 114.32, 117.58, 124.02, 112.86, 110.62, 106.51, 97.91, 85.83, 65.67, 68.74, 70.39, 62.04, 49.43, 53.39, 49.38, 58.7, 61.98, 59.65, 63.76, 60.69, 61.47, 69.14, 70.42, 75.21, 77.4, 71.95, 72.41, 71.99, 76.34, 76.63, 77.81, 72.07, 72.95, 64.6, 66.84, 68.86, 74.62, 84.07, 86.97, 86.22, 85.84, 88.71, 90.37, 93.23, 83.45, 83.79, 92.89, 88.9, 84.26, 84.8, 86.76, 84.64, 81.21, 83.1, 81.34, 73.73, 81.34, 79.61, 79.29, 75.68, 87.67, 89.53, 97.68, 106.71, 119.93, 133.37, 165.56, 165.15, 160.01, 182.58, 190.69, 204.83, 316.43, 280.71, 310.58, 266.77, 249.27, 217.53, 194.94, 194.23, 187.56, 218.72, 222.02],
  },
  {
    symbol: "VRT",
    ticker: "VRT",
    company: "Vertiv",
    layer: "infra",
    currency: "USD",
    value: 293.84,
    dailyChange: 2.36,
    weekChange: 7.87,
    monthChange: -0.09,
    ytdChange: 67.33,
    high52w: 376.23,
    low52w: 121.82,
    realizedVol: 78.44,
    sparkline: [33.87, 32.99, 35.01, 39.39, 39.6, 38.44, 36.32, 37, 38.18, 41.81, 37.42, 34.86, 40.23, 40.07, 43.5, 43.52, 43.66, 45.14, 47.24, 48.58, 48.96, 46.31, 49.52, 53.45, 54.9, 61.58, 61.32, 62.02, 66.31, 71.69, 67, 77.14, 81.95, 80.77, 81.8, 80.67, 76.07, 94.8, 97.26, 94.8, 99.32, 105.16, 92.09, 91.3, 89.55, 91.72, 88, 94.1, 81.78, 78.59, 78.7, 69.27, 76.24, 76.51, 80.21, 75.06, 82.39, 87.66, 100.74, 97.62, 106.82, 107.47, 112.47, 113.83, 112.44, 123.81, 123.02, 132.03, 128.16, 121.7, 120.69, 118.74, 118.3, 128.93, 132.59, 146.32, 117.02, 121.38, 108.05, 91.02, 85.41, 78.02, 87.45, 88.63, 74.25, 59.41, 69.61, 67.57, 86.15, 94.83, 94.06, 106.04, 104.14, 109.23, 112, 116.45, 122.32, 128.41, 125.89, 127.37, 125.29, 142.7, 138.76, 143.72, 129.05, 125.02, 124.01, 125.58, 136.65, 142.61, 150.86, 158.87, 175.15, 175.73, 192.9, 191.4, 187.84, 166.65, 168.91, 180.91, 178.38, 161.74, 166.25, 164.34, 171.54, 170.86, 181.12, 195.1, 182.56, 248.51, 243.06, 259.23, 249.75, 265.38, 269.17, 252.4, 259.37, 287.64, 294.13, 321.75, 328.49, 340.01, 376.23, 323.4, 314.18, 323.92, 297.88, 333.05, 303.95, 318.47, 305.87, 291.67, 290.36, 241.57, 272.4, 293.84],
  },
  {
    symbol: "ANET",
    ticker: "ANET",
    company: "Arista Networks",
    layer: "infra",
    currency: "USD",
    value: 198.82,
    dailyChange: -2.36,
    weekChange: 5.38,
    monthChange: 17.95,
    ytdChange: 48.82,
    high52w: 210.5,
    low52w: 116.13,
    realizedVol: 62.92,
    sparkline: [44.08, 45.69, 44.8, 48.81, 48.88, 46.89, 44.47, 46.11, 47.01, 48.25, 47.87, 42.46, 52.71, 52.4, 53.44, 54.42, 54.93, 53.82, 57.76, 58.83, 59.24, 57.73, 63.01, 66.65, 67.39, 68.24, 70.22, 64.9, 68.43, 71.99, 67.75, 72.33, 76.38, 72.71, 73.69, 65.8, 61.37, 65.92, 69.71, 77.47, 79.85, 76.87, 73.29, 74.39, 85.02, 83.63, 89.25, 90.94, 84.17, 81.47, 86.64, 80.89, 86.55, 88.45, 86.4, 81.51, 85.73, 90.43, 97.05, 95.46, 100.06, 98.08, 99.14, 100.39, 101.28, 98.89, 92.62, 99.93, 103.61, 104.78, 112.95, 114.65, 111.79, 114.34, 118.13, 129.17, 115.23, 118.47, 106.87, 92.69, 86.01, 77.56, 83.51, 83.13, 77.94, 64.37, 72.67, 67.67, 78.31, 90.38, 86.52, 96.42, 91.2, 89.78, 96.8, 95.09, 94.97, 102.31, 103.39, 107.37, 109.78, 118.62, 118.12, 141.25, 132.78, 133.04, 135.87, 141.91, 142.16, 144.09, 145.71, 145.29, 138.79, 146.48, 156.81, 157.59, 137.26, 127.26, 122.17, 127.22, 130.04, 125.89, 130.73, 132.44, 130.08, 125.09, 138.41, 148.15, 130.28, 140.66, 137.23, 130.25, 139.4, 134.03, 136.26, 122.55, 124.85, 146.05, 161.01, 172.55, 172.71, 141.75, 147.81, 148.59, 155.27, 166.01, 156.4, 169.67, 157.6, 173.28, 181.15, 169.35, 173.99, 180.35, 188.67, 198.82],
  },
  {
    symbol: "ETN",
    ticker: "ETN",
    company: "Eaton",
    layer: "infra",
    currency: "USD",
    value: 451.51,
    dailyChange: -0.4,
    weekChange: 0.63,
    monthChange: 13.94,
    ytdChange: 37.95,
    high52w: 459.96,
    low52w: 315.82,
    realizedVol: 48.08,
    sparkline: [216.93, 214.38, 220.91, 230.37, 234.81, 222.15, 210.65, 215.53, 203.18, 217.45, 199.91, 196.55, 214.83, 217.6, 225.65, 228.91, 227.69, 227.93, 237.7, 237.29, 240.75, 234.86, 242.11, 243.9, 248.72, 269.42, 274.05, 276.09, 284.3, 296.58, 292.7, 298.75, 311.88, 314.75, 313.87, 315.28, 308.09, 326.51, 327.24, 328.51, 333.25, 337.36, 316.17, 322.98, 325.33, 322.76, 313.28, 327.07, 311.5, 299.6, 304.79, 277.65, 295.39, 296.24, 296.03, 288.77, 297.14, 314.65, 328.55, 327.58, 335.58, 338.04, 343.55, 345.55, 337.48, 368.99, 357.83, 376.68, 373.75, 358.49, 347.08, 341.54, 331.96, 341.45, 345.19, 368.98, 326.44, 313.05, 309.17, 289.85, 278.46, 277.61, 293.61, 295.44, 274.17, 246.52, 277.53, 259.47, 287.74, 298.58, 309.87, 329.07, 321.06, 318.86, 325.81, 338.01, 343.26, 356.99, 356.98, 362.11, 372.65, 390.01, 356.45, 363.3, 349, 345.76, 343.75, 348.23, 371.19, 368.52, 374.25, 370.94, 374.35, 377.69, 379.74, 386.57, 379.57, 342.75, 330.43, 333.11, 341.76, 333.21, 320.39, 320.86, 322.67, 331.14, 334.04, 354.37, 365, 396.09, 377.32, 374.59, 354.79, 348.64, 360.23, 357.1, 365.56, 400.44, 392.73, 424.5, 433.01, 399.15, 408.1, 381.51, 401.94, 418.61, 393.64, 421.77, 402.68, 413.42, 402.85, 401.41, 404.07, 415.2, 448.68, 451.51],
  },
  {
    symbol: "CEG",
    ticker: "CEG",
    company: "Constellation Energy",
    layer: "infra",
    currency: "USD",
    value: 282.5,
    dailyChange: 1.39,
    weekChange: 4.67,
    monthChange: 12.21,
    ytdChange: -22.87,
    high52w: 403.95,
    low52w: 236.5,
    realizedVol: 33.77,
    sparkline: [105.72, 104.82, 106.92, 104.16, 108.54, 112.46, 109.94, 109.32, 107.88, 115.72, 114.29, 112.72, 114.85, 121.18, 121.99, 123.25, 121.04, 110.53, 115.6, 118.31, 117.11, 116.24, 112.91, 117.21, 121.01, 127.03, 128.51, 131.8, 133.22, 175.99, 167.91, 168.84, 187.26, 188.13, 188.1, 185.4, 183.22, 188.61, 197.7, 213.59, 215.07, 231.27, 203.14, 214.63, 212.02, 222.37, 206.15, 219.55, 186.67, 175.08, 189.8, 181.04, 189.41, 190.72, 196.14, 177.52, 187.25, 200.33, 262.86, 265.61, 279.39, 266.15, 266, 265, 233.75, 228.7, 230.28, 248.93, 247.51, 232.34, 234.24, 229.79, 242.6, 305.19, 315.24, 347.44, 299.98, 309.79, 317.3, 267.72, 232.29, 202.21, 216.46, 222.48, 205.39, 170.96, 208.25, 192.61, 224.82, 248.27, 271.37, 291.12, 297.49, 313.43, 299.66, 308.01, 320.66, 322.76, 312.84, 317.99, 317.79, 330.52, 343.57, 338.57, 317.23, 310.68, 307.19, 300.82, 322.91, 336.65, 329.07, 358.16, 389.56, 370, 391.15, 377.71, 360.93, 338.67, 354.11, 363.67, 359.15, 357.14, 357.81, 357.12, 338.63, 330.38, 287.35, 287.45, 250.46, 276.85, 291.66, 323.56, 332.07, 301.55, 316.47, 295.19, 279.46, 280.25, 299.14, 292.77, 313, 311.28, 275.26, 285.83, 286.31, 264.59, 246.71, 274.06, 264.02, 245.87, 257.57, 253.5, 274.35, 262.75, 269.89, 282.5],
  },
  {
    symbol: "GEV",
    ticker: "GEV",
    company: "GE Vernova",
    layer: "infra",
    currency: "USD",
    value: 1063.25,
    dailyChange: 1.32,
    weekChange: 7.36,
    monthChange: 2.61,
    ytdChange: 56.46,
    high52w: 1174.86,
    low52w: 547.96,
    realizedVol: 55.77,
    sparkline: [131.25, 137.34, 132.17, 131.75, 137.22, 146.18, 153.71, 169.14, 167.27, 166.4, 163.85, 178.09, 170.37, 162.08, 176.17, 177.18, 180, 167.52, 174.37, 180.45, 161.49, 162.9, 162.7, 162.24, 177.21, 184.16, 184, 182.13, 201, 198.33, 215.27, 237.15, 251.53, 249.86, 254.68, 266.6, 266.36, 276.43, 297, 297.6, 315.77, 349.44, 329.76, 339.85, 338.89, 331.92, 335.25, 332.01, 332.8, 343.07, 338.94, 368.52, 382.26, 416, 330, 372.88, 374.83, 369.65, 373.25, 315.91, 335.18, 293.21, 298.68, 318.93, 343.57, 303, 330.8, 286.89, 322.3, 313.08, 372.42, 370.82, 401.23, 416.63, 428.06, 458.82, 471.17, 488.13, 480, 478.45, 486.96, 506.81, 505.07, 535.77, 559.61, 574.6, 623.97, 655, 649.72, 650.76, 621.91, 604.59, 625.91, 579.68, 600.23, 625.55, 611, 628.97, 602.43, 594.99, 634.27, 615.95, 585.33, 584.39, 585.14, 559.7, 576.08, 577.02, 555.84, 599.77, 629.11, 723, 681.35, 658.28, 663.46, 679.55, 628.4, 644.18, 684.86, 665.99, 726.37, 737.53, 823.67, 817.55, 879.73, 873.6, 815.01, 847.65, 844.05, 882.64, 853.16, 898.57, 936.07, 987.5, 990.18, 1149.19, 1083.46, 1118.96, 1071.98, 1049.23, 1043.82, 996, 959.36, 920.15, 979.07, 1109.73, 1085.47, 1134.35, 1070.99, 1066.01, 1079.18, 1014.75, 900.28, 1018.53, 990.85, 1063.25],
  },
  {
    symbol: "EQIX",
    ticker: "EQIX",
    company: "Equinix",
    layer: "infra",
    currency: "USD",
    value: 1102.1,
    dailyChange: 2.64,
    weekChange: 5.7,
    monthChange: 9.21,
    ytdChange: 44.23,
    high52w: 1115.94,
    low52w: 726.09,
    realizedVol: 30.84,
    sparkline: [774.09, 753.84, 765.16, 781.38, 775.55, 782.17, 733.51, 720.97, 720.99, 743.33, 703.81, 719.51, 739.13, 759.94, 781, 794.35, 815.01, 810.11, 805.29, 801.6, 814.09, 788.39, 815.02, 802.27, 831.76, 836.41, 849.98, 854.74, 877.62, 913.66, 893.56, 860.65, 792.52, 792.67, 801.24, 744.11, 754.74, 726.34, 693.73, 776.89, 795.28, 768.71, 764.68, 762.53, 762.38, 742.86, 756.38, 775.96, 803.14, 794.15, 790.24, 784.61, 829.64, 829.84, 817.98, 827.59, 867.7, 860.95, 890.01, 883, 872.51, 878.03, 878.37, 905.91, 908.99, 903.02, 909.48, 974.35, 963.65, 961.72, 960.84, 950.01, 944.23, 899.83, 919.89, 940.85, 913.66, 933.27, 933.6, 909.01, 910.58, 830.63, 837.68, 834.59, 803, 766.21, 776.83, 773.2, 844.68, 883.21, 864.39, 875.92, 863.46, 890.49, 907.48, 888.15, 906.5, 795.47, 767.39, 759.96, 800.55, 811.13, 778.94, 787.32, 773.46, 782.38, 771.56, 779.54, 779.31, 803.28, 783.24, 787.08, 817.42, 825.14, 842.77, 832.84, 828.13, 776.88, 760.62, 727.38, 740.67, 761.39, 757.92, 769.71, 776.55, 799.02, 792.76, 826.05, 802.13, 867.52, 918.03, 948.02, 953, 971.47, 974.76, 963.39, 995.98, 1031.57, 1070.9, 1115.29, 1082.83, 1066.76, 1079.68, 1078.42, 1069.44, 1089.15, 1043.18, 1092.19, 1091.3, 998.84, 1039.53, 1017.31, 1084.24, 1019.28, 1042.62, 1102.1],
  },
  {
    symbol: "SMCI",
    ticker: "SMCI",
    company: "Super Micro",
    layer: "systems",
    currency: "USD",
    value: 39.84,
    dailyChange: 1.74,
    weekChange: 27.98,
    monthChange: 61.43,
    ytdChange: 28.68,
    high52w: 58.68,
    low52w: 20.53,
    realizedVol: 101.14,
    sparkline: [27.71, 24.41, 26.25, 27.51, 26.75, 27.08, 23.15, 26.94, 28.76, 29.32, 26.5, 23.95, 25.23, 26.03, 28.78, 28.67, 27.35, 25.61, 29.44, 30.42, 29.15, 29.21, 33.96, 43.62, 49.57, 66.33, 77.3, 78.76, 87.63, 107.43, 108.02, 100.07, 104.28, 100.99, 90.42, 88.28, 71.7, 89.04, 83.04, 78.28, 90.39, 87.47, 77.16, 78.69, 88.74, 84.31, 83.72, 90, 81.63, 71.16, 70.17, 61.69, 56.74, 61.09, 54.76, 42.35, 44.54, 43.69, 45.81, 40.55, 45.35, 47.76, 45.97, 49.12, 27.7, 21.7, 21.54, 38.41, 40.21, 40.54, 33.8, 34.33, 30.05, 32.6, 31.12, 33.27, 28.52, 36.28, 47.91, 51.61, 36.07, 36.9, 42.17, 42.15, 34.26, 29.82, 33.15, 29.51, 37.27, 32.17, 31.99, 46.15, 40.09, 41.2, 43.12, 43.69, 42.84, 49.01, 49.11, 53.17, 49.86, 58.63, 57.26, 46.43, 43.24, 44.07, 40.78, 42.92, 44.91, 46.99, 47.94, 55.07, 53.11, 55.04, 51.57, 50.75, 40.19, 34.1, 33.32, 32.92, 35.02, 31.37, 31.07, 29.65, 30.01, 28.27, 32.45, 30.12, 33.76, 32.04, 32.16, 32.28, 32.24, 30.9, 30.79, 22.21, 22.51, 23.22, 28.4, 26.75, 27.4, 33.62, 33.03, 33.46, 41.3, 46.9, 31.97, 30.66, 30.63, 27.19, 27.66, 23.83, 30.1, 28.4, 31.13, 39.84],
  },
  {
    symbol: "DELL",
    ticker: "DELL",
    company: "Dell Technologies",
    layer: "systems",
    currency: "USD",
    value: 490.81,
    dailyChange: -0.75,
    weekChange: 8.16,
    monthChange: 25.4,
    ytdChange: 284.05,
    high52w: 494.51,
    low52w: 111.07,
    realizedVol: 84.02,
    sparkline: [56, 54.86, 56.71, 56.24, 68.98, 71.16, 68.44, 68.5, 66.19, 69.05, 67.03, 64.51, 68.67, 72.48, 72.94, 74.68, 75.87, 68.59, 72.43, 75.32, 76.68, 75.84, 79.31, 81.14, 83.41, 85.71, 86.62, 82.46, 92.77, 121.78, 115.86, 106.63, 113, 118.44, 123.73, 117.81, 115.54, 127.7, 129.33, 131.01, 145.45, 166.08, 135.76, 132.45, 142.03, 140.35, 143.47, 145.77, 125.17, 116.12, 113.68, 94.67, 99.94, 110.71, 111.86, 109.06, 108.8, 115.99, 120.17, 113.16, 121.93, 125.83, 120.4, 121.63, 133.46, 136.47, 136.01, 144.16, 125.56, 116.79, 118.28, 118.94, 116.53, 114.77, 110.11, 113.73, 103.6, 106.37, 114.38, 114.14, 95.56, 90.34, 95.67, 97.57, 92.29, 71.63, 81.93, 82.39, 94.47, 94.36, 95.91, 114.19, 112.11, 108.08, 114.22, 113.74, 120.59, 122.6, 124.39, 125.69, 124.33, 133.51, 130.48, 141.64, 135.2, 131.01, 120.96, 121.29, 127.68, 134.34, 141.77, 150.87, 148.77, 147.87, 162.19, 160.11, 142.69, 122.48, 127.22, 135.95, 138.22, 130.51, 126.61, 127.92, 120.07, 118.69, 117.17, 118.49, 122.04, 124.16, 119.06, 121.45, 146.52, 149.91, 156.76, 175.82, 169.38, 181.46, 193.09, 212.14, 208.95, 230.27, 247.89, 252.8, 317.05, 422.05, 391.45, 409.5, 399.49, 411.8, 427.11, 381.88, 437.5, 405.37, 453.77, 490.81],
  },
  {
    symbol: "000660.KS",
    ticker: "000660",
    company: "SK hynix",
    layer: "systems",
    currency: "KRW",
    value: 1645000,
    dailyChange: 3.26,
    weekChange: 15.68,
    monthChange: -20.99,
    ytdChange: 142.98,
    high52w: 2919000,
    low52w: 245000,
    realizedVol: 139.99,
    sparkline: [113800, 114100, 116900, 124000, 119500, 118500, 114800, 120900, 121800, 118500, 122200, 116500, 114700, 119200, 130000, 127500, 120300, 127600, 134100, 131300, 131400, 125900, 131000, 138200, 140400, 137500, 134100, 141300, 137400, 132700, 142800, 151300, 161800, 165800, 165700, 164300, 169400, 185500, 181200, 179100, 171000, 174200, 175400, 193000, 200000, 195700, 207500, 221000, 234000, 236500, 236000, 241000, 212500, 190000, 193300, 163400, 199700, 185500, 173700, 159400, 168800, 163500, 169100, 186000, 187300, 201000, 186300, 195800, 173000, 168800, 161100, 173000, 176100, 175000, 170100, 199800, 194300, 212000, 199200, 203000, 210000, 209500, 199200, 192400, 204500, 215500, 199300, 182200, 180800, 175000, 178300, 186000, 198500, 202000, 202500, 217500, 235500, 246500, 286000, 279000, 281000, 296000, 269000, 263500, 258500, 269000, 255500, 260000, 262500, 304000, 333500, 356500, 395500, 422500, 481500, 558000, 579000, 617000, 562000, 524000, 552000, 566000, 530000, 584000, 677000, 744000, 756000, 767000, 861000, 842000, 888000, 1005000, 849000, 955000, 1056000, 995000, 807000, 916000, 1103000, 1224000, 1300000, 1654000, 1970000, 1940000, 2289000, 2070000, 2150000, 2764000, 2673000, 2425000, 2180000, 1764000, 1759000, 1718000, 1422000, 1645000],
  },
  {
    symbol: "005930.KS",
    ticker: "005930",
    company: "Samsung Electronics",
    layer: "systems",
    currency: "KRW",
    value: 274500,
    dailyChange: 2.43,
    weekChange: 18.83,
    monthChange: -1.79,
    ytdChange: 113.62,
    high52w: 362500,
    low52w: 67600,
    realizedVol: 117.24,
    sparkline: [71600, 71900, 71000, 71700, 69900, 68900, 66700, 68200, 66900, 70400, 71700, 68900, 68400, 68200, 70500, 68000, 68600, 69900, 72200, 72800, 72700, 71200, 73500, 73400, 78000, 76600, 73100, 74700, 74100, 73600, 74100, 73800, 72800, 73700, 73300, 72800, 78200, 82000, 84500, 80000, 75500, 77500, 79700, 78200, 78300, 73500, 77300, 79600, 80000, 81500, 87100, 87600, 86900, 80400, 83100, 73400, 80200, 77700, 74300, 69000, 66300, 63200, 61300, 59300, 59200, 55900, 59200, 57300, 49900, 56400, 55500, 53700, 55900, 53100, 53600, 55900, 54100, 53400, 52400, 53700, 56000, 58200, 56300, 53700, 54700, 61700, 60200, 56100, 55200, 55300, 55700, 54300, 56900, 55900, 53900, 57800, 59500, 59800, 61300, 60800, 60400, 64700, 66400, 72600, 68800, 71100, 70500, 70600, 69800, 72600, 78200, 86100, 89750, 95000, 98600, 100500, 100600, 103100, 96500, 102800, 104500, 108400, 102800, 111500, 128500, 139000, 148900, 152100, 160700, 159300, 178600, 200000, 172200, 190000, 208500, 189000, 167200, 196500, 206500, 219000, 222000, 271500, 296000, 299500, 299500, 329000, 322500, 354000, 339500, 309500, 285000, 244000, 249500, 262500, 231000, 274500],
  },
];

/** Latest close date across the AI universe, ISO yyyy-mm-dd. */
export const AI_STOCKS_ASOF = "2026-08-14";
/* AI_STOCKS:END */
