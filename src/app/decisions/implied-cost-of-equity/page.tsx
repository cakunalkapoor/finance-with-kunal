import ImpliedEquity from "@/components/decisions/ImpliedEquity";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Implied Cost of Equity Calculator", path: "/decisions/implied-cost-of-equity", description: "Solve the annual equity return implied by a share price and your earnings, payout and terminal assumptions. Explore growth sensitivity and valuation cash flows." });

export default function Page() {
  return <ImpliedEquity />;
}
