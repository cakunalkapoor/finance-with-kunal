import CarDecision from "@/components/decisions/CarDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Car: Buy vs Lease", path: "/decisions/buy-vs-lease", description: "Compare car ownership and leasing over the same lease term, including resale value, mileage and fees." });
export default function CarComparisonPage() { return <CarDecision />; }
