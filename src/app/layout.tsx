import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { AUTHOR_NAME, OG_IMAGE, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/seo";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const spaceMono = localFont({
  src: [
    {
      path: "./fonts/space-mono-regular-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/space-mono-bold-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-mono",
  display: "swap",
});

const HOME_DESCRIPTION =
  "Curated weekly global markets dashboard, economic indicators, and finance commentary by Kunal Kapoor. Equities, bond yields, commodities, GDP, inflation and central bank policy in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set a bare title ("Markets"); the template appends the site name.
  title: {
    default: `${SITE_NAME} — Global Markets & Economic Intelligence`,
    template: `%s — ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  keywords: [
    "finance",
    "global markets",
    "economic indicators",
    "market analysis",
    "investing",
    "S&P 500",
    "TSX",
    "bond yields",
    "GDP",
    "inflation",
    "Bank of Canada",
    "Federal Reserve",
    "Kunal Kapoor",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: absoluteUrl("/about") }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: "finance",
  alternates: { canonical: absoluteUrl("/") },
  // Let Google show large image previews and full-length text snippets.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Bare numbers in the market tables shouldn't become iOS phone links.
  formatDetection: { telephone: false, date: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Global Markets & Economic Intelligence`,
    description: SITE_TAGLINE,
    url: absoluteUrl("/"),
    locale: "en_CA",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Global Markets & Economic Intelligence`,
    description: SITE_TAGLINE,
    images: [OG_IMAGE.url],
  },
};

// Matches --color-space-void in each theme, so mobile browser chrome blends in.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f1eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d09" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="grid-bg min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
      >
        {/* Runs before paint: applies the saved/system theme (no flash of the
            wrong theme) and marks the document as script-enabled. The `js`
            class gates the scroll-reveal hidden state in globals.css, so a
            no-JS visitor or crawler still gets fully visible content. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var e=document.documentElement;e.classList.add('js');try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)e.classList.add('dark');}catch(x){}})();",
          }}
        />
        <SiteJsonLd />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
