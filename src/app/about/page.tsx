import BriefingHero from "@/components/ui/BriefingHero";
import Reveal from "@/components/ui/Reveal";
import ProfileHero from "@/components/about/ProfileHero";
import { PROFILE_DATA } from "@/lib/site-data";

export const metadata = {
  title: "About Me — Finance with Kunal",
  description:
    "Kunal Kapoor is a Chartered Accountant and MBA with over a decade of experience in financial risk, compliance, and advisory across Canada and India.",
};

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
