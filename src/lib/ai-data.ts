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
export const AI_DATA_ASOF = "Aug 17, 2026";

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
    /* A reported quarter beats an annualised run rate, so this leads with Q2
       revenue and keeps the run rate as context. Flagged preliminary because
       Bloomberg says the figures could still be revised. */
    id: "anthropic",
    label: "Anthropic",
    value: "$11.5B",
    detail:
      "Q2 2026 revenue, up from $787M a year earlier · preliminary · run rate crossed $47B in May · private company",
    source: "Bloomberg via Yahoo Finance",
    sourceUrl:
      "https://finance.yahoo.com/technology/ai/articles/anthropic-revenue-surges-over-11-210857853.html",
    asOf: "2026-08-14",
  },
  /* REMOVED: "Microsoft AI business, $37B annual run rate" (FY26 Q2, Jan 2026).
     Microsoft RETIRED the metric. Confirmed against the primary source — the
     FY26 Q4 release of 2026-07-29 (quarter ended 2026-06-30) quantifies Azure,
     Microsoft Cloud, M365 and Copilot seats, and discloses no standalone AI
     revenue figure anywhere:
     https://news.microsoft.com/source/2026/07/29/microsoft-cloud-and-ai-strength-fuels-fourth-quarter-results-4/
     So the number was 200 days old with no successor to refresh it to.

     Do NOT substitute Azure here. That release reports "Azure revenue surpassed
     $100 billion for the first time" — a FULL-YEAR FY2026 figure for the whole
     cloud business, not an AI run rate and not annualised. Putting it in an
     AI-revenue card would overstate AI revenue by a wide margin, the exact
     category error this page exists to avoid.

     The one AI-specific number that release does give is 30M+ paid M365 Copilot
     seats — a usage figure, not revenue, so it sits in AI_ADOPTION instead.
     If Microsoft resumes disclosing an AI revenue figure, add it back here. */
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
    /* Previously "~$25B" cited to a Forbes CONTRIBUTOR post that does not
       contain the figure at all — it says OpenAI exited 2025 near $20B and gives
       no current run rate. Replaced with Bloomberg's staff reporting, which also
       shows the old number was badly stale. */
    id: "openai",
    label: "OpenAI",
    value: ">$40B",
    detail:
      "Annualized run rate, roughly double its end-2025 pace · private company",
    source: "Bloomberg via Yahoo Finance",
    sourceUrl:
      "https://finance.yahoo.com/technology/ai/articles/openai-revenue-run-rate-tops-213604019.html",
    asOf: "2026-08-13",
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
    /* STALEST ROW ON THE PAGE, and it feeds the computed aggregate below.
       Checked 2026-08-17: Microsoft's FY26 Q4 press release (2026-07-29) gives
       NO capex figure — not for the quarter, not for FY27 — so it cannot
       refresh this. Don't re-check that source hoping otherwise.

       Public secondary reporting disagrees on the basis: ~$190B for calendar
       2026, ~$175B after an accounting change that lengthens depreciation
       lives, and $255–260B for FY2027. Those are three different periods, so
       picking one at random would be worse than the February figure that at
       least renders with an honest asOf. Resolve it against the 10-K or the
       earnings call transcript, then set `raised` accordingly. */
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

/* The aggregate is COMPUTED from the four per-company plans above, not curated.
   Two reasons. First, third-party totals disagree — $630B, $690B and $725B were
   all in circulation in August 2026 — because they mix January guidance with
   mid-year raises, and arbitrating between them means picking a number. Second,
   a hand-typed total drifts from the bars it claims to sum: the old "~$725B"
   was cited to a February report, before three of the four raised, while the
   chart beside it already showed $710–760B. Summing the sourced parts is both
   self-consistent and independently checkable — every component links to the
   company's own report in the capex chart. */
const capexLow = AI_CAPEX.reduce((sum, p) => sum + p.low, 0);
const capexHigh = AI_CAPEX.reduce((sum, p) => sum + p.high, 0);
const capexPrior = AI_CAPEX.reduce((sum, p) => sum + p.priorYear, 0);
const capexGrowth = Math.round((capexLow / capexPrior - 1) * 100);

export const AI_CAPEX_CONTEXT: AIFigure[] = [
  {
    id: "capex-total",
    label: "Combined 2026 capex plans",
    value: `$${capexLow}–${capexHigh}B`,
    detail: `Four hyperscalers, summed from each company's own guidance · up ~${capexGrowth}% on 2025's $${Math.round(capexPrior)}B · sell-side sees >$1T in 2027`,
    source: "Company reports · see the capex chart",
    sourceUrl: "https://www.cnbc.com/2026/07/28/hyperscalers-face-higher-capex-scrutiny-after-alphabet-report-panned.html",
    asOf: "2026-07-30",
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
    /* Converted so it reads against the dollar figures beside it. The reported
       figure and the rate used are both kept in `detail` — a converted number
       without its rate can't be checked, and the source link lands on a page
       quoting won. Rate is the USD/KRW print on the release date, not today's,
       so the figure doesn't drift as the won moves. */
    id: "skhynix",
    label: "SK hynix Q2 2026",
    value: "$54.6B",
    detail:
      "Revenue, with $41.7B operating profit — a 76% operating margin · reported ₩79.3T at ₩1,453/$ · HBM4 mass shipments began",
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
    value: "$49–51B",
    detail:
      "Full-year revenue guidance, raised · Q2 net sales $10.6B · reported €43–45B at $1.14/€ · sole EUV supplier",
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
    /* Microsoft's only AI-specific usage disclosure. A paid-seat count beats a
       survey response as an adoption signal — someone is being billed for it —
       but it counts SEATS, not people using them, so it is labelled that way.
       Note what sits beside it in the same release: Copilot seats and Azure
       revenue are both quantified while AI revenue is not disclosed at all. */
    id: "m365-copilot-seats",
    label: "Microsoft 365 Copilot paid seats",
    value: "30M+",
    detail:
      "Quarter ended Jun 30, 2026 · seats licensed, not necessarily active users · Microsoft's only AI-specific usage figure",
    source: "Microsoft FY26 Q4 results",
    sourceUrl:
      "https://news.microsoft.com/source/2026/07/29/microsoft-cloud-and-ai-strength-fuels-fourth-quarter-results-4/",
    asOf: "2026-07-29",
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
  /* REMOVED: "Magnificent 7 share of S&P 500, ~32%". No source met this page's
     bar. The four candidates disagreed — 31.5%, 31.7%, 32.24% and "about 34%" —
     because they mix float-adjusted index weight with raw market-cap share, and
     the one actually cited was Forbes CONTRIBUTOR content that said 34% while
     the tile claimed 32%. Concentration is a real and relevant point, but it
     needs an index provider that publishes the weight, not a round number
     picked from the middle of a disagreement. */
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
    listingCurrency: "USD",
    value: 480.35,
    dailyChange: -3.04,
    weekChange: -5.08,
    monthChange: 21.97,
    ytdChange: 1.57,
    high52w: 542.07,
    low52w: 352.83,
    realizedVol: 50.19,
    sparkline: [301.14, 295.71, 299.87, 299.35, 289.1, 294.85, 304.21, 309.16, 331.62, 336.06, 336.72, 343.11, 329.68, 323.01, 342.54, 323.8, 334.69, 336.32, 314.04, 310.2, 296.03, 308.26, 305.94, 295.04, 287.93, 297.31, 289.86, 280.07, 300.43, 303.68, 309.42, 296.97, 279.83, 274.03, 277.52, 274.73, 261.12, 252.56, 273.24, 270.02, 252.99, 247.65, 267.7, 259.58, 267.66, 256.72, 260.36, 280.74, 282.91, 291.91, 286.15, 268.09, 256.06, 264.46, 244.74, 237.92, 232.9, 234.24, 228.56, 242.12, 235.87, 221.39, 247.11, 241.22, 247.49, 255.02, 245.42, 244.69, 238.73, 239.82, 224.93, 239.23, 240.22, 248.16, 258.35, 263.1, 258.06, 249.22, 255.29, 248.59, 279.43, 280.57, 288.3, 291.6, 286.14, 285.76, 307.26, 310.65, 308.97, 318.34, 332.89, 335.4, 326.79, 342.33, 335.02, 340.54, 337.22, 345.24, 343.77, 338.37, 327.78, 321.01, 316.48, 322.98, 328.66, 334.27, 330.22, 317.01, 315.75, 327.26, 327.73, 326.67, 329.81, 352.8, 369.67, 369.85, 377.43, 374.51, 374.23, 370.73, 374.58, 376.04, 367.75, 388.47, 398.67, 403.93, 411.22, 420.55, 404.06, 410.34, 415.5, 406.22, 416.42, 428.74, 420.72, 425.52, 421.9, 399.12, 406.32, 406.66, 414.74, 420.21, 430.16, 415.13, 423.85, 442.57, 449.78, 446.95, 467.56, 453.55, 437.11, 425.27, 408.49, 406.02, 418.47, 416.79, 417.14, 401.7, 430.59, 435.27, 428.02, 416.06, 416.32, 418.16, 428.15, 410.37, 422.54, 415, 417, 423.46, 443.57, 447.27, 436.6, 430.53, 423.35, 418.95, 429.03, 444.06, 415.06, 409.75, 408.43, 408.21, 396.99, 393.31, 388.56, 391.26, 378.8, 359.84, 388.45, 367.78, 391.85, 435.28, 438.73, 454.27, 450.18, 460.36, 470.38, 474.96, 477.4, 495.94, 498.84, 503.32, 510.05, 513.71, 524.11, 522.04, 520.17, 507.23, 506.69, 495, 509.9, 517.93, 511.46, 517.35, 510.96, 513.58, 523.61, 517.81, 496.82, 510.18, 472.12, 492.01, 483.16, 478.53, 485.92, 487.71, 472.94, 479.28, 459.86, 465.95, 430.29, 401.14, 401.32, 397.23, 392.74, 408.96, 395.55, 381.87, 356.77, 373.46, 370.87, 422.79, 424.62, 414.44, 415.12, 421.92, 418.57, 450.24, 416.67, 390.74, 379.4, 372.97, 390.49, 385.1, 393.82, 381.7, 464.72, 499.99, 495.4, 480.35],
  },
  {
    symbol: "GOOGL",
    ticker: "GOOGL",
    company: "Alphabet",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 344,
    dailyChange: -0.55,
    weekChange: -3.78,
    monthChange: -0.8,
    ytdChange: 9.15,
    high52w: 402.62,
    low52w: 199.32,
    realizedVol: 43.49,
    sparkline: [143.74, 140.88, 140.8, 142.21, 136.54, 139.79, 141.37, 137.57, 148.05, 148.85, 148.68, 148.93, 142.18, 142, 148, 141.73, 146.92, 144.85, 137.02, 139.48, 130.35, 133.35, 143.29, 134.28, 130.4, 134.46, 131.91, 129.87, 136.13, 141.67, 140.15, 133.29, 126.73, 119.64, 114.11, 115.75, 116.05, 108.91, 112.32, 114.54, 111.16, 107.14, 117.97, 108.74, 119.35, 111.78, 107.9, 116.32, 117.47, 121.68, 117.21, 110.34, 107.85, 110.65, 102.8, 98.74, 95.65, 98.68, 96.56, 101.13, 96.29, 86.58, 96.41, 97.43, 97.46, 100.44, 92.83, 90.26, 89.23, 88.23, 87.34, 92.12, 98.02, 99.37, 104.78, 94.57, 94.35, 89.13, 93.65, 90.63, 101.62, 105.44, 103.73, 108.42, 108.87, 105.41, 107.34, 105.57, 117.51, 122.76, 124.61, 124.67, 122.23, 123.53, 122.34, 119.7, 119.48, 125.42, 120.02, 132.58, 128.11, 129.56, 127.46, 129.88, 135.66, 136.38, 137.4, 130.25, 130.86, 137.58, 137.36, 135.6, 122.17, 129.1, 132.59, 135.31, 136.69, 131.86, 134.99, 132.6, 141.49, 139.69, 135.73, 142.65, 146.38, 152.19, 142.38, 149, 140.52, 143.96, 137.14, 135.41, 141.18, 150.77, 150.93, 152.5, 157.73, 154.09, 171.95, 167.24, 168.65, 176.06, 174.99, 172.5, 174.46, 176.79, 179.63, 182.15, 190.6, 185.07, 177.66, 167, 166.66, 163.67, 162.96, 165.62, 163.38, 150.92, 157.46, 163.59, 163.95, 167.06, 163.24, 163.42, 165.27, 171.29, 178.35, 172.49, 164.76, 168.95, 174.71, 189.82, 191.41, 192.76, 191.79, 192.04, 196, 200.21, 204.02, 185.34, 185.23, 179.66, 170.28, 173.86, 165.49, 163.99, 154.33, 145.6, 157.14, 151.16, 161.96, 164.03, 152.75, 166.19, 168.47, 171.74, 173.68, 174.67, 166.64, 178.53, 179.53, 180.19, 185.06, 193.18, 189.13, 201.42, 203.9, 206.09, 212.91, 235, 240.8, 254.72, 246.54, 245.35, 236.57, 253.3, 259.92, 281.19, 278.83, 276.41, 299.66, 320.18, 321.27, 309.29, 307.16, 313.51, 315.15, 328.57, 330, 327.93, 338, 322.86, 305.72, 314.98, 311.76, 298.52, 302.28, 301, 274.34, 295.77, 317.24, 341.68, 344.4, 385.69, 400.8, 396.78, 382.97, 380.34, 368.53, 359.68, 368.03, 337.39, 359.91, 357.18, 346.77, 319.74, 356.13, 354.3, 345.9, 344],
  },
  {
    symbol: "AMZN",
    ticker: "AMZN",
    company: "Amazon",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 261.31,
    dailyChange: -0.51,
    weekChange: -6.03,
    monthChange: 5.7,
    ytdChange: 15.37,
    high52w: 284.02,
    low52w: 198.79,
    realizedVol: 51.47,
    sparkline: [173.9, 173.46, 173.13, 171.28, 164.16, 164.43, 170.45, 166.78, 168.62, 175.95, 176.26, 183.83, 175.23, 169.49, 172.21, 170.02, 171.07, 166.72, 162.55, 162.14, 142.64, 143.98, 157.64, 153.29, 152.6, 153.79, 145.64, 145.52, 161.25, 164.77, 163.56, 154.46, 151.71, 144.35, 124.28, 114.77, 113.06, 107.59, 115.15, 122.35, 109.65, 106.22, 116.46, 109.56, 115.54, 113.55, 122.42, 134.95, 140.8, 143.55, 138.23, 130.75, 127.51, 133.27, 123.53, 113.78, 113, 114.56, 106.9, 119.32, 103.41, 90.98, 100.79, 94.14, 93.41, 94.13, 89.09, 87.86, 85.25, 84, 86.08, 98.12, 97.25, 102.24, 103.39, 97.61, 97.2, 93.5, 94.9, 90.73, 98.95, 98.13, 103.29, 102.06, 102.51, 106.96, 105.45, 105.66, 110.26, 116.25, 120.11, 124.25, 123.43, 125.49, 129.33, 130.36, 129.78, 134.68, 130, 132.21, 139.57, 138.41, 133.22, 133.26, 138.12, 138.23, 140.39, 129.12, 127.12, 127.96, 129.79, 125.17, 127.74, 138.6, 143.56, 145.18, 146.74, 147.03, 147.42, 149.97, 153.42, 151.94, 145.24, 154.62, 155.34, 159.12, 171.81, 174.45, 169.51, 174.99, 178.22, 175.35, 174.42, 178.87, 180.38, 185.07, 186.13, 174.63, 179.62, 186.21, 187.48, 184.7, 180.75, 176.44, 184.3, 183.66, 189.08, 193.25, 200, 194.49, 183.13, 182.5, 167.9, 166.94, 177.06, 177.04, 178.5, 171.39, 186.49, 191.6, 187.97, 186.51, 188.82, 188.99, 187.83, 197.93, 208.18, 202.61, 197.12, 207.89, 227.03, 227.46, 224.92, 223.75, 224.19, 218.94, 225.94, 234.85, 237.68, 229.15, 228.68, 216.58, 212.28, 199.25, 197.95, 196.21, 192.72, 171, 184.87, 172.61, 188.99, 189.98, 193.06, 205.59, 200.99, 205.01, 213.57, 212.1, 209.69, 223.3, 223.41, 225.02, 226.13, 231.44, 214.75, 222.69, 231.03, 228.84, 229, 232.33, 228.15, 231.48, 219.78, 219.51, 216.37, 213.04, 224.21, 244.22, 244.41, 234.69, 220.69, 233.22, 229.53, 226.19, 227.35, 232.52, 226.5, 247.38, 239.12, 239.16, 239.3, 210.32, 198.79, 210.11, 210, 213.21, 207.67, 205.37, 199.34, 209.77, 238.38, 250.56, 263.99, 268.26, 272.68, 264.14, 266.32, 270.64, 246.03, 238.55, 244.39, 232.69, 242.67, 245.34, 247.23, 232.11, 271.58, 274.48, 262.65, 261.31],
  },
  {
    symbol: "META",
    ticker: "META",
    company: "Meta Platforms",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 568.97,
    dailyChange: -3.54,
    weekChange: -4.36,
    monthChange: -11.93,
    ytdChange: -12.52,
    high52w: 785.23,
    low52w: 525.72,
    realizedVol: 47.8,
    sparkline: [376.26, 378.69, 364.72, 352.96, 343.01, 330.05, 324.76, 324.61, 323.57, 341.13, 340.89, 345.3, 333.12, 306.84, 329.75, 333.79, 335.24, 336.35, 331.79, 331.9, 303.17, 301.71, 237.09, 219.55, 206.16, 210.48, 200.06, 187.61, 216.49, 221.82, 224.85, 222.33, 210.18, 184.11, 200.47, 203.77, 198.62, 193.54, 195.13, 190.78, 175.57, 163.74, 170.16, 160.03, 170.88, 164.7, 169.27, 159.1, 167.11, 180.5, 167.96, 161.78, 160.32, 169.15, 146.29, 140.41, 135.68, 133.45, 126.76, 130.01, 99.2, 90.79, 113.02, 112.05, 111.41, 123.49, 115.9, 119.43, 118.04, 120.34, 130.02, 136.98, 139.37, 151.74, 186.53, 174.15, 172.88, 170.39, 185.25, 179.51, 195.61, 206.01, 211.94, 216.1, 221.49, 212.89, 240.32, 232.78, 233.81, 245.64, 262.04, 272.61, 264.95, 281, 288.73, 286.98, 290.53, 308.87, 294.26, 325.48, 310.73, 301.64, 283.25, 285.5, 296.38, 297.89, 300.31, 299.08, 300.21, 315.43, 314.69, 308.65, 296.73, 314.6, 328.77, 335.04, 338.23, 324.82, 332.75, 334.92, 353.39, 353.96, 351.95, 374.49, 383.45, 394.14, 474.99, 468.11, 473.32, 484.03, 502.3, 505.95, 484.1, 509.58, 485.58, 527.34, 511.9, 481.07, 443.29, 451.96, 476.2, 471.91, 478.22, 466.83, 492.96, 504.16, 494.78, 504.22, 539.91, 498.87, 476.79, 465.7, 488.14, 517.77, 527.42, 528, 521.31, 500.27, 524.62, 561.35, 567.36, 595.94, 589.95, 576.47, 573.25, 567.16, 589.34, 554.08, 559.14, 574.32, 623.77, 620.35, 585.25, 599.81, 604.63, 615.86, 612.77, 647.49, 689.18, 714.52, 736.67, 683.55, 668.2, 625.66, 607.6, 596.25, 576.74, 504.73, 543.57, 501.48, 547.27, 597.02, 592.49, 640.34, 627.06, 647.49, 697.71, 682.87, 682.35, 733.63, 719.01, 717.51, 704.28, 712.68, 750.01, 769.3, 785.23, 754.79, 738.7, 752.45, 755.59, 778.38, 743.75, 710.56, 705.3, 716.92, 738.36, 648.35, 621.71, 609.46, 594.25, 647.95, 673.42, 644.23, 658.77, 663.29, 650.41, 653.06, 620.25, 658.76, 716.5, 661.46, 639.77, 655.66, 648.18, 644.86, 613.71, 593.66, 525.72, 574.46, 629.86, 688.55, 675.03, 608.75, 609.63, 614.23, 610.26, 632.51, 593, 566.98, 577.22, 550.25, 582.9, 669.21, 646.01, 595.19, 556.71, 592.1, 589.85, 568.97],
  },
  {
    symbol: "PLTR",
    ticker: "PLTR",
    company: "Palantir",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 172.55,
    dailyChange: -0.86,
    weekChange: -1.53,
    monthChange: 30.34,
    ytdChange: 2.79,
    high52w: 207.18,
    low52w: 107.27,
    realizedVol: 91.09,
    sparkline: [26.64, 26.28, 28.71, 28.56, 24.33, 23.5, 24, 24.43, 25.88, 26, 22.83, 21.41, 21.03, 18.98, 18.94, 19.06, 18.93, 18.21, 16.56, 16.01, 13.53, 12.71, 12.94, 13.13, 11.02, 11.47, 10.96, 11.39, 12.82, 12.97, 13.83, 12.7, 12.42, 11.96, 10.4, 9.48, 8.34, 8.08, 8.85, 8.94, 8.26, 8.24, 10.19, 9.27, 10.17, 9.04, 9.84, 10.35, 11.45, 9.91, 8.51, 7.94, 7.4, 7.79, 7.78, 7.4, 8.13, 8.15, 7.53, 8.29, 8.64, 7.93, 8.41, 7.39, 7.28, 7.66, 7.11, 6.9, 6.29, 6.42, 6.4, 6.96, 7.02, 7.55, 8.41, 7.51, 9.2, 8.09, 8.33, 7.35, 7.88, 8.2, 8.45, 8.09, 8.81, 8.18, 7.75, 7.41, 9.5, 11.71, 13.65, 14.52, 15.02, 16.3, 14.03, 15.33, 15.34, 16.4, 16.43, 17.81, 18.2, 15.41, 14.4, 14.53, 15.18, 15.13, 15.33, 14.13, 16, 16.61, 17.36, 16.11, 15.07, 18.89, 19.67, 20.49, 19.2, 20.27, 17.77, 18.2, 17.41, 17.17, 15.98, 16.76, 16.78, 16.35, 17.02, 24.38, 24.44, 22.97, 24.93, 26.04, 23.49, 24.18, 23.01, 22.96, 22.67, 20.47, 22.52, 23.33, 20.6, 21.76, 21.01, 21.68, 23.31, 23.57, 23.84, 25.33, 27.23, 28.07, 28.58, 27.18, 24.74, 30.01, 32.08, 31.78, 31.48, 30.33, 35.59, 37.2, 36.84, 40.01, 43.51, 42.97, 44.86, 41.92, 58.39, 65.77, 64.35, 67.08, 76.34, 76.07, 80.55, 79.08, 79.89, 67.26, 71.77, 78.98, 82.49, 110.85, 119.16, 101.35, 84.92, 84.91, 86.24, 90.96, 85.85, 74.01, 88.55, 93.78, 112.78, 124.28, 117.3, 129.52, 123.31, 131.78, 127.72, 137.4, 137.3, 130.74, 134.36, 142.1, 153.52, 158.8, 154.27, 186.96, 177.17, 158.74, 156.71, 153.11, 171.43, 182.39, 177.57, 173.07, 175.44, 178.15, 184.63, 200.47, 177.93, 174.01, 154.85, 168.45, 181.76, 183.57, 193.38, 188.71, 167.86, 177.49, 170.96, 169.6, 146.59, 135.9, 131.41, 135.24, 137.19, 157.16, 150.95, 150.68, 143.06, 148.46, 128.06, 146.39, 143.09, 144.07, 137.8, 133.99, 136.88, 156.54, 135.53, 127.99, 128.47, 112.93, 129.3, 126.79, 132.38, 122.92, 123.06, 172.01, 174.04, 172.55],
  },
  {
    symbol: "NOW",
    ticker: "NOW",
    company: "ServiceNow",
    layer: "platform",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 117.7,
    dailyChange: -5.08,
    weekChange: -7.64,
    monthChange: 14.01,
    ytdChange: -20.18,
    high52w: 192.23,
    low52w: 83,
    realizedVol: 58.62,
    sparkline: [135.73, 129.6, 130.21, 133.26, 126.56, 123.52, 132.64, 137.33, 139.55, 138.4, 138.28, 135.19, 129.91, 122.62, 129.4, 123.13, 129.71, 129.82, 113.28, 106.2, 101.55, 112.22, 115.5, 116.74, 111.2, 116.05, 109.41, 102.43, 115.98, 112.37, 109.74, 103.12, 101.47, 94.28, 95.62, 91.35, 90.53, 86.61, 95.26, 98.5, 94.63, 88.76, 100.82, 96.87, 98.83, 87.12, 89.35, 89.33, 98.97, 101.3, 95.25, 88.94, 86.9, 94.01, 85.16, 75.41, 75.52, 80.24, 68.35, 72.13, 84.08, 72.35, 81.98, 79.88, 81.44, 82.57, 78.72, 78.87, 76.37, 77.65, 73.31, 82.98, 88.37, 91.77, 94.44, 91.67, 87.8, 85.12, 88.8, 83.02, 88.2, 86.58, 92.94, 94.63, 92.61, 94.66, 91.88, 86.96, 91.04, 102.06, 107.49, 109.64, 106.81, 113.1, 108.6, 112.39, 110.6, 116.08, 116.4, 113.91, 110.33, 111.49, 108.3, 112.73, 118.18, 120.01, 115.92, 110.82, 111.79, 112.14, 109.93, 108.5, 110.8, 121.35, 126.95, 130.87, 134.78, 138.16, 139.82, 139.65, 139.51, 141.3, 135.23, 145.84, 149.82, 153.89, 156.26, 162.59, 153, 154.19, 154.73, 151.54, 148.78, 154.83, 152.48, 156.7, 153.74, 142.78, 144.71, 143.33, 145.96, 153.01, 147.7, 131.39, 139.76, 145.72, 149.87, 157.33, 161.29, 151.7, 150.24, 165.52, 158.13, 162.22, 165.51, 165.65, 171, 165.01, 175.79, 187.47, 176.36, 183.54, 187.72, 184.35, 190.17, 188.68, 201.62, 202.28, 212.12, 209.89, 224.87, 224.22, 218.25, 216.29, 214.75, 204.91, 214.3, 225, 203.68, 201.66, 197.33, 187.68, 185.95, 170.13, 168.87, 165.55, 159.55, 144.33, 157.13, 154.43, 189.05, 195.47, 196.01, 208.04, 200.87, 202.22, 206.04, 197.73, 194.28, 204.48, 208.94, 187.76, 192.68, 193.76, 182.87, 174.5, 173.45, 177.35, 183.49, 182.76, 185.79, 192.23, 187.2, 182.47, 177.74, 180.72, 186.03, 183.86, 172.37, 170.09, 162.69, 162.48, 170.87, 173.01, 155.31, 153.89, 147.45, 141.8, 127.31, 133.11, 117.01, 100.74, 107.08, 104.27, 108.01, 124.34, 113.62, 110.38, 99.41, 102, 83, 96.66, 90.17, 91.16, 91.18, 95.07, 102.13, 124.37, 112.45, 102.15, 95.04, 98.34, 106.32, 107.71, 103.24, 98.78, 111.23, 124.88, 124, 117.7],
  },
  {
    symbol: "BABA",
    ticker: "BABA",
    company: "Alibaba (ADR)",
    layer: "platform",
    country: "China",
    flag: "🇨🇳",
    listingCurrency: "USD",
    value: 124.68,
    dailyChange: 0.7,
    weekChange: -5.77,
    monthChange: 8.45,
    ytdChange: -19.94,
    high52w: 189.34,
    low52w: 94.81,
    realizedVol: 45.97,
    sparkline: [170.3, 168.1, 160.05, 145.08, 144.2, 161.52, 168, 177.7, 164.94, 158.73, 166.81, 140.34, 133.35, 111.96, 125.06, 122.1, 118.66, 118.79, 129.81, 131.57, 123.23, 115.23, 122.22, 122.25, 118.99, 107.94, 100.6, 86.71, 108.3, 112.99, 110.2, 103.53, 95.49, 86.49, 97.09, 90.05, 87.99, 86.79, 93.41, 93.21, 109.84, 102.24, 117.62, 116, 120.9, 102.44, 100.61, 89.37, 92.56, 94.77, 89.63, 98, 91.8, 92.14, 86.43, 78.8, 79.99, 81.24, 73.02, 72.18, 63.74, 69.81, 70.77, 80.48, 75.5, 90.06, 91.34, 86.79, 85.65, 88.09, 107.4, 117.01, 119.86, 118.38, 106.33, 103.65, 100.01, 89, 89.7, 82.96, 81.67, 86.9, 102.18, 102.74, 94.55, 89.13, 84.69, 83.22, 85.34, 83.98, 80.97, 84.27, 85.5, 92.1, 84.92, 83.35, 90.55, 94.56, 92.17, 100.55, 96.9, 95.72, 88.03, 89.82, 95.01, 90.05, 87.07, 88.3, 86.74, 86.06, 84.02, 79.94, 82.82, 85.31, 82.75, 77.6, 78.49, 73.99, 72.14, 74.51, 75.28, 77.51, 73.01, 71.84, 69.42, 74.01, 71.85, 72.02, 73.91, 75.96, 74.62, 73.55, 73.42, 72.13, 72.36, 71.66, 71.29, 69.07, 75.55, 81.33, 80.04, 88.54, 81.26, 78.34, 78.41, 73.35, 73.67, 72, 74.52, 79.65, 75.27, 76.53, 77.45, 79.99, 83.18, 85.41, 83.34, 81.18, 84.69, 88.29, 107.33, 114.53, 110.14, 102.43, 97.42, 97.58, 94.19, 88.59, 83.13, 87.37, 85.93, 87.82, 82.28, 85.06, 85.54, 80.53, 85.12, 89.14, 98.84, 103.51, 124.73, 143.75, 132.51, 140.62, 141.1, 135.14, 132.43, 116.54, 107.73, 108.87, 120.28, 125.76, 125.33, 123.46, 120.73, 113.84, 119.38, 112.87, 113.01, 114.08, 108.7, 106.72, 120.23, 120.03, 117.07, 120.36, 121.26, 122.94, 135, 135.58, 155.06, 162.81, 171.91, 188.03, 159.01, 167.05, 174.7, 170.43, 166.34, 153.8, 152.93, 157.3, 158.32, 155.68, 149.79, 152.24, 155.74, 150.96, 165.4, 173.23, 169.56, 162.51, 155.73, 154.45, 144.11, 130.79, 135.21, 122.41, 122.69, 122.05, 127.33, 141.01, 135.82, 131.5, 140.06, 132.59, 130, 124.22, 121.06, 112.82, 107.1, 94.81, 96.14, 112.33, 114.97, 112.14, 122.25, 128.41, 123.81, 124.68],
  },
  {
    symbol: "NVDA",
    ticker: "NVDA",
    company: "NVIDIA",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 225.01,
    dailyChange: -0.07,
    weekChange: 3.43,
    monthChange: 10.95,
    ytdChange: 19.15,
    high52w: 235.74,
    low52w: 165.17,
    realizedVol: 39.37,
    sparkline: [22.84, 22.48, 21.9, 22.08, 20.74, 20.83, 21.86, 22.73, 25.57, 29.75, 30.39, 32.99, 31.5, 30.69, 30.2, 27.8, 29.64, 29.41, 27.25, 26.94, 23.37, 22.84, 24.32, 23.95, 23.64, 24.16, 22.94, 22.1, 26.45, 27.69, 26.71, 23.12, 21.26, 19.51, 18.55, 18.67, 17.71, 16.69, 18.81, 18.72, 16.97, 15.88, 17.13, 14.52, 15.84, 15.76, 17.32, 18.16, 18.99, 18.71, 17.85, 16.26, 13.65, 14.39, 13.2, 12.52, 12.14, 12.08, 11.23, 12.47, 13.83, 14.16, 16.33, 15.41, 16.27, 16.88, 17, 16.57, 15.21, 14.61, 14.86, 16.9, 17.84, 20.36, 21.1, 21.26, 21.39, 23.29, 23.89, 22.97, 25.73, 26.78, 27.78, 27.04, 26.76, 27.12, 27.75, 28.68, 28.34, 31.26, 38.95, 39.33, 38.77, 42.69, 42.21, 42.3, 42.5, 45.47, 44.31, 46.75, 44.68, 40.85, 43.3, 46.02, 48.51, 45.57, 43.9, 41.61, 43.5, 45.76, 45.46, 41.39, 40.5, 45.01, 48.33, 49.3, 47.78, 46.76, 47.51, 48.89, 48.83, 49.52, 49.1, 54.71, 59.49, 61.03, 66.16, 72.13, 72.61, 78.82, 82.28, 87.53, 87.84, 94.29, 90.36, 88.01, 88.19, 76.2, 87.74, 88.79, 89.88, 92.48, 106.47, 109.63, 120.89, 131.88, 126.57, 123.54, 125.83, 129.24, 117.93, 113.06, 107.27, 104.75, 124.58, 129.37, 119.37, 102.83, 119.1, 116, 121.4, 124.92, 134.8, 138, 141.54, 135.4, 147.63, 141.98, 141.95, 138.25, 142.44, 134.25, 134.7, 137.01, 144.47, 135.91, 137.71, 142.62, 120.07, 129.84, 138.85, 134.43, 124.92, 112.69, 121.67, 117.7, 109.67, 94.31, 110.93, 101.49, 111.01, 114.5, 116.65, 135.4, 131.29, 135.13, 141.72, 141.97, 143.85, 157.75, 159.34, 164.92, 172.41, 173.5, 173.72, 182.7, 180.45, 177.99, 174.18, 167.02, 177.82, 176.67, 178.19, 187.62, 183.16, 183.22, 186.26, 202.49, 188.15, 190.17, 178.88, 177, 182.41, 175.02, 180.99, 190.53, 188.85, 184.86, 186.23, 187.67, 191.13, 185.41, 182.81, 189.82, 177.19, 177.82, 180.25, 172.7, 167.52, 177.39, 188.63, 201.68, 208.27, 198.45, 215.2, 225.32, 215.33, 211.14, 205.1, 205.19, 210.69, 192.53, 194.83, 210.96, 202.81, 206.84, 200.75, 223.96, 225.16, 225.01],
  },
  {
    symbol: "AVGO",
    ticker: "AVGO",
    company: "Broadcom",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 392.43,
    dailyChange: -0.14,
    weekChange: -7.1,
    monthChange: 5.82,
    ytdChange: 12.89,
    high52w: 481.57,
    low52w: 289.6,
    realizedVol: 43.73,
    sparkline: [49.77, 49.81, 50.6, 50.49, 48.74, 49.28, 50.33, 51.54, 53.17, 55.89, 56.32, 56.87, 54.66, 55.81, 63.17, 63.5, 66.48, 66.54, 61.92, 59.64, 53.32, 56.01, 59.02, 57.34, 58, 58.8, 59.6, 57.78, 61.04, 62.89, 62.7, 58.7, 57.38, 58.69, 55.44, 58.01, 58.82, 54.32, 58.33, 56.33, 54.13, 49.87, 50.91, 47.78, 49.87, 49.45, 51.25, 53.55, 55.14, 55.82, 54.84, 52.09, 50.02, 52.24, 50.25, 46.87, 44.4, 46.05, 42.71, 44.97, 47.29, 46.53, 51.81, 51.52, 52.99, 54.08, 54.47, 55.59, 55.24, 55.91, 58.84, 57.9, 57.08, 59.1, 59.76, 59.33, 59.56, 57.78, 63.28, 61.48, 63.1, 63.62, 64.15, 62.26, 61.95, 63.29, 62.65, 63.01, 63.12, 68.22, 81.27, 81.2, 80.46, 86.81, 82.21, 86.74, 84.68, 88.86, 89.68, 89.98, 88.17, 82.98, 82.58, 85.18, 87.25, 85.75, 85.17, 82.91, 83.06, 84.53, 88.32, 85.36, 83.84, 88.27, 95.75, 97.77, 97.89, 93, 94.43, 112.97, 112.2, 111.62, 104.93, 110.77, 121.12, 120.49, 122.43, 128.34, 124.55, 129.64, 139.92, 130.87, 123.55, 135.35, 132.54, 133.94, 134.41, 120.47, 134.41, 127.81, 133.28, 139.53, 140.78, 132.85, 140.66, 173.5, 165.86, 160.55, 170.33, 170.07, 157.35, 151.63, 143.82, 148.26, 165.72, 166.36, 162.82, 137, 167.69, 171.1, 172.69, 176.64, 181.48, 179.89, 173, 168.92, 183.64, 164.84, 164.23, 162.08, 179.53, 224.8, 220.79, 241.75, 232.55, 224.31, 237.44, 244.7, 221.27, 224.87, 233.04, 218.66, 199.43, 194.96, 195.54, 191.66, 169.12, 146.29, 181.94, 170.99, 192.31, 203.64, 208.2, 228.61, 228.72, 242.07, 246.93, 248.7, 249.99, 269.35, 275.18, 274.38, 283.34, 290.18, 288.64, 304.97, 306.34, 294, 297.39, 334.89, 359.87, 344.94, 334.53, 338.37, 324.63, 349.33, 354.13, 369.63, 349.43, 342.46, 340.2, 402.96, 390.24, 359.93, 340.36, 352.13, 347.62, 344.97, 351.71, 320.05, 331.3, 332.92, 325.17, 332.65, 319.55, 330.48, 322.16, 310.51, 300.68, 314.55, 371.55, 406.54, 422.76, 421.28, 430, 425.19, 414.14, 446.77, 385.73, 382.07, 411.35, 365.02, 360.45, 399.97, 370.83, 381.92, 389.28, 427.76, 392.99, 392.43],
  },
  {
    symbol: "AMD",
    ticker: "AMD",
    company: "AMD",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 506,
    dailyChange: -1.63,
    weekChange: 7.76,
    monthChange: 2.07,
    ytdChange: 126.43,
    high52w: 580.91,
    low52w: 151.14,
    realizedVol: 76.54,
    sparkline: [109.92, 105.2, 103.88, 105.8, 102.45, 105.06, 112.12, 119.82, 120.23, 136.34, 147.89, 155.41, 154.81, 144.01, 138.55, 137.75, 146.14, 143.9, 132, 136.88, 118.81, 105.24, 123.6, 113.18, 113.83, 121.06, 108.41, 104.29, 113.46, 119.67, 108.19, 101, 93.06, 88.14, 85.52, 95.34, 95.12, 93.5, 102.26, 106.3, 94.82, 81.57, 87.08, 73.67, 79.35, 81.11, 88.1, 94.47, 102.31, 100.83, 95.95, 91.18, 80.24, 85.45, 76.51, 67.96, 63.36, 58.44, 55.94, 58.82, 62.01, 62.19, 72.37, 73.57, 75.14, 74.98, 68.59, 65.41, 64.52, 64.77, 63.96, 71, 70.07, 75.4, 86.09, 81.48, 78.5, 78.09, 81.52, 82.67, 97.84, 97.95, 98.01, 92.47, 91.75, 88.43, 89.37, 89.84, 95.26, 105.82, 127.03, 117.86, 124.92, 120.08, 110.01, 113.91, 113.17, 115.94, 110.95, 112.96, 115.82, 107.57, 105.45, 102.25, 109.45, 106.09, 101.49, 96.2, 102.82, 107.24, 105.09, 101.81, 96.43, 112.25, 118.59, 120.62, 122.31, 121.39, 128.92, 139.15, 139.6, 147.41, 138.58, 146.56, 174.23, 177.25, 177.66, 172.48, 173.87, 176.52, 202.64, 207.39, 191.06, 179.65, 180.49, 170.42, 163.28, 146.64, 157.4, 150.6, 151.92, 164.47, 166.36, 166.9, 167.87, 159.63, 161.23, 162.21, 171.9, 181.61, 151.58, 139.99, 132.5, 134.27, 148.56, 154.98, 148.56, 134.35, 152.31, 155.95, 164.35, 170.9, 167.89, 155.97, 156.23, 141.86, 147.95, 134.9, 138.35, 137.18, 138.59, 126.91, 119.21, 125.19, 125.37, 116.04, 121.46, 122.84, 115.95, 107.56, 113.1, 110.84, 99.86, 100.31, 100.97, 106.44, 103.22, 85.76, 93.4, 87.5, 96.65, 98.8, 102.84, 117.17, 110.31, 110.73, 116.19, 116.16, 128.24, 143.81, 137.91, 146.42, 156.99, 166.47, 171.7, 172.76, 177.51, 167.76, 162.63, 151.14, 158.57, 157.39, 159.46, 164.67, 214.9, 233.08, 252.92, 256.12, 233.54, 246.81, 203.78, 217.53, 217.97, 210.78, 213.43, 214.99, 223.47, 203.17, 231.83, 259.68, 236.73, 208.44, 207.32, 200.15, 200.21, 192.43, 193.39, 201.33, 201.99, 217.5, 245.04, 278.39, 347.81, 360.54, 455.19, 424.1, 467.51, 516.1, 466.38, 511.57, 537.37, 521.58, 517.82, 557.89, 495.76, 521.95, 476.15, 483.36, 514.39, 506],
  },
  {
    symbol: "TSM",
    ticker: "TSM",
    company: "TSMC (ADR)",
    layer: "silicon",
    country: "Taiwan",
    flag: "🇹🇼",
    listingCurrency: "USD",
    value: 430.95,
    dailyChange: 1.08,
    weekChange: 2.98,
    monthChange: 8.18,
    ytdChange: 34.84,
    high52w: 477.57,
    low52w: 227.33,
    realizedVol: 39.3,
    sparkline: [123.97, 122.97, 117.75, 115.64, 111.56, 110.04, 114.86, 114.23, 113.7, 117.8, 118.69, 124.26, 117.09, 119.33, 119.13, 116.32, 120.68, 120.31, 123.5, 140.66, 124.53, 117.61, 121.02, 121.01, 119.31, 111.23, 105.06, 101.41, 106.72, 106.73, 102.79, 99.29, 98.36, 95.68, 92.93, 91.63, 90.96, 90.78, 93.77, 93.77, 88.68, 85, 85.92, 77, 81.51, 85.63, 86.32, 88.48, 89.77, 90.86, 87.2, 84.74, 80.9, 81.53, 77.89, 73.87, 68.56, 69.75, 63.92, 63.75, 62.01, 62.48, 73.83, 82.27, 81.4, 81.5, 80.69, 76.3, 74.89, 74.49, 78.07, 86.8, 91.03, 93.3, 94.66, 95.37, 90.1, 88.11, 89.79, 87.25, 89.47, 92.79, 93.02, 90.24, 87.2, 85.37, 84.3, 84.97, 83.43, 92.58, 103.21, 98.94, 102.8, 104.57, 101.91, 100.92, 100.23, 105.14, 97.25, 100.86, 96.16, 91.99, 91.1, 93.1, 93.19, 89.64, 89.25, 85.64, 86.9, 89.29, 90.46, 91.31, 85.99, 91.79, 97.44, 99.58, 97.83, 98.55, 100.35, 102.54, 103.15, 104, 99.61, 101.24, 114.2, 117.26, 115.75, 133.11, 126.69, 129.53, 133.9, 146.37, 136.98, 140.54, 136.05, 141.36, 142.52, 127.7, 138.3, 141.56, 149.26, 151.68, 160, 151.04, 164.39, 172.51, 173.96, 173.81, 183.99, 187.35, 165.77, 161.94, 149.86, 167.12, 174.54, 171.28, 171.7, 156.82, 172.5, 174.08, 177.97, 181.16, 190.81, 200.78, 203.44, 192.95, 201.2, 186.01, 190.08, 184.66, 203.02, 200.99, 197.21, 201.63, 208.61, 208.37, 211.5, 221.88, 209.32, 206.12, 203.9, 198.24, 180.53, 177.1, 174.09, 176.73, 165.25, 146.8, 157.08, 151.74, 165.1, 179.28, 176.52, 194.22, 191.98, 193.32, 205.18, 211.1, 209.51, 228.57, 234.8, 230.4, 240.4, 245.6, 235.21, 241.83, 238.88, 232.99, 230.87, 243.41, 259.33, 264.87, 273.36, 292.19, 280.66, 295.08, 294.96, 300.43, 286.5, 284.82, 275.06, 291.51, 294.72, 292.04, 288.95, 302.84, 319.61, 323.63, 342.4, 334.87, 330.56, 348.85, 366.36, 370.54, 374.58, 338.89, 338.31, 329.24, 326.74, 339.04, 370.6, 370.5, 402.46, 397.67, 411.68, 404.35, 404.52, 418.45, 415.17, 423.93, 462.12, 432.35, 434.16, 434.11, 398.37, 403.41, 404.25, 420.04, 426.35, 430.95],
  },
  {
    symbol: "ASML",
    ticker: "ASML",
    company: "ASML (ADR)",
    layer: "silicon",
    country: "Netherlands",
    flag: "🇳🇱",
    listingCurrency: "USD",
    value: 1883.12,
    dailyChange: 2.12,
    weekChange: 8.63,
    monthChange: 7.76,
    ytdChange: 61.81,
    high52w: 1989.44,
    low52w: 725.85,
    realizedVol: 45.03,
    sparkline: [858.11, 858.87, 859.85, 868.82, 741.81, 730.27, 789.4, 800.97, 812.88, 847, 851.63, 857.17, 782.02, 771.52, 781.84, 749.87, 801.41, 796.14, 756.1, 744.53, 694.73, 644.97, 652.81, 628.24, 647.83, 667.12, 594.32, 585.85, 679.86, 687.36, 667.73, 610.93, 597.87, 607.61, 563.77, 551, 548.32, 532.84, 583.38, 563.65, 521.53, 473.35, 515.26, 449.83, 452.95, 475.63, 534.26, 574.44, 577.31, 575.96, 545.26, 509.94, 467.19, 501, 467.25, 436.14, 415.35, 434.26, 379.13, 462.23, 489.18, 468.76, 576.44, 593.16, 591.84, 605.71, 597.7, 574.32, 551.37, 546.4, 595.85, 659.69, 648.85, 667.39, 679.62, 656.35, 651.93, 618.38, 637.38, 601.21, 633.69, 647.53, 680.71, 657.12, 666.2, 634.47, 636.86, 650.32, 647.51, 694, 735.93, 724.65, 715.86, 721.88, 697.89, 724.75, 696.74, 754.02, 693.36, 718.37, 678.04, 661.78, 655.33, 651.01, 662.52, 627.86, 596.66, 587.1, 588.66, 597.36, 599.75, 580.1, 590, 642.41, 661.28, 686.09, 691.18, 692.2, 696.43, 752.96, 752.53, 756.92, 703.34, 713.22, 757.83, 867.75, 890.66, 949.6, 928.94, 933.25, 990.94, 994.33, 940.21, 979.96, 970.47, 979.55, 961.84, 859.54, 918.97, 901.63, 930.29, 924.97, 956.22, 960.35, 1028.42, 1027.9, 1036.6, 1022.73, 1074.48, 1085.26, 895.37, 888.39, 809.35, 860.55, 918.66, 907.26, 903.87, 752.79, 816.36, 795.28, 841.54, 833, 840.69, 723.26, 711.7, 674.73, 669.47, 658.63, 672.88, 686.61, 708.98, 718.58, 705.68, 713.59, 714.36, 739.01, 756.33, 732.25, 739.31, 727.7, 751.55, 737.21, 709.08, 732.22, 714, 716.22, 674.58, 605.55, 668.81, 640.16, 677.27, 690.33, 706.21, 748.1, 732.49, 736.77, 753.02, 761, 756.53, 795.95, 794.5, 801.93, 734.58, 711.25, 689.82, 722.32, 742.16, 754.89, 742.62, 781.7, 813.87, 932.15, 951.52, 1032.22, 936.19, 1029.27, 1033.1, 1059.23, 1016.96, 1006.98, 966.57, 1060, 1099.47, 1080.85, 1056.02, 1072.75, 1163.78, 1273.88, 1358.57, 1389.04, 1423, 1413.01, 1406.61, 1469.59, 1450.56, 1292.8, 1345.69, 1317.25, 1302.47, 1317.23, 1478.28, 1459.8, 1457.7, 1427.02, 1592.02, 1501.81, 1632.9, 1612.76, 1641.74, 1863.55, 1929.68, 1794.62, 1769.32, 1797.32, 1747.58, 1757.09, 1629, 1740.99, 1844.08, 1883.12],
  },
  {
    symbol: "MU",
    ticker: "MU",
    company: "Micron",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 1011.75,
    dailyChange: 4.13,
    weekChange: 17.51,
    monthChange: 19.18,
    ytdChange: 220.76,
    high52w: 1213.56,
    low52w: 115.79,
    realizedVol: 94.87,
    sparkline: [73.81, 73.5, 74.3, 74.05, 70.99, 70.12, 67.68, 67.51, 69.1, 72.92, 77.3, 83.03, 83.42, 81.62, 85.54, 83, 94.42, 93.15, 94.45, 97.36, 81.93, 79.27, 81.17, 89.76, 90.8, 90.1, 81.91, 72.82, 79.41, 78.1, 76.18, 72.14, 70.13, 69.41, 68.19, 70.35, 71.92, 68.9, 73.32, 69.94, 62.62, 55.75, 58.44, 53.65, 59.14, 61.53, 61.29, 61.86, 62.46, 65.04, 60.51, 57.63, 56.33, 57.44, 52.85, 50.1, 50.1, 52.91, 52.72, 56.05, 54.04, 56.16, 62.52, 58.58, 58.41, 54.68, 54.87, 52.07, 50.2, 49.98, 56.77, 56.93, 58.46, 63.87, 62.41, 59.82, 59.01, 58.18, 56.78, 54.93, 56.66, 61.16, 60.34, 58.56, 62.63, 61.13, 64.36, 61.23, 60.92, 68.17, 73.93, 69.17, 65.43, 67.66, 65.28, 63.11, 60.65, 64.08, 65.65, 71.2, 69.91, 64.37, 63.59, 63.72, 70.39, 70.18, 69.88, 68.88, 68.03, 69.96, 69.21, 67.22, 65.65, 72.58, 75.36, 77.56, 76.87, 75.93, 74.96, 81.41, 86.49, 85.34, 83.45, 82.39, 87.51, 88.05, 86.48, 85.56, 79.5, 86, 95.15, 97.62, 93.25, 110.21, 117.89, 123.58, 122.52, 106.77, 114.84, 114.7, 121.24, 125.29, 129.49, 125, 130.94, 141.36, 139.54, 131.53, 131.6, 133.55, 114.26, 109.41, 92.7, 93.08, 107.99, 102.85, 96.24, 86.38, 91.22, 90.9, 107.5, 102.25, 106.92, 111.15, 107.91, 99.73, 111.9, 96.34, 102.64, 97.95, 101.17, 102.5, 90.12, 88.63, 89.87, 99.34, 105.75, 103.19, 91.24, 92.3, 99.52, 98.84, 93.63, 92.96, 100.79, 94.72, 88.44, 64.72, 69.55, 68.8, 79.78, 80.72, 85.86, 98, 93.37, 94.46, 108.56, 115.6, 123.6, 124.76, 122.29, 124.53, 114.39, 111.26, 104.88, 118.89, 120.87, 117.68, 119.01, 131.37, 157.23, 162.73, 157.27, 187.83, 181.6, 202.38, 219.02, 223.77, 237.92, 246.83, 207.37, 236.48, 237.22, 241.14, 265.92, 284.79, 315.42, 345.09, 362.75, 399.65, 414.88, 394.69, 411.66, 428.17, 412.37, 370.3, 426.13, 422.9, 357.22, 366.24, 420.59, 455.07, 496.72, 542.21, 746.81, 724.66, 751, 971, 864.01, 981.61, 1133.99, 1132.33, 975.56, 979.3, 848.95, 920.95, 823.03, 877.57, 971.66, 1011.75],
  },
  {
    symbol: "ARM",
    ticker: "ARM",
    company: "Arm Holdings",
    layer: "silicon",
    country: "United Kingdom",
    flag: "🇬🇧",
    listingCurrency: "USD",
    value: 271.43,
    dailyChange: -2.87,
    weekChange: 1.34,
    monthChange: 1.59,
    ytdChange: 136.58,
    high52w: 439.46,
    low52w: 104.55,
    realizedVol: 88.98,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 60.75, 51.32, 53.52, 54.08, 50.78, 47.87, 49.09, 53.49, 52.27, 54.99, 63.88, 63.9, 67.23, 71.03, 72.29, 75.14, 67.05, 70, 78.58, 71.17, 71, 115.21, 128.34, 133.34, 141.62, 131.48, 126.97, 134.15, 124.99, 124.82, 126.33, 87.19, 101.95, 101.7, 108.84, 110.35, 114.64, 120.52, 136.57, 157.89, 160.3, 163.62, 181.19, 181.18, 163.4, 149, 113.45, 117, 130.3, 135.63, 132.88, 117.29, 147.37, 138.9, 145.58, 140.55, 151.46, 153.03, 143.75, 141.48, 147.48, 128.73, 135.99, 134.29, 140.89, 151.91, 132.15, 129.2, 141.08, 140.49, 149.26, 162.52, 159.55, 162.51, 159.54, 144.84, 131.69, 125.55, 117.94, 119.07, 107.8, 87.71, 103.99, 100.73, 113.34, 123.27, 115.8, 135.96, 127.18, 124.54, 133.11, 135.55, 145.04, 165.46, 155.09, 145.94, 156.74, 163.17, 137.58, 138.5, 138.91, 137.92, 138.31, 138.17, 150.64, 142.91, 139.62, 152.64, 154.81, 165.61, 170.68, 169.82, 152.38, 139.77, 131.57, 135.56, 141.31, 130.89, 114.03, 110.27, 114.73, 111.79, 105.78, 116.07, 105.36, 123.7, 125.28, 125.58, 127.45, 114.38, 115.75, 132.35, 144.13, 149.11, 148.93, 166.73, 234.81, 211.18, 213.27, 209.16, 306.51, 353.29, 342.93, 380.81, 439.46, 334.27, 315.28, 323.39, 267.19, 260.01, 239.69, 282.57, 279.44, 271.43],
  },
  {
    symbol: "MRVL",
    ticker: "MRVL",
    company: "Marvell",
    layer: "silicon",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 234.33,
    dailyChange: 5.54,
    weekChange: 12.36,
    monthChange: 24.19,
    ytdChange: 162.14,
    high52w: 316.43,
    low52w: 62.31,
    realizedVol: 89.14,
    sparkline: [61.51, 61.17, 62.1, 63.61, 59.83, 64.62, 65.65, 66.31, 68.5, 71.86, 73.48, 74.58, 71.99, 83.59, 89.02, 84.03, 87.68, 87.49, 83.11, 83, 72.55, 66.32, 71.1, 67.99, 67.34, 68.75, 63.41, 63.09, 71.33, 74.37, 71.07, 63.15, 60.97, 58.44, 58.08, 57.75, 57.57, 54.07, 60.82, 58.96, 53.07, 46.04, 48.22, 42.55, 46.99, 48.22, 52.02, 55.68, 56.94, 55.36, 53.14, 50.17, 45.76, 49.74, 46.35, 43.29, 42.91, 42.35, 37.01, 39.54, 41.01, 38.97, 43.35, 44, 42.98, 44.72, 41.5, 38.99, 37.19, 37.04, 36.1, 40.67, 39.48, 44.25, 46.58, 44.55, 44.14, 43.85, 44.04, 38.68, 39.97, 41.07, 43.3, 39.26, 40.29, 39.02, 39.48, 40.97, 40.12, 45.46, 65.51, 60.18, 60.01, 61.12, 57.82, 59.78, 59.15, 63.45, 63.41, 64.91, 62.69, 57.09, 57.59, 53.5, 57.95, 55.74, 54.49, 52.3, 54.13, 54.53, 52.62, 49.47, 47.26, 51.36, 54.62, 55.58, 56.03, 52.8, 52.88, 59.59, 60.25, 60.31, 59.92, 65.68, 71.08, 68.04, 67.53, 68.83, 66.29, 67.58, 77.61, 75.42, 66.87, 66.54, 70.88, 72.65, 70.16, 62.13, 69.62, 68.51, 68.47, 71.92, 76.68, 68.81, 67.99, 73.27, 71.89, 69.9, 72.08, 73.59, 66.51, 65.72, 59.25, 60.56, 69.32, 71.84, 76.24, 66.2, 74.48, 73.87, 70.99, 73.41, 74.01, 79.85, 81.61, 84.77, 93.8, 87.83, 92.51, 92.69, 113.51, 120.77, 111.9, 113.62, 118.18, 114.32, 124.76, 124.02, 112.86, 110.62, 106.51, 103.81, 91.82, 70.84, 68.74, 70.39, 62.04, 49.43, 53.39, 51.7, 58.92, 62.33, 59.65, 63.76, 60.69, 60.19, 68.35, 67.19, 73.51, 77.16, 75.18, 72.71, 74.65, 74.21, 74.45, 77.34, 76.19, 73, 62.87, 63.33, 67.35, 74.26, 83.17, 86.22, 85.61, 87.95, 84.13, 93.74, 90.92, 86.45, 77.45, 89.4, 98.91, 84.43, 84.09, 86.34, 89.39, 83.22, 80.46, 80.23, 78.92, 80.28, 78.61, 79.48, 81.69, 89.57, 87.86, 87.91, 94.88, 107.11, 128.49, 139.69, 164.31, 164.95, 170.13, 176.89, 196.33, 205, 263.47, 279.7, 310.58, 266.77, 245.29, 235.81, 188.68, 194.23, 187.56, 218.72, 222.02, 234.33],
  },
  {
    symbol: "8035.T",
    ticker: "8035",
    company: "Tokyo Electron",
    layer: "silicon",
    country: "Japan",
    flag: "🇯🇵",
    listingCurrency: "JPY",
    value: 370.89,
    dailyChange: -0.63,
    weekChange: 5.64,
    monthChange: -15.3,
    ytdChange: 57.67,
    high52w: 484.54,
    low52w: 134.27,
    realizedVol: 77.55,
    sparkline: [148.53, 165.63, 168.43, 164.45, 146.24, 141.44, 145.09, 148.59, 155.05, 165.73, 168.45, 183.23, 176.24, 174.89, 181.7, 179.68, 187.14, 192.2, 186.77, 190.5, 168.17, 153.07, 162.5, 164.79, 164.86, 163.25, 157.58, 151.43, 164.18, 172.98, 168.86, 148.86, 142.34, 144.02, 144.04, 141.51, 147.73, 152.26, 155.12, 153.84, 138.03, 120.93, 115.52, 104.72, 106.81, 103.24, 110.04, 114.11, 122.81, 116.35, 114.39, 111.96, 101.23, 99.47, 95.12, 93.34, 82.39, 89.24, 82.96, 85.21, 88.83, 85.25, 104.35, 105.86, 110.68, 115.28, 111.51, 105.94, 98.72, 97.51, 102.95, 116.36, 115.42, 116.8, 122.98, 122.34, 114.84, 118.28, 114.92, 117.38, 121.37, 127.36, 120.42, 116.96, 116.35, 116.35, 115.81, 114.38, 121.9, 133.67, 140.23, 138.92, 136.18, 145.44, 138.26, 142.01, 140.36, 146.22, 137.99, 150.58, 147.93, 142.28, 141.41, 140.07, 147.35, 143.35, 148.46, 138.24, 136.87, 130.94, 141.6, 134.08, 130.42, 139.86, 146.61, 160.01, 160.42, 161.15, 154.15, 171.28, 175.3, 178.57, 166.61, 180.98, 190.58, 189.34, 191.87, 199.35, 235.75, 243.29, 255.7, 259.42, 238.78, 259.38, 261.36, 246.34, 257.85, 216.87, 219.99, 224.85, 225.24, 232.27, 228, 214.27, 221.33, 222.43, 219.72, 217.19, 225.4, 225.66, 198.35, 179.74, 181.33, 174.78, 194.04, 185.39, 178.1, 153.42, 167.35, 169.71, 189.38, 172.67, 172.29, 156.56, 152.98, 147.95, 151.78, 142.52, 144.28, 154.19, 159.45, 156.37, 147.8, 154.55, 153.19, 170.99, 171.57, 173.77, 170.06, 168.66, 162.27, 170.37, 147.49, 142.56, 145.19, 150.51, 142.69, 129.66, 136.63, 137.5, 148.73, 145.34, 154.47, 161.15, 158.18, 159.97, 164.76, 166.21, 165.17, 190.16, 187.83, 184.57, 187.62, 190.2, 148.6, 144.99, 145.61, 135.42, 140.78, 136.41, 153.41, 173.1, 177.13, 193.61, 191.42, 200.37, 198.36, 222.09, 214.45, 205.97, 191.78, 203.48, 213.61, 202.49, 200.53, 219.94, 219.98, 241.65, 265.77, 263.22, 269.71, 261.7, 274.77, 283.32, 282.37, 265.28, 240.82, 246.13, 246.02, 240.89, 276.79, 276.45, 287.02, 302.27, 334.44, 317.52, 313.36, 329.13, 371.59, 424.65, 467.24, 450.67, 453.39, 449.24, 400.92, 382.46, 346.48, 344.05, 370.89, 370.89],
  },
  {
    symbol: "VRT",
    ticker: "VRT",
    company: "Vertiv",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 292.58,
    dailyChange: -0.43,
    weekChange: 8.32,
    monthChange: 1.04,
    ytdChange: 66.61,
    high52w: 376.23,
    low52w: 121.82,
    realizedVol: 76.44,
    sparkline: [28.19, 24.53, 23.73, 23.83, 24.54, 22.43, 22.92, 24.07, 25.68, 27.63, 26.71, 26.98, 25.78, 25.51, 25.78, 23.95, 24.86, 24.97, 22.55, 23.29, 21.34, 20.05, 21.33, 21.14, 20.47, 13.2, 10.57, 11.84, 13.4, 12.85, 14.58, 13.54, 12.38, 11.63, 12.53, 12.21, 11.3, 10.84, 11.44, 10.87, 10.09, 9.18, 10.23, 8.29, 9.03, 8.94, 10.61, 11.42, 12.83, 13.52, 12.33, 11.83, 11.21, 13.37, 12.33, 9.95, 9.72, 10.95, 10.22, 13.21, 14.96, 14.18, 15.36, 13.84, 13.74, 14.76, 13.64, 13.14, 12.82, 13.66, 14.12, 14.97, 14.52, 14.38, 14.59, 14.46, 16.06, 15.81, 16.36, 14.24, 13.12, 13.09, 14.31, 12.38, 12.43, 12.18, 14.92, 14.98, 15.1, 15.56, 19.74, 19.8, 21.19, 22.54, 23.64, 24.77, 24.65, 26.35, 25.68, 25.95, 35.71, 33.51, 33.97, 37.5, 39.87, 39.2, 38.17, 36.45, 37.2, 39.77, 39.1, 36.74, 36.42, 40.44, 41.83, 43.29, 42.68, 45.14, 47.14, 47.73, 48.78, 48.03, 46.31, 49.52, 53.67, 53.46, 61.47, 63.52, 62.97, 62.7, 70.57, 69.37, 74.16, 82.5, 81.67, 85.34, 83.89, 75.01, 93.49, 93.01, 95.4, 96.81, 106.17, 98.07, 87.68, 91.48, 90.62, 86.57, 91.78, 89.67, 85.31, 77.12, 69.46, 71.46, 79.42, 78.55, 83.03, 71.77, 85.76, 94.54, 98.41, 105.2, 111.84, 112.25, 112.17, 106.9, 125.75, 120.87, 140.15, 127.6, 133.85, 125.78, 120.04, 115.11, 125.67, 128.93, 135.88, 146.32, 117.02, 121.38, 108.05, 95.99, 95.17, 85.04, 87.45, 88.63, 74.25, 59.41, 69.61, 73.21, 86.95, 95, 94.06, 106.04, 104.14, 107.93, 115.36, 110.97, 118.54, 127.16, 127.84, 123.3, 129.06, 137.47, 141.59, 139.93, 133.07, 125.97, 127.55, 124, 134.84, 143.6, 138.62, 160.2, 169.01, 174, 186.06, 192.86, 179.8, 170.97, 159.83, 179.73, 189.02, 161.27, 159.82, 167.58, 175.61, 163.58, 176.93, 182.49, 186.18, 195.58, 234.53, 243.75, 254.89, 241.78, 258.88, 255.88, 251.07, 261.29, 295.11, 307.34, 323.46, 328.31, 339.97, 370.94, 327.46, 315.71, 300.51, 302.87, 333.05, 303.95, 300.53, 318.86, 289.56, 290.36, 241.57, 272.4, 293.84, 292.58],
  },
  {
    symbol: "ANET",
    ticker: "ANET",
    company: "Arista Networks",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 201.8,
    dailyChange: 1.5,
    weekChange: 5.37,
    monthChange: 19.68,
    ytdChange: 51.05,
    high52w: 210.5,
    low52w: 116.13,
    realizedVol: 59.11,
    sparkline: [22.69, 21.93, 22.45, 22.51, 21.91, 23.25, 24.36, 24.41, 25.61, 33.16, 32.86, 32.24, 31.24, 30.3, 32.67, 33.76, 35.46, 35.94, 32.37, 32.44, 29.66, 30.05, 30.58, 30.23, 31.48, 30.88, 29.64, 29.98, 32.81, 34.6, 34.87, 32.76, 31.65, 29.42, 28.89, 27.75, 27.16, 25.66, 26.47, 25.79, 23.74, 22.74, 24.95, 23.35, 25.75, 25.42, 25.59, 29.16, 31.67, 31.72, 32.5, 30.76, 29.33, 31.1, 28.93, 27.49, 28.22, 29.1, 25.09, 27.63, 30.37, 32.77, 32.14, 33.87, 33.94, 33.76, 31.98, 30.92, 29.94, 30.34, 28.11, 28.75, 28.78, 31.51, 32.99, 33.32, 34.56, 33.88, 35.17, 36.62, 40.81, 42.24, 41.97, 39.96, 40.9, 38.97, 40.04, 34.49, 34.66, 35.98, 42.59, 40.62, 40.63, 39.45, 37.21, 40.51, 39.5, 41.4, 42.91, 37.77, 44.9, 43.74, 45.13, 45.22, 49.34, 49.12, 46.18, 45.08, 45.98, 48.51, 47.46, 46.53, 44.05, 53.12, 51.71, 53.66, 54.6, 54.16, 56.01, 58.9, 59.56, 58.88, 57.73, 63.01, 65.88, 66.1, 68.28, 70.61, 65.44, 66.92, 71.93, 68.28, 69.43, 76.61, 72.5, 74.4, 67.81, 61.52, 66.18, 68.6, 78.51, 79.97, 76.64, 74.41, 74.2, 82.12, 84.34, 87.62, 91.54, 90.47, 82.64, 79.8, 79.83, 83.95, 88.47, 88.78, 88.35, 78.58, 89.94, 96.11, 95.07, 98.99, 104.23, 100.5, 98.52, 98.54, 100.11, 93.6, 101.62, 101.46, 108.25, 112.37, 112.81, 113.03, 115.2, 114.34, 119.95, 129.17, 115.23, 118.47, 106.87, 98.3, 93.05, 83.36, 83.51, 83.13, 77.94, 64.37, 72.67, 71.2, 77.91, 91.02, 86.52, 96.42, 91.2, 86.64, 97.25, 92.35, 86.25, 99.39, 102.52, 108.57, 111.78, 114.28, 117.57, 139.18, 137.3, 133.25, 136.55, 142.85, 139.39, 149.61, 142.5, 145.5, 154.1, 143.1, 153.82, 157.69, 134.65, 131.37, 117.43, 130.68, 128.59, 124.76, 131.12, 131.84, 133.6, 122.89, 129.83, 136.34, 141.74, 137.49, 141.59, 132.79, 133.5, 132.89, 133.57, 131.22, 120.77, 126.68, 147.35, 164.23, 176.91, 172.7, 141.77, 141.97, 154.03, 159.47, 154.27, 163.24, 169.67, 157.6, 159.99, 186.96, 168.61, 173.99, 180.35, 188.67, 198.82, 201.8],
  },
  {
    symbol: "ETN",
    ticker: "ETN",
    company: "Eaton",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 455.53,
    dailyChange: 0.89,
    weekChange: 2.38,
    monthChange: 13.89,
    ytdChange: 39.17,
    high52w: 459.96,
    low52w: 315.82,
    realizedVol: 47.11,
    sparkline: [166.38, 160.39, 157.53, 156.01, 150.65, 153.56, 161.45, 162.38, 164.76, 171.3, 171.8, 172.3, 167.51, 166.44, 170.46, 165.07, 168.04, 172.82, 167.85, 170.92, 160.54, 156.69, 151, 150.66, 153.36, 154.12, 149.78, 146.92, 155.58, 154.18, 151.81, 145.18, 139.91, 146.04, 145.02, 147.29, 141.33, 134.14, 139.82, 140.35, 137.03, 125.52, 131.83, 127.37, 127.82, 128.99, 136.65, 148.39, 148.65, 152.44, 150.84, 141.08, 137.3, 145.71, 138.27, 134.14, 133.36, 136.83, 134.31, 139.33, 150.28, 158.69, 161.6, 165.01, 166.11, 163.31, 158.28, 154.5, 156.8, 156.95, 161.1, 164.45, 155.51, 162.24, 163.24, 170.91, 175.24, 173.25, 177.55, 170.3, 160.15, 163.64, 171.34, 156.25, 161.82, 162.88, 167.12, 171.05, 168.58, 174.15, 182.46, 186.48, 187.3, 191.26, 194.46, 201.1, 198.46, 203.46, 207.69, 203.3, 215.9, 218.36, 214.65, 224.25, 233.67, 236.13, 217.64, 212.66, 213.28, 210.19, 208.6, 193.99, 195.31, 214.79, 221.82, 227.8, 228.72, 230.46, 232.31, 237.41, 238.64, 240.82, 234.86, 242.11, 244.6, 245.89, 270.1, 277.96, 277.52, 284.93, 293.7, 297.49, 297.9, 316.58, 312.68, 330.51, 318.5, 303.02, 324.3, 320.5, 330.57, 330.24, 340.89, 332.85, 314.83, 319.02, 320.06, 313.55, 317.37, 330.48, 311.89, 297.79, 280.26, 291.64, 296.68, 300, 306.93, 284.97, 305.8, 330.6, 328.45, 333.05, 341.39, 348.18, 344.49, 335, 366.67, 358.99, 377.41, 375.42, 371.22, 356.01, 338.12, 334.63, 342.58, 341.45, 346.28, 368.98, 326.44, 313.05, 309.17, 297.37, 293.32, 284.98, 293.61, 295.44, 274.17, 246.52, 277.53, 268.32, 288.82, 299.71, 309.87, 329.07, 321.06, 320.2, 331.45, 323.66, 331.23, 353.23, 362.22, 360.62, 378.62, 392.17, 381.29, 362.84, 351.03, 347.61, 349.14, 349.03, 365.9, 374.5, 365.58, 373.46, 369.08, 373.3, 376.29, 381.56, 373.77, 352.39, 331.71, 345.89, 337.66, 331.98, 317.8, 322.17, 327.31, 324.51, 343.75, 331.22, 351.42, 373.82, 389.25, 373.38, 375.92, 347.75, 355.4, 356.8, 357.36, 361.1, 403, 406.21, 423.92, 425.55, 401.51, 399.44, 391.35, 400.6, 395.94, 391.39, 421.77, 402.68, 398.52, 407.28, 399.99, 404.07, 415.2, 448.68, 451.51, 455.53],
  },
  {
    symbol: "CEG",
    ticker: "CEG",
    company: "Constellation Energy",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 278.2,
    dailyChange: -1.52,
    weekChange: 2.87,
    monthChange: 10.23,
    ytdChange: -24.04,
    high52w: 403.95,
    low52w: 236.5,
    realizedVol: 33.64,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 45, 46.75, 50.14, 48.09, 45.41, 43.91, 51, 49.32, 49.01, 53.8, 58.02, 64.02, 62.55, 62.43, 59.21, 60.27, 54.61, 56.65, 66.6, 65.17, 59.79, 58.1, 59.28, 57.6, 59.65, 55.66, 54, 66.1, 74.3, 81.5, 80.84, 80.83, 81.07, 87.51, 85.57, 83.85, 83.19, 84.39, 81.26, 87.28, 93.75, 94.32, 92.31, 93.3, 97.16, 92.04, 89.72, 88.2, 88.04, 86.21, 83.5, 85.16, 83, 86.58, 83.2, 86.81, 84.55, 79.27, 78.98, 77.55, 76.77, 73.44, 78.5, 76.96, 76.43, 76.55, 77.4, 79.49, 79.85, 82.3, 83.85, 87.54, 93.29, 92.89, 90.36, 91.55, 91.33, 95, 96.6, 95.74, 103.94, 106.56, 104.77, 105.87, 107.29, 108.64, 109.93, 110.36, 109.08, 110.17, 113.69, 112.1, 110.78, 117.07, 121.77, 121.69, 123.86, 119.88, 111.21, 118.75, 115.33, 116.89, 116.24, 112.91, 114.45, 121.27, 129.71, 132.17, 131.16, 133.99, 169.99, 170.57, 165.52, 178.24, 184.85, 193.08, 191.67, 180.9, 188.37, 194.86, 214.93, 213.11, 230.63, 217.25, 198, 214.9, 218.13, 200.27, 211.29, 217.14, 189.3, 175.04, 167.08, 189.87, 189.98, 194.99, 196.7, 173.11, 195.98, 254.98, 257, 285.52, 266.22, 270.16, 264.41, 258.1, 239.37, 224.28, 249.89, 256.56, 253.63, 239.07, 227.02, 226.54, 252.4, 305.19, 316.36, 347.44, 299.98, 309.79, 317.3, 284.44, 250.54, 212.54, 216.46, 222.48, 205.39, 170.96, 208.25, 206.68, 222.99, 247.26, 271.37, 291.12, 297.49, 306.15, 298.8, 296.89, 304.92, 320.17, 311.88, 321.54, 321.42, 327.35, 340.77, 335.77, 322.23, 310.16, 307.98, 301.58, 323.48, 330.9, 331.26, 360, 368.49, 386.5, 389.19, 377, 358.39, 338.52, 338.11, 364.36, 359.82, 351.98, 355.4, 360.46, 366.25, 342.52, 307.71, 289.06, 280.68, 261.42, 288.43, 294.84, 329.88, 319.06, 301.77, 281.99, 301.49, 272.82, 286.5, 296.21, 313.53, 307.81, 303.63, 267.2, 294.07, 287.75, 254.83, 253.76, 274.06, 264.02, 239.25, 251.38, 252.39, 274.35, 262.75, 269.89, 282.5, 278.2],
  },
  {
    symbol: "GEV",
    ticker: "GEV",
    company: "GE Vernova",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 1079.37,
    dailyChange: 1.52,
    weekChange: 8.93,
    monthChange: 2.04,
    ytdChange: 58.84,
    high52w: 1174.86,
    low52w: 547.96,
    realizedVol: 54.96,
    sparkline: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 136.75, 122.7, 134, 135.1, 153.07, 166.26, 167.27, 162.62, 177.43, 175.9, 162.08, 170.17, 175.73, 171.51, 176.23, 180.45, 163.34, 173.11, 164.73, 179.11, 184.06, 183.29, 201, 198.33, 225.59, 245.46, 249.86, 265.59, 266.89, 272.72, 293.54, 301.09, 341.18, 329.76, 349.16, 334.12, 346.51, 332.01, 342.66, 333.8, 354.03, 367.1, 401.41, 420.49, 372.88, 377.97, 367.59, 327.88, 335.18, 289.3, 313.63, 333.87, 302.93, 271.48, 321.43, 323.55, 372.42, 396.32, 399.26, 428.06, 464.39, 472.98, 485, 478.45, 486.96, 519.66, 517.04, 539.16, 574.6, 644.59, 656.5, 649.09, 621.91, 607.07, 612.97, 582.08, 625.55, 624.17, 605.17, 594.99, 604.56, 600, 584.39, 585.14, 575.13, 578.31, 555.84, 599.77, 631.32, 671.71, 658.28, 663.46, 679.55, 622.5, 681.55, 657.78, 726.37, 779.35, 802.13, 830.34, 873.6, 789.23, 805.02, 851.07, 853.16, 898.57, 991.32, 1002.75, 1149.19, 1062.95, 1040.15, 1049.23, 1038.74, 968.32, 933.61, 940.66, 1109.73, 1045.17, 1113.11, 1091.57, 1057.84, 1014.75, 990.29, 990.32, 1063.25, 1079.37],
  },
  {
    symbol: "EQIX",
    ticker: "EQIX",
    company: "Equinix",
    layer: "infra",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 1097.61,
    dailyChange: -0.41,
    weekChange: 5.2,
    monthChange: 7.61,
    ytdChange: 43.65,
    high52w: 1115.94,
    low52w: 726.09,
    realizedVol: 30.86,
    sparkline: [882.83, 844, 872.58, 834.68, 789.32, 750.96, 781.39, 821.02, 837.07, 781.92, 775.39, 788.53, 793.84, 794.03, 797.89, 822.26, 818.76, 845.84, 774.94, 746.76, 721.58, 707.56, 702.15, 671.52, 692.94, 715.74, 720.92, 693.55, 732.26, 710.14, 763, 768.78, 735.24, 745.41, 719.08, 713.44, 659.8, 651.79, 693.68, 678.44, 649.17, 632.81, 689.17, 673.03, 650.52, 619.75, 653.78, 703.74, 697.51, 704.56, 696.79, 670.74, 631.16, 657.89, 624.75, 593.13, 568.84, 541.86, 505.39, 534.6, 568.05, 611.09, 660.6, 647.41, 674.66, 691.47, 675.8, 667.84, 657.68, 655.03, 673.94, 721.89, 720.06, 730.22, 733, 729.75, 716.76, 684.8, 705.41, 665.63, 690.85, 681.7, 721.04, 711.23, 688.68, 713, 724.08, 740, 739.23, 723.58, 729.15, 757.61, 743.69, 778.61, 746.11, 783.94, 772.31, 805.73, 807.12, 797.36, 757.88, 774.17, 749.77, 770.92, 777.52, 771.44, 776.22, 731.91, 726.26, 723.66, 742.64, 705.62, 710.39, 770.76, 767.27, 774.64, 795, 824.42, 801.77, 803.73, 799.68, 805.39, 788.39, 815.02, 802.69, 810.98, 843.47, 855.76, 856.23, 882.29, 900.53, 910.1, 850.39, 800.97, 825.33, 784.41, 764.05, 748, 731.61, 700.18, 757.68, 799.83, 766.12, 762.98, 753.39, 766.26, 765, 756.6, 754.49, 804.84, 786.82, 772.43, 806.65, 818.88, 828.66, 827.96, 834.36, 817.96, 871.54, 877.2, 882.69, 876.88, 871.56, 895.2, 914.33, 888.3, 921.06, 897.37, 936.37, 981.48, 985, 965, 927.22, 942.66, 959.97, 899.83, 915.59, 940.85, 913.66, 933.27, 933.6, 919.68, 904.62, 859.52, 837.68, 834.59, 803, 766.21, 776.83, 790.15, 838.1, 875.85, 864.39, 875.92, 863.46, 888.82, 914.43, 892.64, 882.88, 785.11, 787, 756.7, 777.78, 801.43, 771.75, 776.2, 781.31, 786.47, 786.19, 773.68, 788.61, 791.25, 790.34, 778.74, 800.6, 813.93, 839.49, 846.01, 824.75, 785.57, 754.68, 753.31, 741.58, 750.32, 758.51, 763.3, 764.11, 800.35, 801.78, 791.27, 820.93, 848.12, 956.19, 928.11, 974.26, 937.2, 969.9, 959.16, 963, 1000.37, 1030.24, 1088.62, 1108.76, 1085.03, 1072.08, 1059.44, 1079.79, 1068.04, 1080.95, 1055.85, 1092.19, 1091.3, 1002.02, 1051.21, 1020, 1084.24, 1019.28, 1042.62, 1102.1, 1097.61],
  },
  {
    symbol: "SU.PA",
    ticker: "SU",
    company: "Schneider Electric",
    layer: "infra",
    country: "France",
    flag: "🇫🇷",
    listingCurrency: "EUR",
    value: 357.6,
    dailyChange: 1.18,
    weekChange: 2.38,
    monthChange: 17.93,
    ytdChange: 28.38,
    high52w: 359.01,
    low52w: 244.92,
    realizedVol: 39.69,
    sparkline: [182.76, 180.94, 180.02, 175.94, 164.96, 162.72, 167.24, 164.85, 173.97, 177.03, 178.66, 183.51, 169.92, 180.76, 188.51, 187.78, 193.13, 195.31, 191.37, 186.73, 178.73, 164.49, 167.72, 167.19, 164.63, 156.94, 143.45, 155.76, 167.65, 160.61, 170.94, 158.08, 153.99, 154.21, 144.64, 133.85, 134.39, 132.89, 137.17, 139.74, 131.15, 122.11, 122.81, 116.57, 119.23, 117.86, 128.36, 137.13, 135.41, 139.42, 135.71, 124.34, 120.32, 126.21, 120.78, 112.59, 114.95, 116.22, 118.85, 122.65, 129.8, 128.34, 144.71, 147.43, 148.13, 147.9, 146.12, 139.2, 139.09, 139.36, 149.31, 161.14, 155.4, 161.11, 168.85, 161.16, 166.66, 157.91, 164.17, 161.23, 155.05, 154.18, 167.58, 155.53, 166.28, 167.42, 174.11, 174.87, 172.59, 177.36, 175.88, 178.22, 176.77, 178.4, 173.26, 180.91, 170.9, 182.09, 181.07, 178.01, 176.28, 174.98, 167.82, 169.03, 170.73, 168.08, 167.47, 164.34, 165.81, 164.08, 161.34, 149.74, 151.14, 160.03, 171.53, 180.19, 181.35, 184.95, 188.8, 199.14, 199.17, 201.2, 189.5, 195.93, 193.1, 198.63, 205.2, 211.19, 217.52, 227.12, 226.8, 232.2, 233.99, 236.85, 226.7, 225.03, 224.62, 221.82, 233.21, 232.16, 252.37, 249.04, 257.56, 246.45, 247.14, 237.54, 242.5, 240.19, 246.21, 255.4, 243, 238.24, 219.53, 229.72, 243.48, 252.25, 254.52, 238.83, 251.69, 261.41, 268.64, 259.06, 264.11, 266.46, 262.32, 261.16, 259.89, 255.09, 253.1, 257.21, 266.44, 256.3, 248.5, 251.25, 246.64, 258.01, 266.77, 281.91, 255.1, 246.25, 257.93, 270.28, 243.19, 241.54, 247.51, 251.6, 234.54, 209.28, 221.78, 233.98, 247.74, 243.78, 241.1, 245.29, 244.99, 251.86, 260.75, 255.73, 246.43, 268.92, 261.21, 263.55, 275.46, 277.74, 244.35, 259.22, 257.03, 250.15, 245.37, 254.47, 272.25, 272.49, 274.37, 292.78, 283.67, 287.93, 294.69, 284.8, 266.61, 274.11, 256.41, 267.96, 274.19, 276.35, 276.55, 277.49, 278.54, 274.48, 272.99, 272.53, 289.93, 297.86, 312.02, 308.23, 326.59, 289.45, 285.74, 274.56, 264.38, 273.71, 304.21, 328.33, 322.48, 313.85, 319.8, 307.59, 312.67, 314.57, 312.44, 307.11, 331.44, 313.64, 319.95, 308.3, 300.37, 304.96, 326.36, 350.01, 353.44, 357.6],
  },
  {
    symbol: "SMCI",
    ticker: "SMCI",
    company: "Super Micro",
    layer: "systems",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 38.28,
    dailyChange: -3.92,
    weekChange: 21.68,
    monthChange: 58.31,
    ytdChange: 23.64,
    high52w: 58.68,
    low52w: 20.53,
    realizedVol: 102.22,
    sparkline: [3.8, 3.66, 3.72, 3.73, 3.73, 3.69, 3.54, 3.53, 3.54, 4.66, 4.37, 4.22, 4.04, 4.32, 4.29, 4.09, 4.27, 4.39, 4.41, 4.56, 4.1, 4.01, 3.82, 3.81, 3.92, 4.02, 4.16, 4.16, 4.29, 4.2, 3.79, 3.53, 3.65, 4.24, 4.21, 5.12, 5.24, 4.98, 4.95, 5.48, 4.88, 4.31, 4.27, 3.91, 4.05, 4.22, 5.07, 5.4, 5.91, 6.53, 6.98, 6.98, 6.45, 6.69, 6.23, 5.34, 5.51, 5.89, 5.4, 6.45, 6.87, 7.66, 8.35, 8.65, 9.39, 8.67, 8.4, 8.07, 8.22, 8.21, 8.44, 8.06, 7.2, 7.43, 8.43, 9, 9.2, 9.82, 9.78, 9.28, 9.55, 11.08, 10.65, 10.07, 10.91, 10.73, 10.54, 13.72, 13.45, 16.42, 21.92, 22.19, 26.17, 23.08, 21.61, 24.92, 26, 29.54, 30.32, 33.45, 33.81, 25.44, 24.35, 25.4, 28.22, 28.07, 24.93, 23.58, 27.42, 28.97, 28.52, 24.86, 24.14, 25.5, 26.6, 28.86, 28.57, 26.96, 27.26, 30.01, 28.97, 28.43, 29.21, 33.96, 42.34, 47.42, 57.96, 74.03, 80.33, 86, 90.55, 114, 106.88, 97.27, 101, 94.8, 89.85, 71.36, 85.74, 78.27, 79.85, 88.79, 88.39, 78.45, 76.91, 84.45, 90.53, 81.93, 84.66, 91, 79.68, 71.22, 62.47, 50.88, 62.88, 61.32, 43.77, 38.65, 45.72, 45.73, 41.97, 41.23, 47.8, 47.26, 47.27, 26.05, 24.52, 18.58, 33.15, 32.64, 43.93, 36.45, 31.59, 31.98, 33.33, 32.6, 30.82, 33.27, 28.52, 36.28, 47.91, 56.07, 41.46, 38.24, 42.17, 42.15, 34.26, 29.82, 33.15, 31.51, 36.47, 33.71, 31.99, 46.15, 40.09, 40.02, 41.55, 41.56, 45.32, 47.58, 48.56, 49.24, 51.77, 54.47, 56.64, 44.6, 45.37, 43.88, 41.54, 40.41, 45, 45.81, 45.82, 51.96, 52.86, 52.18, 48.29, 51.96, 39.76, 36.42, 32.19, 33.85, 34.69, 32.33, 31.11, 30.64, 30.96, 30.16, 32.64, 31.7, 29.11, 34.38, 30.54, 32.42, 32.39, 31.31, 30.75, 20.53, 21.97, 23.22, 25.26, 28.56, 29.08, 27.09, 35.37, 31.04, 35.58, 46.09, 41.64, 30.46, 30.66, 30.63, 27.22, 28.31, 24.18, 30.1, 28.4, 31.13, 39.84, 38.28],
  },
  {
    symbol: "DELL",
    ticker: "DELL",
    company: "Dell Technologies",
    layer: "systems",
    country: "United States",
    flag: "🇺🇸",
    listingCurrency: "USD",
    value: 479.67,
    dailyChange: -2.27,
    weekChange: 4.76,
    monthChange: 21.02,
    ytdChange: 275.33,
    high52w: 494.51,
    low52w: 111.07,
    realizedVol: 83.74,
    sparkline: [49.23, 48.27, 50.95, 52.65, 53.61, 53.25, 54.59, 58.05, 55.75, 56.36, 56, 55.02, 56.18, 58.48, 57.6, 54.65, 55.88, 56.17, 57.99, 60.53, 55.57, 56.24, 58.74, 59.51, 58.9, 51.46, 51.96, 52.01, 51.83, 54.79, 48.8, 47.39, 46.94, 46.87, 47.01, 45.58, 45.09, 40.05, 49.58, 51.02, 49.16, 47.59, 50.25, 42.74, 42.92, 43.46, 43.34, 45.06, 45.41, 48.22, 47.67, 41.43, 37.79, 39.79, 37.96, 35.52, 34.17, 34.6, 34.26, 36.85, 39.16, 39, 42.68, 42.04, 44.63, 44.54, 41.83, 39.25, 39.12, 40.22, 42.42, 40.18, 40.26, 40.31, 42.24, 42.72, 42.48, 41.61, 39.79, 36.72, 37.22, 37.38, 40.21, 40.23, 43.28, 43.11, 43.49, 45.39, 44.76, 47.75, 48.51, 47.27, 47.61, 49.67, 50.87, 54.11, 53.53, 55.42, 53.56, 52.61, 53.24, 56.84, 54.93, 56.21, 68.19, 70.5, 69.29, 70.05, 68.9, 66.41, 68.04, 65.91, 65.96, 69.51, 73.5, 73.6, 74.41, 71.93, 68.7, 71.62, 75.71, 76.5, 75.84, 79.31, 83.19, 84.22, 86.32, 86.2, 84.21, 90.35, 124.59, 116.25, 107, 112.24, 114.11, 132.72, 117.76, 114.87, 125.06, 125.1, 132.77, 149.52, 160.18, 139.56, 129.97, 134.98, 145.06, 137.91, 138.96, 139.57, 125.79, 113.56, 102.29, 92.55, 111.3, 112.01, 115.54, 102, 114.3, 117.5, 120.22, 120.42, 127.73, 126.46, 122.55, 130.87, 134.23, 131.64, 144.21, 127.59, 123.4, 118.45, 115.77, 117.33, 119.91, 114.77, 109.64, 113.73, 103.6, 106.37, 114.38, 117.6, 102.76, 91.46, 95.67, 97.57, 92.29, 71.63, 81.93, 84.8, 94.89, 94.59, 95.91, 114.19, 112.11, 111.27, 113.75, 109.56, 119.37, 123.99, 125.22, 126.83, 131.24, 131.22, 127.32, 137.61, 138.28, 130.84, 122.15, 124.83, 125.04, 131.94, 130.76, 140.74, 150.57, 149.59, 158.64, 162.01, 146.7, 133.76, 122.51, 133.35, 138.91, 129.98, 126.42, 129.24, 127.8, 120.62, 120.53, 115.43, 114.44, 121.05, 117.49, 122.27, 148.08, 146.48, 151.62, 157.67, 171.81, 174.37, 177.8, 196.55, 216.09, 210.17, 260.46, 241.99, 295.19, 420.91, 394.39, 395.57, 409.5, 399.49, 394.32, 434.97, 396.34, 437.5, 405.37, 453.77, 490.81, 479.67],
  },
  {
    symbol: "000660.KS",
    ticker: "000660",
    company: "SK hynix",
    layer: "systems",
    country: "South Korea",
    flag: "🇰🇷",
    listingCurrency: "KRW",
    value: 1161.03,
    dailyChange: 3.24,
    weekChange: 16.13,
    monthChange: -17.03,
    ytdChange: 147.58,
    high52w: 1906.19,
    low52w: 175.39,
    realizedVol: 143.77,
    sparkline: [92.47, 89.81, 91.11, 88.53, 84.48, 78.92, 83.24, 83.72, 88.23, 90.23, 90.02, 94.26, 97.04, 100.27, 102.35, 102.85, 107.97, 110.67, 105.33, 108.29, 99.8, 100.13, 103.72, 110.06, 109.71, 101.99, 106.97, 96.04, 102.45, 96.92, 95.51, 91.6, 87.8, 88.93, 88.42, 84.73, 87.16, 89.03, 84.2, 86.23, 81.88, 74.83, 70.47, 67.95, 73.06, 74.99, 76.52, 75.59, 75.65, 71.39, 72.65, 71.27, 67.67, 65.78, 65.21, 59.49, 58.1, 64.75, 66.77, 63.27, 58.71, 59.35, 69.29, 65.84, 64.57, 62.84, 61.9, 59.52, 60.3, 58.85, 65.22, 69.16, 71.09, 74.28, 75.27, 73.94, 71.38, 70.1, 66.59, 62.84, 64.53, 67.87, 68.34, 67.61, 68.62, 67.32, 66.82, 66.43, 65.57, 72.9, 82.05, 84.02, 89.02, 93.62, 87.51, 87.07, 85.39, 93.15, 90.03, 99.7, 92.64, 87.46, 87.52, 87.82, 90.59, 85.23, 92.23, 87.46, 84.73, 89.45, 92.48, 93.05, 88.2, 94.33, 99.22, 100.51, 98.45, 102.26, 97.12, 108.37, 108.85, 109.29, 104.86, 102.21, 105.63, 101.79, 101.51, 107.56, 110.57, 121.61, 117.15, 130.11, 121.94, 127.22, 135.58, 135.27, 137, 125.63, 129.62, 126.92, 131.76, 141.08, 145.22, 137.54, 151.99, 160.87, 168.13, 170.52, 170.98, 169.92, 151.24, 138.84, 126.52, 124.84, 146.46, 138.48, 130.32, 117.35, 121.88, 118.33, 139.95, 130.47, 137.8, 136.71, 146.04, 132.71, 146.13, 127.21, 126.25, 114.76, 119.36, 122.91, 117.22, 118.95, 123.6, 139.84, 147.59, 154.12, 138.17, 140.76, 145.96, 146.33, 131.19, 133.01, 140.72, 147.02, 136.33, 125.6, 124.51, 123.74, 128.95, 129.61, 135.41, 146.38, 144.79, 149.23, 164.94, 174.47, 186.92, 209.94, 199.32, 214.55, 193.31, 193.88, 185.41, 185.2, 200.54, 179.34, 194.31, 196.47, 236.42, 257.85, 238.84, 282.13, 301.09, 328.81, 355.19, 392.55, 400.58, 381.29, 353.64, 362.67, 369.47, 388.21, 371.01, 414.1, 468.95, 513.08, 514.69, 524.17, 636.22, 570.48, 610.73, 655.5, 740.76, 624.53, 618.8, 675.91, 618.55, 580.43, 697.08, 763.23, 825.7, 864.61, 1158.93, 1218.07, 1290.22, 1560.23, 1350.23, 1416.92, 1797.65, 1728.44, 1572.5, 1447.63, 1239.4, 1193.32, 1209.35, 999.79, 1161.03, 1161.03],
  },
  {
    symbol: "005930.KS",
    ticker: "005930",
    company: "Samsung Electronics",
    layer: "systems",
    country: "South Korea",
    flag: "🇰🇷",
    listingCurrency: "KRW",
    value: 193.74,
    dailyChange: 2.4,
    weekChange: 19.29,
    monthChange: 3.13,
    ytdChange: 117.66,
    high52w: 238.54,
    low52w: 48.67,
    realizedVol: 121.2,
    sparkline: [66.2, 64.41, 65.73, 65.8, 61.84, 60.03, 59.3, 59.84, 59.79, 59.2, 59.67, 60.19, 60.75, 64.24, 65.32, 65.76, 67.9, 66.15, 64.94, 65.14, 63.4, 60.91, 61.65, 62.45, 61.99, 59.62, 60.45, 56.98, 58.41, 57.33, 56.9, 55.45, 54.14, 53.92, 52.98, 52.42, 51.52, 53.82, 52.82, 53.83, 50.47, 46.42, 44.93, 43.64, 45.24, 45.59, 46.91, 47.41, 47.23, 46.07, 45.9, 44.96, 42.43, 40.46, 40.18, 38.83, 37.13, 39.9, 39.36, 39.08, 40.33, 41.72, 46.61, 46.02, 46.29, 46.35, 45.87, 45.18, 45.03, 43.4, 46.3, 49.07, 50.16, 52.44, 51.84, 49.74, 48.57, 47.22, 46.15, 44.89, 47.1, 48.98, 49.36, 49.32, 50.02, 49.64, 48.9, 48.76, 48.2, 51.25, 52.82, 54.99, 55.54, 56.53, 55.15, 54.57, 53.39, 57.94, 54.99, 54.99, 52.68, 51.2, 49.51, 50.58, 53.6, 52.7, 54.26, 51.3, 50.53, 49.03, 50.43, 50.73, 49.84, 52.19, 53.6, 56.1, 55.15, 55.53, 55.3, 56.74, 58.76, 60.63, 58.42, 55.72, 55.84, 54.94, 56.59, 55.81, 54.83, 54.93, 55.05, 55.48, 54.69, 59.12, 61.05, 62.53, 61.19, 56.26, 55.92, 56.86, 58, 57.5, 55.5, 53.43, 56.62, 57.94, 57.48, 58.76, 63.1, 61.55, 60.93, 58.56, 58.15, 54.38, 58.82, 58, 55.74, 51.7, 48.21, 47.45, 48.88, 45.41, 43.93, 43.21, 40.62, 42.46, 41.54, 38.19, 40.01, 38.9, 38.64, 39.29, 36.87, 36.61, 36.97, 38, 36.95, 37.45, 36.35, 37.24, 38.92, 40.65, 37.59, 37.12, 37.64, 42.09, 41.18, 38.67, 38.02, 39.1, 38.95, 37.84, 39.04, 40.66, 39.24, 41.01, 43.42, 43.19, 43.28, 44.95, 46.64, 45.61, 48.22, 48.03, 49.51, 51.84, 51.93, 51.01, 50.35, 49.93, 54.26, 58.24, 59.12, 64.02, 66.41, 69.15, 68.81, 75.49, 67.62, 66.18, 64.35, 68.77, 73.62, 74.04, 72.1, 80.88, 89.01, 95.86, 101.37, 103.95, 112.34, 107.84, 125.75, 131.31, 151.15, 127.2, 124.78, 133.84, 119.4, 123.37, 139.82, 146.15, 148.32, 148.25, 184.56, 181.14, 194.43, 212, 214.6, 212.54, 230.23, 219.53, 200.7, 189.25, 171.58, 169.26, 184.78, 162.41, 193.74, 193.74],
  },
  {
    symbol: "2317.TW",
    ticker: "2317",
    company: "Hon Hai (Foxconn)",
    layer: "systems",
    country: "Taiwan",
    flag: "🇹🇼",
    listingCurrency: "TWD",
    value: 8.08,
    dailyChange: -0.71,
    weekChange: 0.06,
    monthChange: 7.3,
    ytdChange: 9,
    high52w: 9.82,
    low52w: 5.85,
    realizedVol: 44.22,
    sparkline: [4.07, 3.91, 3.92, 3.88, 3.7, 3.86, 3.91, 3.86, 3.86, 3.91, 3.92, 3.83, 3.73, 3.79, 3.79, 3.73, 3.76, 3.77, 3.86, 3.75, 3.69, 3.68, 3.68, 3.81, 3.79, 3.67, 3.74, 3.66, 3.76, 3.7, 3.65, 3.58, 3.56, 3.53, 3.46, 3.51, 3.49, 3.61, 3.75, 3.91, 3.85, 3.69, 3.71, 3.57, 3.43, 3.51, 3.55, 3.64, 3.61, 3.76, 3.7, 3.66, 3.52, 3.47, 3.44, 3.38, 3.22, 3.41, 3.3, 3.22, 3.25, 3.13, 3.18, 3.24, 3.25, 3.45, 3.35, 3.26, 3.29, 3.26, 3.21, 3.25, 3.23, 3.23, 3.37, 3.38, 3.42, 3.34, 3.35, 3.31, 3.39, 3.5, 3.43, 3.38, 3.43, 3.4, 3.41, 3.43, 3.34, 3.36, 3.33, 3.53, 3.52, 3.62, 3.65, 3.63, 3.37, 3.54, 3.46, 3.5, 3.51, 3.42, 3.32, 3.39, 3.38, 3.31, 3.33, 3.27, 3.23, 3.28, 3.34, 3.2, 3.03, 2.98, 3.01, 3.22, 3.21, 3.2, 3.23, 3.25, 3.32, 3.4, 3.35, 3.25, 3.18, 3.27, 3.27, 3.24, 3.25, 3.27, 3.23, 3.34, 4.19, 4.56, 4.73, 4.96, 4.67, 4.41, 4.76, 4.82, 5.24, 5.29, 5.46, 5.32, 5.51, 6.13, 6.56, 6.58, 6.6, 6.67, 6.25, 5.88, 5.7, 5.2, 5.67, 5.62, 5.79, 5.51, 5.51, 5.57, 6.07, 6.06, 6.21, 6.47, 6.75, 6.53, 6.81, 6.36, 6.25, 6.02, 6.13, 5.74, 5.55, 5.7, 5.51, 5.53, 5.28, 5.52, 5.52, 5.43, 5.46, 5.6, 5.31, 5.23, 5.16, 5, 4.65, 4.62, 4.1, 4.18, 4.29, 4.59, 4.86, 5.24, 5.13, 5.21, 5.11, 5.3, 5.26, 5.73, 5.57, 5.52, 5.63, 5.94, 5.97, 6.53, 6.88, 6.64, 6.67, 6.68, 7.18, 7.11, 7.18, 7.44, 7.26, 7.4, 7.77, 8.38, 7.88, 7.74, 7.18, 7.2, 7.36, 7.28, 7.03, 7.14, 7.41, 7.31, 7.43, 7.01, 7.03, 6.79, 7.21, 7.21, 7.77, 6.99, 6.73, 6.38, 6.25, 6.03, 6.32, 6.53, 7.03, 6.94, 7.96, 7.87, 7.92, 9.2, 9.03, 8.25, 8.49, 7.8, 7.53, 7.4, 7.25, 7.82, 7.73, 8.07, 8.08, 8.08],
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
    listingCurrency: "USD",
    series: [4535.43, 4458.58, 4432.99, 4455.48, 4357.04, 4391.34, 4471.37, 4544.9, 4605.38, 4697.53, 4682.85, 4697.96, 4594.62, 4538.43, 4712.02, 4620.64, 4725.79, 4766.18, 4677.03, 4662.85, 4397.94, 4431.85, 4500.53, 4418.64, 4348.87, 4384.65, 4328.87, 4204.31, 4463.12, 4543.06, 4545.86, 4488.28, 4392.59, 4271.78, 4131.93, 4123.34, 4023.89, 3901.36, 4158.24, 4108.54, 3900.86, 3674.84, 3911.74, 3825.33, 3899.38, 3863.16, 3961.63, 4130.29, 4145.19, 4280.15, 4228.48, 4057.66, 3924.26, 4067.36, 3873.33, 3693.23, 3585.62, 3639.66, 3583.07, 3752.75, 3901.06, 3770.55, 3992.93, 3965.34, 4026.12, 4071.7, 3934.38, 3852.36, 3844.82, 3839.5, 3895.08, 3999.09, 3972.61, 4070.56, 4136.48, 4090.46, 4079.09, 3970.04, 4045.64, 3861.59, 3916.64, 3970.99, 4109.31, 4105.02, 4137.64, 4133.52, 4169.48, 4136.25, 4124.08, 4191.98, 4205.45, 4282.37, 4298.86, 4409.59, 4348.33, 4450.38, 4398.95, 4505.42, 4536.34, 4582.23, 4478.03, 4464.05, 4369.71, 4405.71, 4515.77, 4457.49, 4450.32, 4320.06, 4288.05, 4308.5, 4327.78, 4224.16, 4117.37, 4358.34, 4415.24, 4514.02, 4559.34, 4594.63, 4604.37, 4719.19, 4754.63, 4769.83, 4697.24, 4783.83, 4839.81, 4890.97, 4958.61, 5026.61, 5005.57, 5088.8, 5137.08, 5123.69, 5117.09, 5234.18, 5254.35, 5204.34, 5123.41, 4967.23, 5099.96, 5127.79, 5222.68, 5303.27, 5304.72, 5277.51, 5346.99, 5431.6, 5464.62, 5460.48, 5567.19, 5615.35, 5505, 5459.1, 5346.56, 5344.16, 5554.25, 5634.61, 5648.4, 5408.42, 5626.02, 5702.55, 5738.17, 5751.07, 5815.03, 5864.67, 5808.12, 5728.8, 5995.54, 5870.62, 5969.34, 6032.38, 6090.27, 6051.09, 5930.85, 5970.84, 5942.47, 5827.04, 5996.66, 6101.24, 6040.53, 6025.99, 6114.63, 6013.13, 5954.5, 5770.2, 5638.94, 5667.56, 5580.94, 5074.08, 5363.36, 5282.7, 5525.21, 5686.67, 5659.91, 5958.38, 5802.82, 5911.69, 6000.36, 5976.97, 5967.84, 6173.07, 6279.35, 6259.75, 6296.79, 6388.64, 6238.01, 6389.45, 6449.8, 6466.91, 6460.26, 6481.5, 6584.29, 6664.36, 6643.7, 6715.79, 6552.51, 6664.01, 6791.69, 6840.2, 6728.8, 6734.11, 6602.99, 6849.09, 6870.4, 6827.41, 6834.5, 6929.94, 6858.47, 6966.28, 6940.01, 6915.61, 6939.03, 6932.3, 6836.17, 6909.51, 6878.88, 6740.02, 6632.19, 6506.48, 6368.85, 6582.69, 6816.89, 7126.06, 7165.08, 7230.12, 7398.93, 7408.5, 7473.47, 7580.06, 7383.74, 7431.46, 7500.58, 7354.02, 7483.24, 7575.39, 7457.69, 7411.98, 7489.72, 7757.64, 7785.76, 7745.07],
  },
  {
    symbol: "^NDX",
    name: "NASDAQ 100",
    region: "USA",
    flag: "🇺🇸",
    listingCurrency: "USD",
    series: [15652.86, 15440.75, 15333.47, 15329.68, 14791.87, 14820.75, 15146.92, 15355.07, 15850.47, 16359.38, 16199.89, 16573.34, 16025.58, 15712.04, 16331.98, 15801.46, 16308.21, 16320.08, 15592.19, 15611.59, 14438.4, 14454.61, 14694.35, 14253.84, 14009.54, 14189.16, 13837.83, 13301.83, 14420.08, 14754.31, 14861.21, 14327.26, 13893.21, 13356.87, 12854.8, 12693.53, 12387.4, 11835.62, 12681.42, 12548.03, 11832.82, 11265.99, 12105.85, 11585.68, 12125.69, 11983.62, 12396.47, 12947.97, 13207.69, 13565.87, 13242.9, 12605.17, 12098.44, 12588.29, 11861.38, 11311.24, 10971.22, 11039.47, 10692.06, 11310.33, 11546.21, 10857.03, 11817.01, 11677.02, 11756.03, 11994.26, 11563.33, 11243.72, 10985.45, 10939.76, 11040.35, 11541.48, 11619.03, 12166.6, 12573.36, 12304.92, 12358.18, 11969.65, 12290.81, 11830.28, 12519.88, 12767.05, 13181.35, 13062.6, 13079.52, 13000.77, 13245.99, 13259.13, 13340.18, 13803.49, 14298.41, 14546.64, 14528.36, 15083.92, 14891.48, 15179.21, 15036.85, 15565.6, 15425.67, 15750.93, 15274.92, 15028.07, 14694.84, 14941.83, 15490.86, 15280.23, 15202.4, 14701.1, 14715.24, 14973.24, 14995.12, 14560.88, 14180.42, 15099.49, 15529.12, 15837.99, 15982.01, 15997.58, 16084.69, 16623.45, 16777.4, 16825.93, 16305.98, 16832.92, 17314, 17421.01, 17642.73, 17962.41, 17685.98, 17937.61, 18302.91, 18018.45, 17808.25, 18339.44, 18254.69, 18108.46, 18003.49, 17037.65, 17718.3, 17890.8, 18161.18, 18546.23, 18808.35, 18536.65, 19000.95, 19659.8, 19700.43, 19682.87, 20391.97, 20331.49, 19522.62, 19023.66, 18440.85, 18513.1, 19508.52, 19720.87, 19574.64, 18421.31, 19514.59, 19791.49, 20008.62, 20035.02, 20271.97, 20324.04, 20352.02, 20033.14, 21117.18, 20394.13, 20776.23, 20930.37, 21622.25, 21780.25, 21289.15, 21473.02, 21326.16, 20847.58, 21441.16, 21774.01, 21478.05, 21491.31, 22114.69, 21614.08, 20884.41, 20201.37, 19704.64, 19753.97, 19281.4, 17397.7, 18690.05, 18258.09, 19432.56, 20102.61, 20061.45, 21427.94, 20915.66, 21340.99, 21761.79, 21631.04, 21626.39, 22534.2, 22866.97, 22780.6, 23065.47, 23272.25, 22763.31, 23611.27, 23712.07, 23498.12, 23415.42, 23652.44, 24092.19, 24626.25, 24503.85, 24785.52, 24221.74, 24817.95, 25358.16, 25858.13, 25059.81, 25008.24, 24239.57, 25434.89, 25692.05, 25196.73, 25346.18, 25644.39, 25206.17, 25766.26, 25529.26, 25605.47, 25552.39, 25075.77, 24732.73, 25012.62, 24960.04, 24643.02, 24380.73, 23898.15, 23132.77, 24045.53, 25116.34, 26672.43, 27303.67, 27710.36, 29234.99, 29125.2, 29481.64, 30333.18, 28957.6, 29635.95, 30406.19, 29118.24, 29329.21, 29825.11, 28592.66, 28128.34, 28274.2, 29722.3, 30046.14, 29995.38],
  },
  {
    symbol: "000001.SS",
    name: "Shanghai Composite",
    region: "China",
    flag: "🇨🇳",
    listingCurrency: "CNY",
    series: [554.84, 573.74, 559.73, 559.48, 551.53, 557.34, 554.8, 560.5, 555.1, 545.86, 553.89, 557.61, 558.11, 565.82, 574.98, 570.48, 568.09, 571.21, 560.89, 553.82, 555.65, 527.96, 527.96, 545.12, 550.96, 545.52, 545.58, 523.63, 512.34, 504.57, 517.87, 511.32, 503.54, 478.64, 459.91, 451.05, 454.51, 468.79, 464.58, 477.99, 490.95, 494.79, 500.16, 505.75, 500.87, 477.86, 483.32, 482.26, 478.23, 485.93, 480.22, 472.56, 461.44, 468.92, 447.08, 436.42, 424.54, 424.54, 428.48, 421.15, 403.43, 420.61, 429.63, 432.81, 433.78, 448.08, 460.35, 454.36, 436.18, 443.66, 458.86, 474.24, 481.83, 481.83, 484.8, 480.95, 469.99, 473.02, 481.41, 463.85, 471.26, 478.95, 476.37, 484.03, 486.06, 480.39, 480.08, 482.86, 471, 466.74, 453.91, 455.39, 454.41, 459.74, 445.34, 441.55, 440.96, 452.83, 441.41, 456.7, 459.05, 442.05, 430.19, 421.09, 431.76, 425.33, 428.5, 428.72, 425.62, 425.62, 422.94, 408.01, 412.55, 414.38, 417.31, 421.82, 429.16, 428.48, 415.39, 416.38, 408.32, 418.59, 411.98, 405.74, 398.07, 410.98, 385.15, 403.59, 403.59, 417.73, 421.17, 423.51, 424.72, 423.44, 420.84, 424.38, 417.29, 423.57, 426.69, 428.98, 437, 437.03, 426.55, 426.74, 421.21, 418.2, 413.02, 408.33, 406, 409.56, 410.85, 399.84, 401.13, 398.98, 401.4, 399.53, 400.57, 390.03, 379.97, 387.27, 440.51, 475.94, 454.48, 457.89, 463.53, 459.65, 483.43, 460.73, 451.66, 459.27, 468.93, 466.71, 461.67, 465.95, 440.01, 432.14, 442.21, 446.41, 448.79, 453.31, 459.16, 465.73, 455.84, 465.14, 472.5, 464.26, 461.4, 459.86, 442.74, 448.14, 452.25, 451.1, 462.55, 467.28, 464.81, 464.69, 471.83, 469.5, 467.43, 477.74, 484.63, 489.24, 492.05, 502.36, 494.42, 506.21, 514.91, 532.84, 539.34, 533.86, 543.75, 537.06, 536.62, 545.38, 546.76, 539.06, 554.38, 556.24, 561.56, 561.09, 539.56, 549.56, 551.91, 551.06, 552.58, 563.98, 567.29, 590.02, 588.85, 593.2, 592.68, 586, 591.6, 591.6, 608.53, 597.97, 596.23, 573.5, 566.33, 563.55, 583.52, 593.95, 597.7, 601.41, 614.57, 609.48, 604.62, 600.13, 594.63, 595.01, 605.35, 593.12, 595.65, 588.35, 555.8, 563.19, 567.32, 583.81, 582.43, 582.43],
  },
  {
    symbol: "^HSI",
    name: "Hang Seng",
    region: "Hong Kong",
    flag: "🇭🇰",
    listingCurrency: "HKD",
    series: [3333.07, 3369.56, 3202.02, 3107.55, 3156.84, 3190.53, 3256.18, 3360.33, 3262.69, 3195.49, 3250.63, 3216.11, 3088.71, 3050.26, 3077.66, 2972.18, 2977.98, 3000.64, 3011.73, 3130.93, 3206.46, 3023.35, 3153.23, 3194.57, 3119.3, 2916.07, 2802.76, 2627.43, 2738.76, 2736.01, 2813.51, 2791.05, 2745.09, 2630.92, 2687.68, 2548.28, 2534.93, 2639.85, 2636.88, 2686.5, 2778.28, 2684.99, 2766.97, 2786.11, 2768.5, 2585.81, 2625.84, 2567.87, 2573.66, 2572.5, 2520.94, 2570.64, 2478.6, 2466.84, 2390.33, 2284.81, 2194.1, 2259.91, 2113.19, 2065.49, 1893.55, 2058.81, 2208.38, 2298.93, 2250.6, 2400.58, 2556.69, 2501.45, 2513.45, 2537.9, 2687.27, 2784.06, 2815.48, 2898.4, 2761.27, 2699.52, 2639.81, 2550.08, 2620.27, 2461.27, 2486.69, 2537.22, 2598.88, 2590.03, 2603.77, 2557.81, 2534.37, 2555, 2504.5, 2484.97, 2394.27, 2419.71, 2474.22, 2561.87, 2412.48, 2413.18, 2348.43, 2482.14, 2441.26, 2552.44, 2502.43, 2439.41, 2292.66, 2310.76, 2342.9, 2320.92, 2322.45, 2308.84, 2274.73, 2232.89, 2276.83, 2194.89, 2224.79, 2257.53, 2203.03, 2237.04, 2251.7, 2154.9, 2091.07, 2150.94, 2092.36, 2182.26, 2117.44, 2077.9, 1957.31, 2040.34, 1986.36, 2013.29, 2089.5, 2138.17, 2119.14, 2091.12, 2137.66, 2109.69, 2114.32, 2136.1, 2133.47, 2071.65, 2254.96, 2364.5, 2426.85, 2506.46, 2383.16, 2312.8, 2351.93, 2297.18, 2309.92, 2269, 2279.34, 2343.06, 2230.18, 2180.35, 2168.55, 2192.79, 2235.52, 2258.89, 2307.22, 2237.68, 2226.09, 2342.66, 2652.18, 2927.98, 2734.22, 2676.25, 2649.9, 2637.9, 2667.38, 2496.5, 2470.83, 2495.45, 2552.93, 2568.62, 2538.06, 2586.24, 2540.93, 2449.76, 2514.74, 2576.15, 2596.88, 2714.13, 2904.51, 3019.43, 2949.97, 3117.61, 3083.01, 3047.85, 3012.6, 2935.56, 2696.05, 2756.48, 2833.19, 2901.17, 2941.2, 2990.88, 3014.91, 2970.22, 3032.36, 3044.05, 2997.7, 3093.85, 3047.52, 3075.26, 3163.11, 3234.23, 3122.05, 3167, 3225.44, 3242.83, 3217.5, 3258.62, 3388.05, 3413.23, 3357.22, 3487.44, 3378.22, 3248.97, 3366.03, 3334.56, 3374.89, 3419.44, 3240.19, 3324.32, 3352.08, 3338.06, 3301.7, 3319.95, 3383.09, 3366.5, 3442.81, 3430.86, 3508.68, 3399.15, 3398.85, 3379.87, 3404.01, 3294.1, 3253.43, 3226.78, 3188.45, 3204.82, 3305.61, 3344.22, 3316.77, 3289.12, 3369.22, 3314.85, 3268.61, 3214.79, 3186.24, 3154.59, 3053.6, 2891.98, 2977.25, 3085.21, 3132.74, 3183.64, 3300.41, 3272.19, 3200.74, 3200.74],
  },
  {
    symbol: "^N225",
    name: "Nikkei 225",
    region: "Japan",
    flag: "🇯🇵",
    listingCurrency: "JPY",
    series: [264.93, 276.75, 278.03, 274.18, 258.13, 251.2, 255.36, 253.01, 254.3, 260.12, 259.64, 260.28, 249.86, 248, 250.67, 251.14, 251.47, 250.48, 245.79, 246.45, 241.44, 231.62, 238.7, 239.58, 236.12, 229.09, 225.03, 216.59, 226.42, 230.08, 227.22, 217.46, 214.72, 211.09, 209.11, 207.19, 205.52, 209.17, 210.8, 213.69, 207, 196.06, 196.47, 191, 195.1, 192.77, 203.61, 206.86, 212.45, 214.65, 213.04, 209.73, 197.39, 196.13, 192.29, 188.16, 179.58, 186.96, 183.92, 179.06, 185.3, 183.3, 199.41, 198.7, 204.06, 205.53, 204.23, 199.83, 198.22, 196.32, 194.84, 202.21, 206.85, 210.96, 213.67, 210.4, 205.21, 203.92, 204.29, 206.34, 204.95, 209.26, 210.52, 209, 215.07, 213.17, 215.67, 212.03, 218.5, 222.25, 220.8, 227.2, 232.35, 240.3, 229.19, 229.24, 225, 234.59, 230.97, 235.91, 225.76, 225.94, 215.84, 216.51, 224.86, 221.32, 227.37, 219.46, 213.33, 208.77, 215.74, 208.67, 206.11, 212.19, 215.19, 222.85, 224.72, 225.89, 223.93, 231.73, 233.47, 236.61, 230.56, 245.28, 242.79, 242.01, 246.89, 247.2, 256.67, 260.04, 265.9, 268.41, 261.02, 269.65, 266.57, 257.73, 258, 239.75, 243.8, 245.57, 246.02, 249.63, 246.2, 245.22, 248.46, 247.03, 242.85, 246.34, 253.55, 260.37, 254.94, 245.08, 240.68, 237.19, 255.07, 262.41, 266.74, 253.79, 258.53, 264.07, 274.54, 263.11, 266.34, 259.71, 249.79, 250.39, 257.87, 246.97, 248.25, 252.74, 260.25, 258.67, 245.5, 255.35, 252.7, 247.97, 247.51, 255.72, 256.8, 256.54, 255.9, 259.54, 247.68, 249.06, 250.45, 253.55, 246.08, 231.01, 233.64, 244.7, 249.9, 253.22, 256.85, 259.27, 258.31, 264.05, 262.93, 264.22, 264.45, 277.49, 275.16, 270.49, 268.25, 282.01, 270.6, 284.81, 293.71, 287.31, 291.02, 289.93, 304.08, 304.47, 302.65, 311.04, 314.38, 316.96, 323.06, 340.55, 328.72, 325.78, 308.99, 321.56, 325.46, 326.78, 318.2, 325.14, 322.66, 331.08, 340.09, 339.73, 348.15, 346.04, 372.61, 366.24, 377.59, 353.07, 338.05, 334.01, 334.2, 333.08, 357.76, 367.32, 373.82, 379.12, 399.89, 387.73, 398.31, 416.46, 416.2, 412.29, 441.75, 428.67, 431.99, 422.25, 395.02, 394.37, 401.8, 414.16, 431.01, 431.01],
  },
  {
    symbol: "^NSEI",
    name: "NIFTY 50",
    region: "India",
    flag: "🇮🇳",
    listingCurrency: "INR",
    series: [237.13, 235.39, 239.04, 241.78, 236.11, 239.14, 243.52, 241.97, 236.26, 240.7, 243.57, 239.22, 228.53, 229.34, 231.63, 223, 226.51, 233.16, 239.36, 246.79, 236.62, 227.39, 234.66, 230.01, 230.16, 220.91, 214.06, 217.93, 227.39, 224.74, 232.78, 234.27, 229.49, 225.1, 223.3, 214.41, 203.79, 210.1, 210.65, 214.38, 208.2, 196.13, 200.91, 199.49, 204.75, 200.92, 209.58, 215.63, 219.79, 222.3, 222.63, 219.81, 220.02, 223.74, 219.55, 213.75, 209.8, 210.26, 209.09, 212.21, 215.75, 219.12, 227.99, 224.57, 226.72, 230.35, 224.8, 220.49, 214.86, 218.57, 216.1, 221.37, 221.91, 216.15, 217.61, 216.36, 216.99, 211.4, 213.64, 212.3, 206.97, 205.98, 211.45, 214.75, 217.52, 214.56, 220.94, 221.12, 223.08, 220.05, 223.58, 225.27, 225.04, 229.83, 227.85, 233.8, 233.56, 238.5, 240.55, 238.5, 235.76, 234.64, 232.38, 233.13, 235.06, 238.1, 243.2, 237.35, 236.06, 236.15, 237.21, 235.11, 228.71, 231.01, 233.14, 237.39, 237.51, 243.16, 251.57, 257.59, 256.81, 264.04, 260.82, 263.55, 260.01, 256.96, 263.53, 262.49, 265.52, 268.04, 269.43, 271.6, 265.45, 265.5, 267.82, 269.7, 270.18, 265.09, 269.14, 269.47, 264.26, 269.15, 275.64, 270.41, 279.01, 280.95, 281.11, 287.72, 291.33, 293.37, 293.17, 296.58, 295.16, 290.13, 292.34, 295.72, 300.8, 295.92, 302.1, 308.45, 313.08, 297.76, 297.38, 295.69, 287.59, 289.02, 286.43, 278.75, 282.97, 285.67, 291.41, 291.94, 276.59, 279.3, 279.76, 272.71, 267.92, 267.15, 271.31, 268.99, 264.3, 263.69, 253.35, 258.84, 256.44, 270.46, 274.45, 268.57, 264.65, 278.57, 281.96, 287.46, 278.9, 292.82, 289.07, 289.95, 291.15, 288.47, 290.04, 299.27, 298.42, 293.34, 290.17, 287.36, 280.78, 278.65, 281.66, 284.9, 278.87, 280.53, 284.52, 287.13, 277.73, 280.59, 284.54, 292.19, 293.86, 290.2, 287.49, 291.73, 293.92, 293.21, 291.49, 288.6, 287.7, 289.02, 292.66, 285.67, 284.35, 273.58, 275.88, 284.49, 281.25, 280.88, 276.67, 266.38, 250.58, 248.32, 241.97, 245.17, 260.09, 261.73, 253.93, 252.83, 256.5, 247.03, 246.63, 245.17, 243.94, 246.69, 254.54, 254.72, 254.07, 253.77, 251.77, 245.34, 254.83, 257.79, 255.41, 255.41],
  },
  {
    symbol: "^GDAXI",
    name: "DAX",
    region: "Germany",
    flag: "🇩🇪",
    listingCurrency: "EUR",
    series: [18742.52, 18460.04, 18228.02, 18234.68, 17542.79, 17577.92, 18068.11, 18069.24, 18330.14, 18551.38, 18429.03, 18371.32, 17102.58, 17151.49, 17643.89, 17603.84, 17850.13, 18045.44, 18015.97, 18197.61, 17653.84, 17076.08, 17267.49, 17608.59, 17098.04, 16301.74, 14491.52, 15009.92, 15997.84, 15750.04, 15995.66, 15518.98, 15433.74, 15323.2, 14808.7, 14412.35, 14560.4, 14791.45, 15522.2, 15546.14, 14613.97, 13844.08, 13800.42, 13425.08, 13236.28, 12897.74, 13546.69, 13743.39, 13910.28, 14232.8, 13666.29, 12934.22, 12988.06, 13103.94, 12726.37, 12089.55, 11907.88, 12014.1, 12128.53, 12449.42, 13200.69, 13122.86, 14498.3, 14953.9, 15134.82, 15297.15, 15174.99, 14783.01, 14782.03, 14843.6, 15372.98, 16384.32, 16287.18, 16505.1, 16877.24, 16444.28, 16512.72, 16119.36, 16512.68, 16330.04, 15675.17, 16206.25, 17042.7, 17006.91, 17474.57, 17423.65, 17565.65, 17593.72, 17365.39, 17537.37, 17141.91, 17272.39, 17198.26, 17904.98, 17347.88, 17549.59, 16993.1, 18075.48, 18016.73, 18081.74, 17469.81, 17386.33, 16936.46, 16881.02, 17177.43, 16838.69, 16906.21, 16586.48, 16252, 16062.28, 16001.79, 15666.39, 15516.46, 16129.61, 16251.4, 17278.27, 17482.27, 17860.28, 18086.79, 18415.87, 18387.13, 18541.04, 18166.33, 18344.36, 18010.56, 18398.1, 18397.96, 18242.12, 18442.14, 18857.6, 19162.69, 19507.15, 19521.19, 19775.95, 19996.64, 19696.39, 19233.59, 18879.97, 19486.06, 19321.24, 20246.82, 20327.58, 20212.55, 20043.28, 20217.09, 19332.07, 19446.61, 19527.38, 19973.24, 20384.44, 19810.24, 19985.41, 19052.22, 19345.8, 20104.68, 20714.72, 20949.73, 20335.45, 20714.97, 20895.2, 21766.03, 21101.05, 21183.08, 21288.03, 21067.68, 20961.21, 20743.44, 20229.15, 20229.48, 20731.44, 21578.32, 21373.27, 20610.44, 20830.02, 20439.97, 20816.38, 21534.57, 22284.99, 22595.42, 22627.38, 23552.81, 23403.19, 23442.48, 24821.93, 24953.67, 24852.82, 24260.69, 22796.19, 22936.83, 24167.87, 25293.91, 26079.83, 26376.17, 26602.16, 26658.52, 27305.24, 27837.93, 27279.43, 26882.97, 28100.16, 28001.38, 28385.38, 28213.43, 28470.41, 26761.22, 28214.13, 28381.86, 28292.99, 27921.51, 27506.8, 27809.18, 27873.38, 27686.77, 28584.43, 28038.75, 27881.31, 28162.02, 27725.66, 27221.45, 27773.12, 26635.45, 27650.32, 27975.48, 28393.56, 28479.77, 28638.4, 28834.87, 29449.68, 29367.46, 29269.82, 29362.48, 29116.61, 29570.1, 29729.65, 29843.09, 27384.62, 27015.18, 25910.79, 25724.12, 26853.13, 27829.81, 29105.98, 28192.01, 28384.92, 28553.06, 27931.35, 28923.37, 29254.1, 28751.82, 28517.7, 28630.15, 28030.7, 29446.92, 28660.22, 28418.21, 28554.69, 29533.92, 30332.43, 30499.84, 30505.69],
  },
  {
    symbol: "^FTSE",
    name: "FTSE 100",
    region: "UK",
    flag: "🇬🇧",
    listingCurrency: "GBP",
    series: [9877.27, 9728.19, 9607.68, 9676.42, 9465.38, 9664.4, 9888.05, 9936.01, 9988.41, 9866.68, 9821.56, 9751.61, 9378.5, 9472.65, 9642.69, 9686.23, 9883.5, 9967.87, 10130.33, 10344.21, 10190.23, 9995.85, 10221.11, 10382.03, 10232.61, 10015.91, 9328.45, 9376.16, 9744.89, 9874.9, 9910.07, 10023.66, 9992.91, 9797.96, 9403.48, 9134.51, 9054.76, 9209.53, 9570.88, 9498.29, 9141.73, 8668.52, 8838.54, 8717.76, 8655.63, 8476, 8728.89, 9036.84, 9045.56, 9148.22, 9009.7, 8782.04, 8409.02, 8469.64, 8287.94, 7905.88, 7699.99, 7803.52, 7753.12, 7821.02, 8151.4, 8193.84, 8558.86, 8759.31, 9068.96, 9263.34, 9148.37, 8937.23, 8997.44, 8984.01, 9171.86, 9583.74, 9630.31, 9640.7, 9658.37, 9551.07, 9585.53, 9468.45, 9498.03, 9238.03, 8883.53, 9095.1, 9453.6, 9648.42, 9859.79, 9845.86, 9836.28, 9787.84, 9699.55, 9628.13, 9395.42, 9528.9, 9498, 9771.77, 9511.78, 9500.71, 9247.29, 9760.54, 9864.97, 9843.92, 9619.15, 9533.23, 9259.72, 9241.41, 9459.63, 9329.09, 9563.58, 9446.76, 9285.53, 9134.19, 9258.77, 8984.11, 8849.52, 9043.55, 8992.46, 9316.56, 9385.36, 9510.9, 9510.77, 9676.12, 9764.27, 9847.45, 9753.55, 9742.91, 9483.98, 9702.88, 9707.71, 9557.02, 9716.14, 9759.01, 9699.51, 9816.35, 9849.22, 10042.04, 10033.56, 9999.91, 10038.29, 9820.65, 10182.13, 10300.22, 10563.91, 10670.21, 10558.41, 10534.93, 10548.58, 10391.45, 10429.32, 10324.11, 10464.69, 10665.83, 10563.01, 10652.74, 10405.54, 10412.25, 10687.98, 10907.54, 11028.81, 10781.16, 10864.5, 10930.92, 11161.37, 10872.64, 10781.12, 10878.95, 10701.47, 10546.73, 10479.83, 10214.85, 10397.68, 10522.22, 10601.22, 10522.56, 10104.11, 10211.5, 10181.49, 10145.13, 10407.73, 10503.79, 10776.49, 10821.25, 10971.03, 10971.81, 11099.25, 11184.32, 11186.08, 11213.15, 11215.03, 10542.92, 10347.15, 10952.05, 11214.42, 11421.51, 11322.61, 11556.51, 11698.87, 11841.86, 12001.49, 12061.32, 11825.42, 12076.28, 12059.4, 12141.63, 12078.69, 12321.56, 11979.5, 12235.11, 12365.57, 12508.76, 12413.09, 12379.94, 12603.59, 12494.17, 12382.71, 12762.61, 12543.24, 12577.78, 12855.14, 12787.1, 12723.86, 12755.51, 12482.6, 12871.08, 12878.17, 12920.46, 13248.06, 13338.87, 13407.75, 13605.44, 13696.19, 13694.9, 14115.01, 14020.82, 14228.28, 14385.77, 14719.98, 13737.79, 13701.28, 13316.01, 13292.17, 13883.04, 14236.5, 14429.13, 13976.89, 14097.67, 13871.63, 13653.03, 14058.91, 13994.76, 13921.25, 14046.55, 13681.65, 13857.86, 14244.4, 14082.77, 14288.18, 14292.83, 14629.49, 14667.79, 14502.66, 14520.05],
  },
  {
    symbol: "^FCHI",
    name: "CAC 40",
    region: "France",
    flag: "🇫🇷",
    listingCurrency: "EUR",
    series: [7945.36, 7880.52, 7731.45, 7793.72, 7543.88, 7583.19, 7798.22, 7828.14, 7980.3, 8135.88, 8120.23, 8085.55, 7554.99, 7649.24, 7895.92, 7850.74, 8027.21, 8100.83, 8155.76, 8183.82, 7997.23, 7764.89, 7949.43, 8004.11, 7876.55, 7556.44, 6708.35, 6895, 7348.15, 7215.33, 7401.11, 7114.54, 7180.13, 7131.08, 6863.2, 6596.15, 6604.2, 6649.15, 6993.32, 6972.39, 6570.35, 6204.35, 6389.23, 6214.37, 6135.59, 6051.49, 6354.26, 6572.52, 6632.73, 6761.44, 6554.23, 6256.24, 6138.11, 6219.79, 6070.2, 5691.77, 5664.12, 5743.17, 5784.42, 5901.95, 6252.85, 6255.79, 6721.39, 6884.81, 6986.42, 7098.52, 7051.36, 6865.96, 6897.36, 6901.52, 7219.24, 7627.69, 7579.37, 7732.01, 7888.7, 7658.96, 7836.9, 7617.1, 7788.81, 7642.86, 7350.71, 7600.9, 7984.81, 7986.43, 8312.64, 8312.67, 8264.66, 8193.27, 8091.19, 8072.88, 7849.41, 7823.84, 7777.73, 8087.58, 7850.32, 8042.41, 7745.29, 8276.79, 8277.95, 8208.23, 8011.16, 8060.74, 7790.72, 7807.34, 7912.69, 7746.04, 7848.97, 7660.13, 7536.37, 7446.08, 7379.44, 7215.99, 7178.95, 7483.81, 7515.35, 7851.51, 7953.76, 8001.47, 8122.76, 8351.74, 8330.38, 8348.94, 8123.72, 8197.95, 8019.71, 8280.79, 8256.32, 8241.93, 8369.35, 8624.47, 8572.85, 8790.79, 8885.59, 8854.91, 8873.26, 8736.09, 8593.1, 8539.2, 8678.37, 8540.91, 8864.47, 8876.27, 8752.83, 8660.6, 8717.51, 8057.64, 8167.46, 8009.29, 8297.88, 8398.46, 8213.8, 8157.65, 7822.95, 7935.41, 8174.36, 8423.52, 8455.44, 8169.22, 8269.91, 8371.76, 8709.02, 8322.33, 8285.56, 8244.58, 8115.45, 8065.65, 7922.22, 7654.98, 7595.52, 7642.45, 7861.79, 7760.82, 7539.96, 7666.64, 7477.53, 7652.19, 7942.55, 8257.42, 8266.01, 8280.57, 8556.12, 8562.69, 8432.13, 8760.68, 8715.21, 8731.99, 8550.16, 8034.27, 7998.47, 8303.54, 8570.16, 8777.92, 8691.76, 8827.33, 8725.83, 8820.39, 8939.57, 8914.42, 8737.81, 8993.12, 9059.66, 9162.42, 9086.41, 9210.44, 8620.54, 9041.23, 9231.89, 9255.24, 8999.36, 8946.42, 9182.72, 9260.22, 9179.39, 9475.7, 9158.31, 9563.49, 9556.57, 9398.08, 9181.83, 9503.42, 9207.63, 9422.22, 9447.83, 9472.1, 9558.04, 9558.59, 9629.75, 9748.41, 9587.81, 9571.84, 9723.99, 9744.82, 9864.75, 10022, 10127.89, 9278.9, 9115.4, 8874.92, 8884.27, 9228.87, 9656.51, 9927.1, 9531.5, 9481.95, 9517.33, 9274.33, 9431.44, 9535.91, 9543.55, 9666.92, 9649.41, 9526.64, 9718.51, 9534.28, 9543.48, 9525, 9806.11, 10043.71, 9962.86, 9936.99],
  },
  {
    symbol: "^GSPTSE",
    name: "S&P/TSX Composite",
    region: "Canada",
    flag: "🇨🇦",
    listingCurrency: "CAD",
    series: [16588.38, 16294.52, 16157.71, 16113.33, 15886.87, 16271.86, 16912.14, 17150.92, 17039.47, 17232.19, 17292.37, 17102.39, 16682.25, 16097.51, 16438.42, 16228.24, 16554.79, 16652.65, 16562.58, 17075.42, 16496.72, 16273.57, 16777.93, 16924.91, 16535.64, 16476.83, 16891.79, 16825, 17272.95, 17576.04, 17564.51, 17378.98, 17392.45, 16829.16, 16214.49, 16085.84, 15433.96, 15755.25, 16244.11, 16540.2, 15961.02, 14613.86, 14678.34, 14640.19, 14671.37, 14033.03, 14740.57, 15376.67, 15244.6, 15811.3, 15533.52, 15360.89, 14660.25, 15116.28, 14634.18, 13719, 13488.02, 13523.83, 13318.51, 13689.91, 14354.53, 14153.13, 15085.7, 14999.1, 15284.11, 15247.44, 14669.47, 14235.62, 14304.45, 14304.09, 14612.57, 15221.37, 15228.39, 15555.98, 15588.29, 15326.46, 15226.9, 14929.41, 15139.32, 14297.52, 14131.9, 14217.03, 14864.7, 15011.33, 15427.21, 15350.13, 15174.23, 15190.42, 15133.48, 15077.46, 14600.9, 14895.93, 14887.07, 15107.81, 14771.3, 15211.55, 14837.57, 15452.51, 15596.77, 15513.27, 15157.37, 15178.8, 14631.31, 14599.32, 15207.89, 14670.73, 15259.05, 14676.31, 14484.69, 14042.41, 14223.32, 13937.43, 13564.07, 14421.26, 14235.17, 14671.07, 14679.15, 15087.15, 14951.17, 15312.3, 15719.18, 15842.05, 15677.72, 15687.86, 15502.14, 15674.26, 15755.14, 15608.92, 15785.46, 15883.51, 15878.06, 16159.31, 16139.52, 16252.01, 16316.06, 16437.96, 16000.7, 15837.7, 16085.22, 16059.62, 16310.3, 16500.96, 16254.54, 16274.66, 16100.88, 15747.84, 15751.1, 15968.55, 16201.74, 16641.83, 16559.92, 16509.38, 16013.43, 16243.65, 16787, 17117.85, 17307.46, 16874.99, 17360.82, 17597.82, 17777.78, 17834.69, 17802.8, 17992.93, 17659.11, 17405.71, 17854.52, 17701.31, 18200.5, 18310.58, 18323.15, 17777.27, 17079.31, 17207.29, 17408.53, 17197.88, 17413.34, 17713.03, 17617.54, 17784.65, 17955.91, 17739.14, 17581.26, 17324.63, 17020.48, 17432.82, 17305.05, 16471.49, 16907.61, 17455.5, 17831.22, 18077.85, 18210.85, 18611.58, 18675.13, 18959.63, 19338.32, 19493.55, 19347.67, 19564.69, 19929.93, 19788.16, 19885.12, 20156.3, 19499.46, 20213.87, 20202.2, 20382.94, 20774.48, 21028.3, 21168.45, 21584.13, 21348.04, 21826.46, 21293.48, 21435.64, 21701.56, 21644, 21196.59, 21607, 21403.93, 22374.73, 22429.85, 22886.24, 23049.87, 23382.27, 23245.41, 23523.27, 23790.07, 24045.82, 23661.06, 23680.37, 24299.78, 24708.11, 25110.05, 24201.86, 23870.65, 22799.84, 23073.15, 23859.36, 24377.15, 25069.56, 24750.41, 24957.44, 24945.87, 24653.26, 25022.97, 25226.26, 24747.23, 25004.94, 24729.26, 24632.76, 24839.01, 24928.9, 25122.1, 25111.36, 25141.39, 25961.17, 26373.26, 26430],
  },
  {
    symbol: "^KS11",
    name: "KOSPI",
    region: "South Korea",
    flag: "🇰🇷",
    listingCurrency: "KRW",
    series: [2.77, 2.67, 2.67, 2.66, 2.55, 2.48, 2.55, 2.56, 2.54, 2.5, 2.51, 2.51, 2.47, 2.52, 2.56, 2.54, 2.54, 2.52, 2.45, 2.46, 2.38, 2.21, 2.29, 2.29, 2.29, 2.22, 2.25, 2.17, 2.24, 2.24, 2.26, 2.21, 2.19, 2.18, 2.12, 2.08, 2.02, 2.09, 2.1, 2.15, 2.05, 1.89, 1.82, 1.79, 1.81, 1.77, 1.83, 1.89, 1.91, 1.93, 1.88, 1.86, 1.78, 1.73, 1.7, 1.63, 1.51, 1.59, 1.55, 1.55, 1.6, 1.65, 1.84, 1.82, 1.85, 1.87, 1.81, 1.79, 1.79, 1.75, 1.8, 1.93, 1.94, 2.02, 2.02, 1.95, 1.9, 1.87, 1.86, 1.81, 1.84, 1.88, 1.91, 1.89, 1.98, 1.92, 1.87, 1.87, 1.86, 1.9, 1.92, 1.98, 2.04, 2.07, 1.98, 1.94, 1.93, 2.07, 2.04, 2.03, 2.01, 1.97, 1.87, 1.9, 1.94, 1.91, 1.96, 1.87, 1.82, 1.79, 1.82, 1.75, 1.71, 1.78, 1.83, 1.91, 1.92, 1.93, 1.92, 1.98, 2.01, 2.05, 1.97, 1.92, 1.85, 1.86, 1.97, 1.97, 2, 2.01, 1.98, 2.03, 2.02, 2.06, 2.03, 2.01, 1.96, 1.88, 1.94, 1.96, 2, 2.02, 1.97, 1.92, 1.99, 2.01, 2, 2.02, 2.07, 2.08, 2.02, 1.98, 1.95, 1.88, 1.98, 2.02, 2.01, 1.91, 1.93, 1.95, 2.02, 1.93, 1.92, 1.89, 1.88, 1.85, 1.87, 1.73, 1.79, 1.76, 1.73, 1.75, 1.67, 1.64, 1.66, 1.73, 1.74, 1.77, 1.75, 1.75, 1.8, 1.85, 1.75, 1.77, 1.77, 1.8, 1.75, 1.7, 1.68, 1.76, 1.78, 1.78, 1.84, 1.88, 1.88, 1.97, 2.07, 2.14, 2.2, 2.26, 2.25, 2.31, 2.29, 2.33, 2.24, 2.32, 2.34, 2.26, 2.3, 2.3, 2.44, 2.48, 2.4, 2.53, 2.54, 2.65, 2.75, 2.88, 2.73, 2.73, 2.62, 2.69, 2.78, 2.83, 2.73, 2.85, 2.99, 3.16, 3.3, 3.41, 3.66, 3.46, 3.82, 4.01, 4.36, 3.77, 3.73, 3.88, 3.61, 3.56, 3.98, 4.19, 4.38, 4.44, 5.15, 5.02, 5.22, 5.67, 5.32, 5.35, 5.89, 5.44, 5.24, 4.96, 4.59, 4.54, 4.64, 4.4, 4.92, 4.92],
  },
  {
    symbol: "^TWII",
    name: "TAIEX",
    region: "Taiwan",
    flag: "🇹🇼",
    listingCurrency: "TWD",
    series: [634.06, 632.46, 623.87, 623.45, 595.29, 594.97, 599.57, 607.1, 612.75, 620.54, 630.11, 640.8, 625.59, 639.38, 643.88, 641.72, 650.2, 659.69, 657.85, 667.61, 648.16, 638.11, 638.11, 658.04, 654.98, 628.93, 632.31, 610.05, 619.51, 616.96, 615.94, 600.18, 587.04, 581.28, 563.35, 554.21, 530.91, 545.42, 554.91, 568.26, 556.35, 526.71, 516.78, 483.65, 486.17, 486.34, 500.31, 501.42, 502.01, 510.5, 514.08, 506.11, 480.32, 472.75, 466.39, 447.66, 424.42, 434.46, 412.2, 399.43, 399.1, 405.19, 446.07, 467.53, 478.07, 489.43, 482.73, 471.55, 464.27, 460.81, 469.36, 488.83, 492.36, 492.36, 528.13, 519.5, 511.67, 511.96, 510.05, 503.87, 505.84, 528.06, 522.8, 519.05, 523.12, 510.58, 508.68, 510.19, 505, 527.04, 536.58, 546.28, 551.02, 564.01, 555.75, 543.61, 531.95, 558.3, 548.71, 552.56, 532.35, 523.01, 513.58, 518.06, 523.3, 517.49, 530.95, 508.57, 507.47, 513, 521.69, 508.24, 498.61, 513.31, 517.24, 540.53, 546.83, 555.82, 553.15, 566.76, 564.12, 584.1, 564.15, 566.87, 559.89, 574.65, 578.21, 577.67, 595.19, 600.53, 598.96, 629.41, 624.33, 634.46, 633.84, 634.78, 643.5, 602.39, 618.5, 628.53, 640.37, 661.77, 669.3, 654.41, 678.64, 696.76, 719.01, 708.21, 724.67, 738.48, 700.67, 677.61, 661.38, 662.41, 688.89, 691.68, 698.98, 669.7, 681.63, 697.54, 725.45, 696.57, 711.33, 732.42, 730.01, 714.94, 735.28, 698.98, 704.63, 685.12, 717.55, 709.06, 689.86, 711.33, 696.94, 700.92, 704.81, 721.99, 721.99, 715.89, 709.87, 725.84, 703.91, 687.08, 666.34, 673.26, 652.43, 641.45, 595.64, 599, 612.68, 647.36, 690.97, 724.09, 720.61, 712.76, 723.34, 747.6, 745.51, 783.51, 779.73, 778, 795.26, 794.95, 783.6, 805.86, 809.02, 778.75, 794.72, 798.03, 841.02, 849.48, 837.01, 878.45, 894.41, 891.89, 895.5, 918.73, 892.59, 880.24, 843.16, 882.22, 892.11, 904.36, 878.86, 904.52, 937.59, 960.19, 995.07, 1011.95, 1022.39, 1004.24, 1067.57, 1067.57, 1132.57, 1053.08, 1047.17, 1054.77, 1037.04, 1017.82, 1116.37, 1166.24, 1234.77, 1230.82, 1325.3, 1304.39, 1339.68, 1423.53, 1430.69, 1398.68, 1468.63, 1398.99, 1465.06, 1412.51, 1322.55, 1351.58, 1331.06, 1373.19, 1426.06, 1426.06],
  },
];

/** Latest close date across the AI universe, ISO yyyy-mm-dd. */
export const AI_STOCKS_ASOF = "2026-08-17";

/** Weekly points each 5-year series carries — the window maths in
 *  chart-window.ts counts weeks back from the last point. */
export const AI_SERIES_POINTS = 260;
/* AI_STOCKS:END */
