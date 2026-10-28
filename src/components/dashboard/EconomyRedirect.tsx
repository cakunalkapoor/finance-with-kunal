"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EconomyScope } from "@/lib/economy-view";

/** Static-host compatible forwarding for old economy bookmarks. */
export default function EconomyRedirect({ scope = "global" }: { scope?: EconomyScope }) {
  const router = useRouter();
  const href = scope === "global" ? "/dashboard/" : `/dashboard/?view=${scope}`;
  useEffect(() => { router.replace(href); }, [router, href]);
  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>One Economy dashboard</h1>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Global, US and Canada views are now together.</p>
      <Link href={href} className="inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-sm font-semibold" style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-space-border)" }}>Open Economy →</Link>
    </div>
  );
}
