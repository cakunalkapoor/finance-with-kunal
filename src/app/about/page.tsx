import BriefingHero from "@/components/ui/BriefingHero";
import Reveal from "@/components/ui/Reveal";
import ProfileHero from "@/components/about/ProfileHero";
import { PROFILE_DATA } from "@/lib/site-data";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Kunal Kapoor",
  description:
    "Kunal Kapoor is a Chartered Accountant and MBA with over a decade of experience in financial risk, compliance, and advisory across Canada and India.",
  path: "/about",
  keywords: ["Kunal Kapoor", "Chartered Accountant", "financial risk", "Vancouver finance"],
});

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbJsonLd items={[{ name: "About", path: "/about" }]} />
      <div className="mb-8">
        <BriefingHero
          eyebrow="About Kunal"
          title="Finance, risk, and decisions—connected."
          accent="violet"
          lastUpdated="—"
          nextUpdate="—"
        />
      </div>

      <Reveal>
        <ProfileHero data={PROFILE_DATA} />
      </Reveal>
    </div>
  );
}
