import SmithManoeuvre from "@/components/decisions/SmithManoeuvre";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Smith Manoeuvre Simulator", path: "/decisions/smith-manoeuvre", description: "Explore a Canadian Smith Manoeuvre strategy against a scheduled mortgage, including HELOC debt, investment returns, tax assumptions and cash costs." });

export default function Page() {
  return <SmithManoeuvre />;
}
