import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_IMAGE } from "@/lib/seo";

// The approved card is exported at 1200 × 630 using the site's fonts. Serve
// the same artwork through Next's image convention and the public PNG.
export const alt = OG_IMAGE.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Required for `output: "export"` — render this image once at build time.
export const dynamic = "force-static";

const artwork = readFile(join(process.cwd(), "public/og-dark-signal.png"));

export default async function Image() {
  return new Response(new Uint8Array(await artwork), {
    headers: { "Content-Type": contentType },
  });
}
