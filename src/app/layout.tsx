import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kunalkapoor.fyi";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Finance with Kunal — Global Markets & Economic Intelligence",
  description:
    "Curated weekly global markets dashboard, economic indicators, and finance commentary by Kunal Kapoor.",
  keywords: ["finance", "markets", "economics", "investing", "S&P 500", "GDP", "inflation"],
  applicationName: "Finance with Kunal",
  authors: [{ name: "Kunal Kapoor" }],
  openGraph: {
    title: "Finance with Kunal",
    description: "Data. Insight. Action. Beyond the ticker.",
    url: siteUrl,
    siteName: "Finance with Kunal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance with Kunal",
    description: "Data. Insight. Action. Beyond the ticker.",
  },
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
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
