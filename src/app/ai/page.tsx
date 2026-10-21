import AIStockTable from "@/components/ai/AIStockTable";
import AIMarketImpact from "@/components/ai/AIMarketImpact";
import AICapexChart from "@/components/ai/AICapexChart";
import AILayoffsChart from "@/components/ai/AILayoffsChart";
import AIDealsTable from "@/components/ai/AIDealsTable";
import AIAdoptionChart from "@/components/ai/AIAdoptionChart";
import { AIFigureSection } from "@/components/ai/AIFigureGrid";
import BriefingHero from "@/components/ui/BriefingHero";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import Reveal from "@/components/ui/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import type { AIFigure } from "@/types";
import {
  AI_ADOPTION,
  AI_ADOPTION_PERIOD,
  AI_ADOPTION_RELEASE,
  AI_ADOPTION_NATIONAL_RANGE,
  AI_STOCKS,
  AI_CAPEX_CONTEXT,
  AI_CHIPS,
  AI_DATA_ASOF,
  AI_FX_SOURCES,
  AI_LABOUR,
  AI_PRIVATE_CAPITAL,
  AI_REVENUE,
} from "@/lib/ai-data";

export const metadata = pageMetadata({
  // Browser-tab / SEO title. The root layout appends the site name, so this
  // renders as "Vantage AI — Finance with Kunal". Deliberately NOT the hero
  // line ("Follow the AI story."): the tab is what shows up in a search result
  // and a bookmark, so it carries the distinctive name while the hero does the
  // describing. The nav label stays the short "AI" and the route stays /ai.
  title: "Vantage AI",
  description:
    "The AI boom in numbers: AI-exposed stocks against major global markets, hyperscaler capex and power demand, disclosed AI revenue, hardware constraints, AI-attributed job cuts, venture funding, and business adoption — every curated figure sourced and dated.",
  path: "/ai",
  keywords: [
    "AI stocks",
    "hyperscaler capex",
    "AI revenue",
    "AI job losses",
    "AI venture capital funding",
    "NVIDIA data center revenue",
    "AI market concentration",
    "AI adoption rate",
  ],
});

/* Two-column section layout.
 *
 * A grid row is as tall as its taller side, so whenever the two columns hold
 * different amounts of content the shorter one used to stop early and leave a
 * hole above the next section — ~130px above "Private capital", which a comment
 * below this used to just document and accept. Instead the shorter column's
 * LAST card grows to absorb the difference, so the slack ends up as padding
 * inside a card rather than as a gap in the page.
 *
 * `grow` and not `flex-1`: `flex-1` sets `flex-basis: 0`, which lets a card be
 * SHRUNK below its content, and these cards are `overflow-hidden` — they would
 * silently clip. `grow` only ever adds height.
 *
 * Which column is shorter changes with the data, so both sides get the rule
 * rather than hard-coding the one that happens to be short today. */
const TWO_COL = "grid grid-cols-1 gap-5 xl:grid-cols-2";
const COL = "flex flex-col gap-5 [&>*:last-child]:grow [&>*:last-child>*]:h-full";
/** Same idea where the Reveals are the grid children directly, with no column
 *  wrapper: the grid stretches them, and this makes the card fill the Reveal. */
const TWO_COL_DIRECT = `${TWO_COL} [&>*>*]:h-full`;

/** The headline value of one curated figure, by id — so the hero can restate a
 *  number that lives (with its source) in ai-data.ts without copying it. */
function figure(figures: AIFigure[], id: string): string {
  return figures.find((f) => f.id === id)?.value ?? "—";
}

function percentageRange([low, high]: [number, number]): string {
  const format = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));
  return low === high ? `${format(high)}%` : `${format(low)}–${format(high)}%`;
}

export default function AIPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "AI", path: "/ai" }]} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <BriefingHero
          eyebrow="AI briefing"
          title="Follow the AI story."
          description="Capital expenditure, AI revenue, hardware supply signals, electricity demand, private rounds, and job-cut attribution in one view—with every figure sourced and dated."
          accent="emerald"
          // Pulled from ai-data rather than retyped: these three restate figures
          // that already exist (with sources) further down the page, and a
          // literal here would silently drift from them on the next revision.
          stats={[
            { label: "2026 capex", value: figure(AI_CAPEX_CONTEXT, "capex-total"), detail: "Company-wide · four hyperscalers" },
            { label: "Q3 VC share", value: figure(AI_PRIVATE_CAPITAL, "ai-share"), detail: "Oct 2 global snapshot" },
            { label: "AI rank", value: figure(AI_LABOUR, "leading-reason"), detail: "September layoff reasons" },
          ]}
        />

        {/* Market impact first — it's the question a markets reader arrives
            with, and it's the only section computed rather than curated. */}
        <Reveal>
          <AIMarketImpact />
        </Reveal>

        <div className={TWO_COL}>
          <div className={COL}>
            <Reveal>
              <AIStockTable />
            </Reveal>
          </div>

          <div className={COL}>
            <Reveal delay={100}>
              <AIFigureSection
                title="What AI actually earns"
                subtitle="Disclosed AI revenue and run rates · USD · reported segments and call commentary are labelled separately"
                figures={AI_REVENUE}
                columns={2}
              >
                The revenue evidence spans different parts of the AI stack. NVIDIA Data Center
                and Google Cloud report quarterly segment revenue; the private-company figures
                and AWS disclosure annualise recent activity. These measures cannot be summed
                into one AI market total. TSMC&rsquo;s high-teens accelerator share refers to
                FY2025 and excludes CPUs, so the newer company-wide Q3 results below do not
                replace it. Microsoft&rsquo;s retired AI-specific metric remains absent.
              </AIFigureSection>
            </Reveal>

            <Reveal delay={100}>
              <div id="hyperscaler-capex">
                <AICapexChart />
              </div>
            </Reveal>

            <Reveal>
              <AIFigureSection
                title="The bill behind the buildout"
                subtitle="Company-wide capex, two-cloud backlog, and global data-centre electricity demand"
                figures={AI_CAPEX_CONTEXT}
                columns={3}
              >
                The spending plans show the scale of infrastructure commitments, while the
                cloud backlog offers a separate view of contracted demand. Backlog converts to
                revenue over time; it does not establish the return on that spending. The four
                capex plans include businesses beyond AI and use different lease conventions.
                The electricity figure is an IEA projection for 2030, not observed 2026 demand.
              </AIFigureSection>
            </Reveal>

            {/* Chips sit in this column rather than full-width below to balance
                the grid: the stack table on the left runs ~2,550px (28 rows)
                against ~1,780px for the three cards above. That still leaves
                this column the shorter of the two, so it is the one COL's
                last-child rule stretches — see the note by TWO_COL. */}
            <Reveal>
              <AIFigureSection
                title="Hardware constraints"
                subtitle="Reported memory, foundry and lithography signals · monetary figures in USD"
                figures={AI_CHIPS}
                columns={2}
                glow="purple"
              >
                TSMC&rsquo;s Q3 US-dollar revenue rose 41.2% year over year, and ASML lifted the
                floor of its annual sales guidance to €44B. Those releases support a picture of
                strong foundry and equipment demand, while SK hynix&rsquo;s card still refers to
                Q2 company-wide results. None isolates AI-only revenue or margin. SK hynix and
                ASML figures are translated at the results-date{" "}
                <a
                  href={AI_FX_SOURCES.skHynix.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:underline"
                >
                  Federal Reserve
                </a>{" "}
                and{" "}
                <a
                  href={AI_FX_SOURCES.asml.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:underline"
                >
                  Yahoo EUR/USD
                </a>{" "}
                exchange rates, respectively, and rounded to the nearest $0.1B.
              </AIFigureSection>
            </Reveal>
          </div>
        </div>

        <div className={TWO_COL}>
          <div className={COL}>
            <Reveal>
              <AILayoffsChart />
            </Reveal>
            <Reveal>
              <AIFigureSection
                title="AI and jobs"
                subtitle="US announced job cuts citing AI · Challenger, Gray & Christmas"
                figures={AI_LABOUR}
                columns={2}
                glow="purple"
              >
                September&rsquo;s lower total cuts and roughly 9% AI-attributed share show that
                the monthly pattern differs from the cumulative AI story. The 120,136
                AI-attributed cuts through September are employer-announced plans; the data do
                not establish how many jobs AI independently displaced. Technology-sector cuts
                include every stated reason, so that total should not be added to AI cuts.
              </AIFigureSection>
            </Reveal>
          </div>

          <div className={COL} id="private-capital-evidence">
            <Reveal delay={100}>
              <AIDealsTable />
            </Reveal>
            <Reveal delay={100}>
              <AIFigureSection
                title="Reported private-capital concentration"
                subtitle="Global venture funding and AI's reported share · USD · Crunchbase snapshots"
                figures={AI_PRIVATE_CAPITAL}
                columns={2}
              >
                AI accounted for $102B of $159B in reported Q3 venture funding, about 64%.
                That remains a large concentration even though it is below the earlier Q1
                and Q2 snapshots. The three H1 OpenAI and Anthropic announcements sum to $217B,
                about 42% of the later $515B H1 total. These figures mix announced or committed
                rounds with funding-database snapshots, so they do not measure cash deployed
                or investment returns. Quarter vintages and later revisions remain labelled.
              </AIFigureSection>
            </Reveal>
          </div>
        </div>

        <div className={TWO_COL_DIRECT}>
          <Reveal>
            <AIAdoptionChart />
          </Reveal>
          <Reveal delay={100}>
            <AIFigureSection
              title="Adoption and cost-efficiency proxies"
              subtitle="US employer-business use, paid seats, and estimated AI-chip performance per US dollar"
              figures={AI_ADOPTION}
              columns={2}
            >
              The latest displayed Census estimate puts AI use at{" "}
              {percentageRange(AI_ADOPTION_NATIONAL_RANGE)} of US nonfarm employer businesses
              for {AI_ADOPTION_PERIOD}, released {AI_ADOPTION_RELEASE}. Adoption therefore remains far from
              universal in this survey, despite the scale of infrastructure spending. Paid
              Copilot seats and chip throughput per dollar add distribution and cost context;
              they do not measure active use, productivity gains or returns on AI investment.
            </AIFigureSection>
          </Reveal>
        </div>

        {/* Method note. This page leans on curated figures far more than any
            other on the site, so it says so plainly rather than letting the
            numbers imply a feed that doesn't exist. */}
        <Reveal>
          <SciFiCard>
            <CardHeader
              title="How to read this page"
              subtitle={`Research reviewed ${AI_DATA_ASOF} · stock quotes refresh weekly`}
            />
            <div
              className="space-y-3 px-4 pb-4 text-[12px] leading-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <p>
                All monetary amounts are in USD. Figures originally reported in another currency
                use the named exchange-rate source from the results date and are marked as translated;
                rounded conversions should not be read as audited company disclosures.
              </p>
              <p>
                Research figures come from company disclosures, Census survey data, funding
                announcements and published research. Census also provides a public API.
                Each source follows its own release schedule, so the review date can be newer
                than the reporting period. Every research figure links to its source and retains
                its publication date; annualized revenue, reported segments and company-wide
                spending plans are labelled separately.
              </p>
              <p>
                The {AI_STOCKS.length} listings in the stack table and the
                basket chart use Yahoo Finance observations on the site&rsquo;s weekly cadence.
                The AI comparison converts each daily close to USD before computing returns;
                Markets retains each instrument&rsquo;s quoted currency. Different date windows,
                currency bases and equal-weighting can therefore produce different comparisons.
              </p>
              <p>
                Where a figure cannot be sourced it is absent rather than estimated. Notes beside
                the charts distinguish employer attribution, announced deal terms, company-wide
                capex and Census survey estimates so unlike measures are not presented as
                equivalent. Nothing here is investment advice or a recommendation to buy or sell
                any security.
              </p>
            </div>
          </SciFiCard>
        </Reveal>
      </div>
    </>
  );
}
