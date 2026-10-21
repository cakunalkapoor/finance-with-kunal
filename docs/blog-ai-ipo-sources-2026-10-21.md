# AI infrastructure IPO article — source review

Article: `/blog/ai-data-center-ipo-setbacks/`, dated October 21, 2026.

## Inclusion and classification

- **Firmus:** offering withdrawn October 9 before trading. Source:
  [Data Center Dynamics](https://www.datacenterdynamics.com/en/news/neocloud-firmus-cancels-ipo-blames-market-volatility/),
  including the company statement carried by CNBC. Its stated private-funding plans are
  attributed; no subsequent financing is claimed to have closed.
- **Firmus proposed valuation:** the A$11 price and near-A$44B market value are attributed to
  [Reuters Breakingviews](https://www.breakingviews.com/columns/considered-view/failed-ai-ipo-puts-fear-before-fomo-2026-10-09/).
  This was a proposed market value, not IPO proceeds or cash already raised. Avoid inconsistent
  media estimates of gross proceeds that include different offer sizes or options.
- **AirTrunk:** reported postponement of a proposed Singapore REIT IPO. Source:
  [Reuters, October 13](https://ca.marketscreener.com/news/blackstone-backed-airtrunk-delays-singapore-reit-ipo-amid-ai-stock-selloff-sources-say-ce785ddddd80ff27).
  The report cites two unnamed people and says AirTrunk had not immediately responded and
  Blackstone declined to comment. US$1.5B is the reported prospective raise, not the value of
  the entire group. The article does not claim a permanent cancellation or confirmed new date.
- **Elice:** completed IPO, followed by a weak KOSDAQ debut October 20. Source:
  [Seoul Economic Daily](https://en.sedaily.com/finance/2026/10/20/elice-plunges-30-percent-in-kosdaq-trading-debut),
  published at 09:56:13 local time. Its specific 09:30 quote was ₩63,000 versus a ₩90,500 offer,
  down 30.39%; the offering raised about ₩201.1B. This is explicitly an intraday price, not a
  closing return. Other reports' 32–33% lows are not used as a close. The source is identified
  as an English translation of a Korean report.

## Editorial boundaries

The post describes IPO setbacks, not three cancelled offerings. It distinguishes transaction
outcomes from operating failure and avoids claiming that these events prove AI demand has
collapsed. The financing feedback loop, contract questions and assessment framework are
labelled as interpretation rather than case-specific facts.

SB Energy appeared in reports about a postponed timetable, but a sufficiently clear current
status was not verified for this post. It is not presented as a fourth failed offering.
No social-media claim or paywalled Bloomberg summary is used as factual article evidence.

## Publishing implementation

`src/lib/blog-data.ts` is the source of article metadata, paragraphs, case comparison and source
links. `BLOG_POSTS` is derived from it. The new article route uses Next.js 16 promise-based
params and `generateStaticParams` for GitHub Pages, with unknown slugs excluded from generation.
The listing, canonical URL, article schema and sitemap use the same article slug and date.

## Validation

Production static export and all 71 existing tests passed. Static HTML checks confirmed the
blog listing link, article canonical URL, publication date and BlogPosting schema, all four
source links, sitemap entry and 404 export. Browser review confirmed readable article
typography and the three-case comparison table at a narrow desktop viewport.
