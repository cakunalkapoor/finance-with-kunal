import type { BlogPost } from "@/types";

export interface BlogSource {
  id: string;
  publisher: string;
  title: string;
  date: string;
  url: string;
}

export interface BlogArticle extends BlogPost {
  takeaway: string;
  introduction: string[];
  cases: { company: string; date: string; outcome: string; evidence: string; source: string }[];
  sections: {
    id: string;
    title: string;
    paragraphs: { text: string; sources?: string[] }[];
    points?: { title: string; text: string }[];
  }[];
  sources: BlogSource[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "ai-data-center-ipo-setbacks",
    title: "AI data-center IPOs hit a valuation test",
    excerpt: "Firmus withdrew its offer, AirTrunk reportedly postponed a REIT listing, and Elice fell sharply on debut. What these different setbacks reveal about funding the AI buildout.",
    date: "2026-10-21",
    category: "AI & Capital Markets",
    readTime: 7,
    tags: ["AI infrastructure", "IPOs", "Firmus", "AirTrunk", "Elice", "Data centers"],
    takeaway: "The question is how much future cash flow today's share price assumes—and how much more capital is needed before that cash flow arrives.",
    introduction: [
      "The AI infrastructure story has reached an uncomfortable checkpoint. Several recent offerings have struggled, even as companies continue to describe large opportunities in computing capacity. The temptation is to group the headlines together as failed IPOs and treat them as a verdict on AI itself.",
      "The more useful reading starts with the transaction. An offering withdrawn before trading, a listing put on hold, and shares falling after a completed capital raise create different problems for companies and investors. Firmus, AirTrunk and Elice illustrate each of those outcomes. The cases below reflect reporting available as of October 21, 2026; they are not an exhaustive count of the sector's IPOs.",
    ],
    cases: [
      {
        company: "Firmus",
        date: "October 9, 2026",
        outcome: "Offering withdrawn",
        evidence: "The Australian AI cloud company abandoned its planned IPO before trading began and said it would pursue private capital and consider other options.",
        source: "firmus-dcd",
      },
      {
        company: "AirTrunk",
        date: "Reported October 13, 2026",
        outcome: "REIT IPO reportedly postponed",
        evidence: "Reuters, citing two sources, reported that a proposed Singapore REIT listing targeting about US$1.5 billion in proceeds had been put on hold.",
        source: "airtrunk-reuters",
      },
      {
        company: "Elice",
        date: "October 20, 2026",
        outcome: "Completed IPO; weak debut",
        evidence: "The offering raised about ₩201.1 billion. At 9:30 a.m. in Seoul on debut day, shares traded at ₩63,000 against a ₩90,500 offer price, a 30.39% decline. That is an intraday observation, not a closing return.",
        source: "elice-sedaily",
      },
    ],
    sections: [
      {
        id: "firmus",
        title: "Firmus: the funding plan met a price constraint",
        paragraphs: [
          {
            text: "Firmus's withdrawal on October 9 is the clearest example here of an IPO that did not proceed. Data Center Dynamics reported that the listing had been scheduled for October 23. In the company statement carried by that report, the board said proceeding would not serve shareholders' interests and outlined a search for private-market capital and alternative routes.",
            sources: ["firmus-dcd"],
          },
          {
            text: "Reuters Breakingviews described a planned A$11 share price and a market value approaching A$44 billion, alongside investor concerns about the growth plan. That valuation was a proposed transaction price, not an amount already invested by the public. Likewise, the intended capital raise and the value of the whole company are separate figures.",
            sources: ["firmus-reuters"],
          },
          {
            text: "My interpretation is that the failed offering exposes a financing dependency. If expansion requires fresh equity, the availability and price of that equity are part of the business case. A company can have attractive customers and still face a gap between the projects it wants to build and the money investors will supply on acceptable terms. Withdrawal does not, by itself, establish insolvency or a permanent end to the business.",
          },
        ],
      },
      {
        id: "airtrunk",
        title: "AirTrunk: a reported delay in a different structure",
        paragraphs: [
          {
            text: "On October 13, Reuters reported that Blackstone-backed AirTrunk had postponed a proposed Singapore REIT IPO amid difficult market conditions. The report cited two people with direct knowledge and described a potential US$1.5 billion raise. AirTrunk had not immediately responded to Reuters and Blackstone declined to comment. This is a sourced report of a postponement, rather than a confirmed permanent cancellation.",
            sources: ["airtrunk-reuters"],
          },
          {
            text: "The REIT structure matters. A property vehicle is assessed through the cash flows and obligations of the assets placed inside it; it should not automatically be valued like a company renting out GPU computing services. The proposed proceeds also should not be mistaken for a valuation of the entire AirTrunk group.",
          },
          {
            text: "For a listing built around income-producing infrastructure, financing costs and the yield buyers require can affect the price they will pay. A delay may therefore reflect a disagreement over price, timing or structure. The reported delay alone cannot tell us that tenants have stopped needing data-center capacity.",
          },
        ],
      },
      {
        id: "elice",
        title: "Elice: strong subscriptions did not protect the debut",
        paragraphs: [
          {
            text: "Elice did reach the public market. Seoul Economic Daily reported a ₩90,500 offer price, at the top of the indicated range, and a retail subscription rate of roughly 408 times. Its October 20 report recorded a ₩63,000 trading price at 9:30 a.m. local time. The same report described the company's expansion from an education platform into GPU cloud services and data centers.",
            sources: ["elice-sedaily"],
          },
          {
            text: "Calling this a cancelled or uncompleted IPO would be wrong. The issuer raised capital; the immediate setback was the price available to shareholders in secondary trading. A large subscription multiple measures bids relative to the shares allocated in that process. It is not a promise that buyers will support the offer price once trading opens.",
          },
          {
            text: "The distinction is practical. A weak debut can make later fundraising and shareholder exits more difficult, but it does not automatically reverse the original raise. The opening-day decline also cannot, on its own, quantify the company's future utilisation, profitability or financing needs.",
          },
        ],
      },
      {
        id: "financing",
        title: "The connection is the cost of reaching scale",
        paragraphs: [
          {
            text: "These businesses sit near the same AI buildout but do not sell identical products or carry identical risks. Their common challenge is paying for capacity before the eventual cash generation is fully demonstrated. Shareholders must decide both whether the capacity will be useful and whether enough of the resulting value will remain for them after construction costs, operating expenses and financing obligations.",
          },
          {
            text: "One plausible feedback loop is that a lower equity valuation makes a given capital raise more dilutive. If debt is unavailable or expensive, the company may have to stage construction more slowly or bring in partners. Slower delivery can then change the revenue timetable used to support the original valuation. This is a financing mechanism to examine, not a claim that every step has occurred at all three companies.",
          },
          {
            text: "That is why an announced customer, planned megawatts and revenue already being collected should be kept separate. A contract can be valuable while remaining conditional on delivery, power availability or other milestones. Similarly, an existing data-center asset and a proposed campus require different assumptions about time, spending and execution.",
          },
        ],
      },
      {
        id: "questions",
        title: "Five questions behind the headline",
        paragraphs: [
          { text: "For the next AI infrastructure prospectus, these are the questions I would use to separate a compelling demand story from a financeable equity proposition." },
        ],
        points: [
          { title: "What has actually been delivered?", text: "Separate operating capacity, energised capacity, construction in progress and land or power commitments. Then connect each category to customer payments." },
          { title: "How much additional funding is required?", text: "Compare committed liquidity with construction spending, interest payments and the cost of reaching the next operating milestone. Identify what still depends on another raise." },
          { title: "Who bears customer and delivery risk?", text: "Look at customer concentration, contract duration, cancellation rights, deposits, guarantees and exposure to counterparties in the same funding network." },
          { title: "What must happen to justify the price?", text: "Test the assumptions for utilisation, margins, equipment replacement and refinancing. Distinguish a company's reported results from the projections used to market its shares." },
          { title: "Who receives the IPO proceeds?", text: "Separate new shares funding the business from existing shares sold by owners. Review the free float and lock-ups rather than assuming a large offer automatically means a large funding cushion." },
        ],
      },
      {
        id: "outlook",
        title: "What would change the assessment?",
        paragraphs: [
          {
            text: "A completed financing on clearly disclosed terms, evidence that capacity is being delivered, and cash generation catching up with spending would make the funding story easier to assess. Conversely, repeated delays that increase the amount of uncommitted capital needed would deserve closer attention. For Elice, subsequent trading and operating disclosures matter more than treating the first session as a permanent verdict.",
          },
          {
            text: "My reading of these setbacks is that public markets are testing who earns an adequate return from the AI buildout, at what entry price and with whose capital. Growing demand can support an industry while leaving some offerings unattractive. Keeping the transaction outcome, operating evidence and valuation assumptions separate makes that debate more useful than declaring every difficult debut a failure of AI.",
          },
        ],
      },
    ],
    sources: [
      { id: "firmus-dcd", publisher: "Data Center Dynamics", title: "Neocloud Firmus cancels IPO, blames market volatility", date: "2026-10-09", url: "https://www.datacenterdynamics.com/en/news/neocloud-firmus-cancels-ipo-blames-market-volatility/" },
      { id: "firmus-reuters", publisher: "Reuters Breakingviews", title: "Failed AI IPO puts fear before FOMO", date: "2026-10-09", url: "https://www.breakingviews.com/columns/considered-view/failed-ai-ipo-puts-fear-before-fomo-2026-10-09/" },
      { id: "airtrunk-reuters", publisher: "Reuters via MarketScreener", title: "Blackstone-backed AirTrunk delays Singapore REIT IPO amid AI stock selloff, sources say", date: "2026-10-13", url: "https://ca.marketscreener.com/news/blackstone-backed-airtrunk-delays-singapore-reit-ipo-amid-ai-stock-selloff-sources-say-ce785ddddd80ff27" },
      { id: "elice-sedaily", publisher: "Seoul Economic Daily", title: "Elice plunges 30% in KOSDAQ trading debut", date: "2026-10-20", url: "https://en.sedaily.com/finance/2026/10/20/elice-plunges-30-percent-in-kosdaq-trading-debut" },
    ],
  },
];

/** The listing and article route derive from the same metadata. */
export const BLOG_POSTS: BlogPost[] = BLOG_ARTICLES.map(
  ({ slug, title, excerpt, date, category, readTime, tags }) => ({ slug, title, excerpt, date, category, readTime, tags }),
);
