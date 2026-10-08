import HousingDecision from "@/components/decisions/HousingDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Home: Buy vs Rent", path: "/decisions/buy-vs-rent", description: "Compare buying and renting a home with your own costs and assumptions." });
export default function HomeComparisonPage() { return <HousingDecision />; }
