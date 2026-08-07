"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FONT_MONO } from "@/lib/utils";

const DESTINATIONS = [
  { href: "/us-economy", label: "US Economy" },
  { href: "/canada-economy", label: "Canada Economy" },
];

// The combined US + Canada page was split in two. Forward automatically, but
// still render the links so the page works without JS and for anyone who
// landed here from an old bookmark.
export default function RedirectNotice() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/us-economy");
  }, [router]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
      <p
        className="text-[11px] font-bold uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.12em",
          color: "var(--color-text-muted)",
        }}
      >
        This page has moved
      </p>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        US and Canada now have their own pages.
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {DESTINATIONS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-full px-5 py-2 text-[11px] font-bold uppercase"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.1em",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-space-border)",
              background: "var(--color-space-card)",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
