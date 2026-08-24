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
  AI_ADOPTION_NATIONAL_RANGE,
  AI_STOCKS,
  AI_CAPEX_CONTEXT,
  AI_CHIPS,
  AI_DATA_ASOF,
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
            { label: "Q2 VC share", value: figure(AI_PRIVATE_CAPITAL, "ai-share"), detail: "Jul 1 global snapshot" },
            { label: "Stated cause", value: "#1", detail: "Five straight months" },
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
                subtitle="Disclosed AI revenue and run rates · reported segments and call commentary are labelled separately"
                figures={AI_REVENUE}
                columns={2}
              >
                NVIDIA Data Center and Google Cloud are reported segments, though neither is
                AI-only. TSMC&rsquo;s high-teens share is management&rsquo;s company-defined
                accelerator revenue mix — GPUs, ASICs and HBM controllers, excluding CPUs — not a
                standalone segment. Amazon&rsquo;s run rate is call commentary; Anthropic and OpenAI
                are private. Run rate annualises a recent period — it is not revenue earned.
                Microsoft stopped disclosing an AI-specific figure after FY26 Q2, which is why it
                is absent.
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
                The backlog total combines management-reported Google Cloud and AWS commitments. It
                is not AI-only, and the two companies&rsquo; definitions and recognition timing
                differ. The capex total is also company-wide rather than a standalone AI budget.
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
                subtitle="Reported memory, foundry and lithography signals · company-wide figures labelled as such"
                figures={AI_CHIPS}
                columns={2}
                glow="purple"
              >
                SK hynix&rsquo;s card pairs company-wide quarterly revenue and operating margin with
                management&rsquo;s HBM4 shipment commentary; the margin is not an HBM-only measure.
                TSMC&rsquo;s monthly growth is also company-wide and is shown only as a
                high-frequency foundry-demand proxy, not an AI revenue breakout. The cards retain
                SK hynix&rsquo;s reported won and ASML&rsquo;s reported euros rather than introducing
                an exchange-rate assumption.
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
                AI was the reason cited most often in recent announcements while total announced
                cuts hit a two-year low. Challenger tracks stated reasons, not independently
                measured displacement. Its technology-sector total covers cuts for every stated
                reason; separately, Challenger says AI-related cutting has been limited outside
                technology.
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
                subtitle="Global venture funding and AI's reported share · Crunchbase snapshots"
                figures={AI_PRIVATE_CAPITAL}
                columns={2}
              >
                Combining the announced OpenAI and Anthropic rounds in the deal table with
                Crunchbase&rsquo;s later revised H1 total gives about 42%. That is a derived,
                cross-vintage comparison; the Q2 share is a separate July 1 snapshot, and funding
                totals can be revised as later deals are disclosed.
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
              subtitle="US employer-business use, paid seats, and estimated AI-chip performance per dollar"
              figures={AI_ADOPTION}
              columns={2}
            >
              These are separate scale signals, not a conversion funnel or ROI test: global capex
              guidance and venture snapshots, a US nonfarm employer-business survey, paid software
              seats, and an estimate of peak theoretical chip throughput per dollar cover different
              populations and periods. The latest Census incidence estimate is{" "}
              {percentageRange(AI_ADOPTION_NATIONAL_RANGE)}.
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
              subtitle={`Curated figures reviewed ${AI_DATA_ASOF} · stock quotes refresh weekly`}
            />
            <div
              className="space-y-3 px-4 pb-4 text-[12px] leading-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <p>
                Almost nothing here has a free API behind it. There is no &ldquo;AI sector&rdquo; in
                any index classification, no company reports an audited &ldquo;AI revenue&rdquo;
                line, layoff attribution comes from one outplacement firm reading employers&rsquo;
                own announcements, and private deal terms are whatever the parties chose to
                announce. So every curated number on this page carries its source and the date it
                was reported, and the tile itself is the link — click through and check.
              </p>
              <p>
                The one exception is the price data. The {AI_STOCKS.length} listings in the stack table and the
                basket chart are Yahoo Finance closes on the same weekly cadence as the rest of the
                site, computed the same way as the Markets page.
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
