"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/ai", label: "AI" },
  { href: "/dashboard", label: "Economy" },
  { href: "/us-economy", label: "US" },
  { href: "/canada-economy", label: "Canada" },
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
      <div className="section-shell flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <Logo />
          <span
            className="text-sm font-bold"
            style={{
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Finance <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>with</span> Kunal
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
                data-active={active ? "true" : "false"}
                className="nav-link relative px-3 py-2 pb-3 text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.1em" }}
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
            className="rounded-full p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            style={{
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-space-border)",
            }}
          >
            {menuOpen ? (
              <X size={18} className="animate-icon-swap" />
            ) : (
              <Menu size={18} className="animate-icon-swap" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="animate-menu-drop md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            background: "var(--color-nav-bg-solid)",
            borderColor: "var(--color-space-border)",
          }}
        >
          {NAV_LINKS.map((link, index) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded text-xs font-semibold tracking-widest uppercase"
                style={{
                  color: active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
                  background: active ? "var(--color-wash)" : "transparent",
                  letterSpacing: "0.1em",
                  "--item-index": index,
                } as CSSProperties}
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
