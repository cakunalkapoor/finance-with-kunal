import HousingDecision from "@/components/decisions/HousingDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Buy or Rent? A Simple Comparison", path: "/decisions/buy-vs-rent", description: "Compare monthly rent and ownership bills, upfront cash, and investing the difference. A simple rent-versus-buy calculator with clear costs and home equity." });
export default function HomeComparisonPage() { return <HousingDecision />; }
