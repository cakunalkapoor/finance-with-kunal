import Link from "next/link";
import { Mail, TrendingUp } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";

function LinkedInIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { href: "/markets", label: "Markets" },
              { href: "/dashboard", label: "Economy" },
              { href: "/blog", label: "Blog" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest uppercase transition-colors hover:text-[var(--color-neon-cyan)]"
                style={{
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  fontFamily: FONT_MONO,
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="hidden sm:block w-px h-3"
              style={{ background: "var(--color-space-border)" }}
            />

            <a
              href="mailto:kapoorkunal@outlook.com"
              aria-label="Email Kunal Kapoor"
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors hover:text-[var(--color-neon-cyan)]"
              style={{
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
                fontFamily: FONT_MONO,
              }}
            >
              <Mail size={12} />
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/kunal-kapoor/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kunal Kapoor on LinkedIn"
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors hover:text-[var(--color-neon-cyan)]"
              style={{
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
                fontFamily: FONT_MONO,
              }}
            >
              <LinkedInIcon size={12} />
              LinkedIn
            </a>
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
