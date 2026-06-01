import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kunalkapoor.github.io/finance-with-kunal";

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
        {/* Apply the saved/system theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
