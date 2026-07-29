import { EXTERNAL_COMMENTARY } from "@/lib/site-data";
import { FONT_MONO } from "@/lib/utils";

export default function TrendingHeadlines() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-5 max-w-2xl">
          <p className="text-[10px] font-bold uppercase" style={{ color: "var(--color-neon-purple)", fontFamily: FONT_MONO, letterSpacing: "0.14em" }}>Outside perspective</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>Ideas worth tracking</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>Selected external commentary that adds context to the week’s market and economic story.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXTERNAL_COMMENTARY.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--color-space-card)",
                border: "1px solid var(--color-space-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    color: "var(--color-neon-cyan)",
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.category.toUpperCase()}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {item.source}
                </span>
              </div>

              <h3
                className="font-bold text-sm leading-snug"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.title}
              </h3>

              <p
                className="text-xs leading-relaxed line-clamp-3 flex-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.excerpt}
              </p>

              <div
                className="flex items-center justify-between mt-auto pt-2"
                style={{ borderTop: "1px solid var(--color-space-border)" }}
              >
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
                >
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
