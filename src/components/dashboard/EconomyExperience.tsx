"use client";

import { useSearchParams } from "next/navigation";
import type { EconomicIndicator, YieldCurve } from "@/types";
import { economyIndicators, type EconomyScope } from "@/lib/economy-view";
import EconomyHeader from "./EconomyHeader";
import EconomyDashboard from "./EconomyDashboard";

interface Props {
  indicators: EconomicIndicator[];
  curves: YieldCurve[];
}

const COVERAGE = {
  global: { eyebrow: "Global economy", country: null },
  us: { eyebrow: "United States economy", country: "United States" },
  canada: { eyebrow: "Canadian economy", country: "Canada" },
} as const;

export function EconomyView({ indicators, curves, scope = "global", onScopeChange }: Props & {
  scope?: EconomyScope;
  onScopeChange?: (scope: EconomyScope) => void;
}) {
  const coverage = COVERAGE[scope];
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <EconomyHeader scope={scope} eyebrow={coverage.eyebrow} title="The economy, at a glance."
        description="Explore global, US and Canadian economic indicators, with the context behind each release."
        onScopeChange={onScopeChange} />
      <EconomyDashboard scope={scope} indicators={economyIndicators(indicators, scope)}
        curve={curves.find(c => c.country === coverage.country)} />
    </div>
  );
}

export default function EconomyExperience(props: Props) {
  const params = useSearchParams();
  const requested = params.get("view");
  const scope: EconomyScope = requested === "us" || requested === "canada" ? requested : "global";

  function changeScope(next: EconomyScope) {
    if (next === scope) return;
    const query = new URLSearchParams(params.toString());
    if (next === "global") query.delete("view");
    else query.set("view", next);
    const search = query.toString();
    window.history.pushState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }

  return <EconomyView {...props} scope={scope} onScopeChange={changeScope} />;
}
