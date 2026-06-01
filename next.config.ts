import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/finance-with-kunal") when deploying to a
// GitHub Pages *project* site so assets and links resolve under the sub-path.
// Leave it unset for a user/org page (kunalkapoor.github.io) or a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
