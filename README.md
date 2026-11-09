# Finance with Kunal

Finance with Kunal is a weekly briefing on global markets, economic indicators, and personal finance. Visit the [production site](https://kunalkapoor.fyi/).

The homepage opens with the market ticker directly below navigation, followed by the intro and Market Brief. The original light and dark palettes use solid page backgrounds. The [Markets page](https://kunalkapoor.fyi/markets/) shares the same ticker.

## Local development

```bash
npm ci
npm run dev -- --port 3001
```

Open [localhost:3001](http://localhost:3001/). Run `npm test` for the project tests and `npm run build` for the static export in `out/`.

## Deployment

The [GitHub Pages workflow](.github/workflows/deploy.yml) runs on pushes to `main` and can also be started manually. It installs dependencies, checks dependency security, runs tests, builds the static export, and deploys it to `kunalkapoor.fyi`.

See [AGENTS.md](AGENTS.md) for project instructions, [CLAUDE.md](CLAUDE.md) for the architecture and design overview, and [docs/DATA.md](docs/DATA.md) for data sources, refresh steps, and display conventions.
