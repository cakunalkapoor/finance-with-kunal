import EconomyRedirect from "@/components/dashboard/EconomyRedirect";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "US Economy",
  description: "Global, US and Canadian economic indicators are now together in one Economy dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default function LegacyEconomyPage() {
  return <EconomyRedirect scope="us" />;
}
