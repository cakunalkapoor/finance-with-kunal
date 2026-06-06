import PageHeader from "@/components/ui/PageHeader";
import ProfileHero from "@/components/about/ProfileHero";
import ExperienceTimeline from "@/components/about/ExperienceTimeline";
import EducationSection from "@/components/about/EducationSection";
import SkillsGrid from "@/components/about/SkillsGrid";
import { PROFILE_DATA } from "@/lib/mock-data";

export const metadata = {
  title: "About Me — Finance with Kunal",
  description:
    "Kunal Kapoor is a Chartered Accountant and MBA with over a decade of experience in financial risk, compliance, and advisory across Canada and India.",
};

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <PageHeader
          label="Profile"
          labelColor="var(--color-neon-cyan)"
          title="About Me"
          lastUpdated="—"
          nextUpdate="—"
        />
      </div>

      <ProfileHero data={PROFILE_DATA} />
      <ExperienceTimeline items={PROFILE_DATA.experience} />
      <EducationSection items={PROFILE_DATA.education} />
      <SkillsGrid categories={PROFILE_DATA.skills} />
    </div>
  );
}
