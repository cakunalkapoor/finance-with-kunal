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
  // renders as "Vantage AI — Finance with Kunal". The nav label stays the
  // short "AI" (see Navbar) and the route stays /ai.
  title: "Vantage AI",
  description:
    "The AI boom in numbers: AI-exposed stocks against the index, hyperscaler capex and power demand, disclosed AI revenue, chip supply chain, AI-attributed job cuts, venture funding, and business adoption — every curated figure sourced and dated.",
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

/** The headline value of one curated figure, by id — so the hero can restate a
 *  number that lives (with its source) in ai-data.ts without copying it. */
function figure(figures: AIFigure[], id: string): string {
  return figures.find((f) => f.id === id)?.value ?? "—";
}

export default function AIPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "AI", path: "/ai" }]} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <BriefingHero
          eyebrow="AI briefing"
          title="Follow the money, not the demo."
          description="AI shows up in a portfolio as capital expenditure, chip orders, power contracts, private rounds and job cuts long before it shows up as a product. This page tracks those, with a source and a date on every number."
          accent="emerald"
          // Pulled from ai-data rather than retyped: these three restate figures
          // that already exist (with sources) further down the page, and a
          // literal here would silently drift from them on the next revision.
          stats={[
            { label: "2026 capex", value: figure(AI_CAPEX_CONTEXT, "capex-total"), detail: "Four hyperscalers" },
            { label: "Q2 VC share", value: figure(AI_PRIVATE_CAPITAL, "ai-share"), detail: "Of global funding" },
            { label: "Stated cause", value: "#1", detail: "Of US job cuts" },
          ]}
        />

        {/* Market impact first — it's the question a markets reader arrives
            with, and it's the only section computed rather than curated. */}
        <Reveal>
          <AIMarketImpact />
        </Reveal>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start">
          <div className="space-y-5">
            <Reveal>
              <AIStockTable />
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal delay={100}>
              <AIFigureSection
                title="What AI actually earns"
                subtitle="Disclosed AI revenue and run rates · reported segments and call commentary are labelled separately"
                figures={AI_REVENUE}
                columns={2}
              >
                Only NVIDIA Data Center and Google Cloud are reported segments an auditor signed
                off. Microsoft&rsquo;s and Amazon&rsquo;s AI &ldquo;run rates&rdquo; are figures
                management chose to say on a call, with no reconciliation in the filings; Anthropic
                and OpenAI are private and disclose what they wish. Run rate annualises a recent
                period — it is not revenue earned.
              </AIFigureSection>
            </Reveal>

            <Reveal delay={100}>
              <AICapexChart />
            </Reveal>

            <Reveal>
              <AIFigureSection
                title="The bill behind the buildout"
                subtitle="Aggregate spend, contracted demand, and the electricity it needs"
                figures={AI_CAPEX_CONTEXT}
                columns={3}
              >
                Backlog is contracted-but-undelivered cloud revenue — demand booked years ahead of
                the capacity to serve it, which is why both firms are raising capex rather than
                harvesting margin.
              </AIFigureSection>
            </Reveal>

            {/* Chips sit in this column rather than full-width below purely to
                balance the grid: the stack table on the left runs ~2,550px (28
                rows) and the three cards above only ~1,780px, so this closes a
                ~770px gap to ~130px (measured at 1280px wide). Re-check if the
                universe grows again — same rule as the Markets page. */}
            <Reveal>
              <AIFigureSection
                title="The physical bottleneck"
                subtitle="Chips, memory and lithography — the layer that sets how fast the rest can grow"
                figures={AI_CHIPS}
                columns={2}
                glow="purple"
              >
                Memory, not logic, is the tightest link in the chain right now: HBM sells out on
                multi-quarter agreements, which is what a 76% operating margin at SK hynix is
                telling you. TSMC&rsquo;s monthly revenue disclosure is the highest-frequency
                public read on AI silicon demand anywhere — it lands weeks before the quarterly
                numbers.
              </AIFigureSection>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start">
          <div className="space-y-5">
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
                Note the tension in these four numbers: AI-attributed cuts are at a record while
                total announced cuts hit a two-year low. AI is a growing share of a shrinking
                number, and it is concentrated in technology rather than spread across the economy.
              </AIFigureSection>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal delay={100}>
              <AIDealsTable />
            </Reveal>
            <Reveal delay={100}>
              <AIFigureSection
                title="Where private capital went"
                subtitle="Global venture funding and AI's share of it · Crunchbase"
                figures={AI_PRIVATE_CAPITAL}
                columns={2}
              >
                Concentration at this level is the story: two companies took 43% of all global
                startup funding in a half-year, and sixteen cheques accounted for over half of Q2.
                Venture funding totals are estimates that get revised upward for months after a
                quarter closes, as deals are disclosed late.
              </AIFigureSection>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start">
          <Reveal>
            <AIAdoptionChart />
          </Reveal>
          <Reveal delay={100}>
            <AIFigureSection
              title="Adoption and unit economics"
              subtitle="Whether the spend is converting into use — and what a unit of capability costs"
              figures={AI_ADOPTION}
              columns={2}
            >
              The gap between the two halves of this page is the thing worth watching: roughly
              $725B of capex and 70% of venture funding, against a fifth of US businesses using AI
              in any business function. Both can stay true for a long time — infrastructure has led
              adoption before — but the gap is the risk.
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
                Where a figure could not be sourced it is absent rather than estimated — June is
                missing from the layoffs chart, and the two smallest firm-size bands are missing
                from the adoption chart, for exactly that reason. Nothing here is investment advice
                or a recommendation to buy or sell any security.
              </p>
            </div>
          </SciFiCard>
        </Reveal>
      </div>
    </>
  );
}
