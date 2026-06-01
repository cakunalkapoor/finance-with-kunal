import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";

export default function Footer() {
  return (
    <footer
      className="border-t mt-16"
      style={{
        background: "var(--color-space-black)",
        borderColor: "var(--color-space-border)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{
                background: "rgba(124, 58, 237, 0.1)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
              }}
            >
              <TrendingUp size={12} style={{ color: "var(--color-neon-cyan)" }} />
            </div>
            <span
              className="text-xs font-bold tracking-widest"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              FINANCE WITH KUNAL
            </span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { href: "/markets", label: "Markets" },
              { href: "/dashboard", label: "Economy" },
              { href: "/blog", label: "Blog" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest uppercase transition-colors"
                style={{
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  fontFamily: FONT_MONO,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "var(--color-space-border)" }}
        >
          <p
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            © 2026 Finance with Kunal. For informational purposes only. Not financial advice.
          </p>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: FONT_MONO,
            }}
          >
            Data: FRED · Alpha Vantage · Yahoo Finance
          </p>
        </div>
      </div>
    </footer>
  );
}
