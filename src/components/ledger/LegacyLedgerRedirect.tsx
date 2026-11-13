"use client";

import { useEffect } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/utils";

/** Forward old bookmarks on static hosting, including query strings and anchors. */
export default function LegacyLedgerRedirect({ href }: { href: string }) {
  const target = withBasePath(href);

  useEffect(() => {
    window.location.replace(`${target}${window.location.search}${window.location.hash}`);
  }, [target]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 px-4 py-20 text-center">
      <noscript><meta httpEquiv="refresh" content={`0;url=${target}`} /></noscript>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>The Ledger has moved</h1>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Continue to the article or collection at its new address.</p>
      <Link href={href} className="inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-sm font-semibold"
        style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-space-border)" }}>
        Continue to The Ledger →
      </Link>
    </div>
  );
}
