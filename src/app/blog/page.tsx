import { BookOpen } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Blog — Finance with Kunal",
  description: "Finance commentary, market analysis, and economic perspectives by Kunal Kapoor.",
};

export default function BlogPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <PageHeader
          label="Blog"
          labelColor="var(--color-neon-cyan)"
          title="Coming Soon"
          lastUpdated="—"
          nextUpdate="—"
        />
      </div>

      <div
        className="flex flex-col items-center justify-center py-24 rounded-xl text-center"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(129,140,248,0.03) 100%)",
          border: "1px dashed rgba(167,139,250,0.25)",
        }}
      >
        <div
          className="mb-6 p-4 rounded-full"
          style={{ background: "rgba(167,139,250,0.1)" }}
        >
          <BookOpen size={32} style={{ color: "var(--color-neon-cyan)" }} />
        </div>

        <h2
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
        >
          Blog Coming Soon
        </h2>

        <p
          className="text-sm max-w-md leading-relaxed mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Deeper Insights, Coming Soon
        </p>

        <p
          className="text-xs"
          style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
        >
          Check back soon.
        </p>
      </div>
    </div>
  );
}
