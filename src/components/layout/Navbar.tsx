"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, FONT_MONO } from "@/lib/utils";
import { Menu, X, TrendingUp } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/dashboard", label: "Economy" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Me" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--color-nav-bg)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--color-space-border)",
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-neon-cyan), var(--color-neon-blue), var(--color-neon-purple), transparent)",
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.2))",
              border: "1px solid rgba(124, 58, 237, 0.3)",
            }}
          >
            <TrendingUp
              size={14}
              style={{ color: "var(--color-neon-cyan)" }}
            />
          </div>
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.12em",
            }}
          >
            <span style={{ color: "var(--color-neon-cyan)" }}>Finance</span>
            <span style={{ color: "var(--color-text-secondary)" }}> with </span>
            <span style={{ color: "var(--color-text-primary)" }}>Kunal</span>
          </span>
        </Link>

        {/* Right cluster: nav links · theme toggle · mobile menu button */}
        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded text-xs font-semibold tracking-widest uppercase transition-all duration-200",
                  active
                    ? "text-neon-cyan"
                    : "hover:text-space-text-primary"
                )}
                style={{
                  color: active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
                  background: active ? "rgba(124, 58, 237, 0.08)" : "transparent",
                  border: active ? "1px solid rgba(124, 58, 237, 0.2)" : "1px solid transparent",
                  letterSpacing: "0.1em",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

          {/* Theme toggle (always visible) */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            style={{
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-space-border)",
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            background: "var(--color-nav-bg-solid)",
            borderColor: "var(--color-space-border)",
          }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded text-xs font-semibold tracking-widest uppercase"
                style={{
                  color: active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
                  background: active ? "rgba(124, 58, 237, 0.08)" : "transparent",
                  letterSpacing: "0.1em",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
