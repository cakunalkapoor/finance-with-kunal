import HousingDecision from "@/components/decisions/HousingDecision";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Decision Studio", path: "/decisions",
  description: "Explore the financial trade-offs of buying or renting a home with your own assumptions.",
});

export default function DecisionsPage() {
  return <HousingDecision />;
}
