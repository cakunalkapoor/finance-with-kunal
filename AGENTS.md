<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Site design and deployment

- Keep the original paper and green light theme and the near-black and lime dark theme. Use solid page backgrounds in both modes.
- Keep the shared `MarketTicker` directly below the navigation on the homepage, above the intro and Market Brief. The Markets page uses the same ticker.
- The production site is [kunalkapoor.fyi](https://kunalkapoor.fyi/). The GitHub Pages workflow deploys pushes to `main`. See [README.md](README.md) for the local and deployment workflow and [docs/DATA.md](docs/DATA.md) for ticker and brief data conventions.
