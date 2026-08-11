// Runs as `postbuild`. Next emits the built OG card as `out/opengraph-image`
// with no file extension, and GitHub Pages serves extensionless files as
// application/octet-stream — which Facebook, LinkedIn and X reject when they
// scrape the card. Copy it to a real `.png` so it's served as image/png; the
// metadata in src/lib/seo.ts points every page at that copy.
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const source = join(OUT, "opengraph-image");
const target = join(OUT, "og.png");

if (!existsSync(source)) {
  // `next build` without output: "export" (or a failed image render) — don't
  // fail the build, just say so, since the metadata falls back to the route.
  console.warn("[postbuild-og] out/opengraph-image not found — skipped og.png");
  process.exit(0);
}

copyFileSync(source, target);
console.log("[postbuild-og] wrote out/og.png");
