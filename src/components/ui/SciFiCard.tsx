import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SciFiCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "none";
  label?: string;
  cornerAccent?: boolean;
}

export default function SciFiCard({
  children,
  className,
  glow = "none",
  label,
  cornerAccent = false,
}: SciFiCardProps) {
  const glowStyle =
    glow === "cyan"
      ? "0 0 20px rgba(0,212,255,0.12), 0 0 1px rgba(0,212,255,0.3)"
      : glow === "purple"
      ? "0 0 20px rgba(168,85,247,0.12), 0 0 1px rgba(168,85,247,0.3)"
      : "none";

  return (
    <div
      className={cn("relative rounded-lg overflow-hidden", className)}
      style={{
        background: "var(--color-space-card)",
        border: "1px solid var(--color-space-border)",
        boxShadow: glowStyle,
      }}
    >
      {/* Corner accent */}
      {cornerAccent && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4"
            style={{
              borderTop: "2px solid var(--color-neon-cyan)",
              borderLeft: "2px solid var(--color-neon-cyan)",
              borderRadius: "4px 0 0 0",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4"
            style={{
              borderBottom: "2px solid var(--color-neon-cyan)",
              borderRight: "2px solid var(--color-neon-cyan)",
              borderRadius: "0 0 4px 0",
            }}
          />
        </>
      )}

      {/* Label */}
      {label && (
        <div
          className="px-4 pt-3 pb-0"
          style={{
            fontFamily: "var(--font-space-mono), monospace",
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "var(--color-neon-cyan)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}

      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-4 sm:px-5 pt-4 pb-2", className)}>
      <div>
        <h2
          className="font-semibold text-sm tracking-wide"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
