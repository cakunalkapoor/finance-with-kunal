"use client";

import { useSearchParams } from "next/navigation";
import type { EconomicIndicator, YieldCurve } from "@/types";
import { economyIndicators, economyScope, ECONOMY_COVERAGE, type EconomyScope } from "@/lib/economy-view";
import EconomyHeader from "./EconomyHeader";
import EconomyDashboard from "./EconomyDashboard";

interface Props {
  indicators: EconomicIndicator[];
  curves: YieldCurve[];
  additionalUpdatedLabel: string;
}

export function EconomyView({ indicators, curves, additionalUpdatedLabel, scope = "global", onScopeChange }: Props & {
  scope?: EconomyScope;
  onScopeChange?: (scope: EconomyScope) => void;
}) {
  const coverage = ECONOMY_COVERAGE.find(c => c.id === scope)!;
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <EconomyHeader scope={scope} eyebrow={scope === "global" ? "Global economy" : `${coverage.country} economy`} title="The economy, at a glance."
        description="Explore the world’s major economies, with sourced indicators and the context behind each release."
        onScopeChange={onScopeChange} updatedLabel={["global", "us", "canada"].includes(scope) ? undefined : additionalUpdatedLabel} />
      <EconomyDashboard scope={scope} indicators={economyIndicators(indicators, scope)}
        curve={curves.find(c => c.country === coverage.country)} />
    </div>
  );
}

export default function EconomyExperience(props: Props) {
  const params = useSearchParams();
  const requested = params.get("view");
  const scope = economyScope(requested);

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
