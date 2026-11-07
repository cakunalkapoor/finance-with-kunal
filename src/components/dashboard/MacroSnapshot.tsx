import { Activity, BadgeDollarSign, BriefcaseBusiness } from "lucide-react";
import { economicPeriod } from "@/lib/economy-view";
import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import { FONT_MONO, formatEconomicValue } from "@/lib/utils";

const COUNTRIES = [
  {
    name: "United States",
    metrics: [
      { id: "us-cpi", label: "CPI inflation", basis: "YoY · adjusted index", icon: BadgeDollarSign },
      { id: "us-gdp", label: "Real GDP growth", basis: "QoQ annualized", icon: Activity },
      { id: "us-payrolls", label: "Nonfarm payrolls", basis: "Jobs · monthly change", icon: BriefcaseBusiness },
    ],
  },
  {
    name: "Canada",
    metrics: [
      { id: "ca-cpi", label: "CPI inflation", basis: "YoY", icon: BadgeDollarSign },
      { id: "ca-gdp", label: "Real GDP growth", basis: "QoQ", icon: Activity },
      { id: "ca-payrolls", label: "Employment", basis: "Jobs · monthly change", icon: BriefcaseBusiness },
    ],
  },
];

export default function MacroSnapshot() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {COUNTRIES.map(({ name, metrics }) => (
        <section key={name}>
          <h3 className="mb-3 text-base font-bold text-text-primary">{name}</h3>
          <dl className="grid grid-cols-3 gap-px border border-space-border bg-space-border">
            {metrics.map(({ id, label, basis, icon: Icon }) => {
              const indicator = ECONOMIC_INDICATORS.find(entry => entry.id === id);
              const value = indicator && formatEconomicValue(indicator.value, indicator.category, indicator.unit);
              const displayValue = !indicator ? "—" : indicator.unit === "K MoM"
                ? `${indicator.value > 0 ? "+" : ""}${value}K`
                : `${value}%`;

              return (
                <div key={id} className="flex min-w-0 flex-col gap-2 bg-space-card px-2.5 py-3 sm:px-4 sm:py-4">
                  <dt className="text-xs font-semibold text-text-primary sm:text-sm">
                    <Icon size={16} aria-hidden="true" className="mb-2 text-neon-cyan" />
                    {label}
                  </dt>
                  <dd className="mt-auto">
                    <p className="whitespace-nowrap text-xl font-bold tracking-tight text-text-primary sm:text-2xl" style={{ fontFamily: FONT_MONO }}>
                      {displayValue}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-secondary">
                      {indicator ? economicPeriod(indicator) : "Period unavailable"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-text-secondary">{basis}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
