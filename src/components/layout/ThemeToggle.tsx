"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

/**
 * Light/dark theme toggle. The actual theme class (`dark`) is applied to
 * <html> by an inline script in the root layout *before* paint (no flash);
 * this button just flips that class and persists the choice to localStorage.
 */
export default function ThemeToggle() {
  const theme = useTheme();

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable — toggle still works for the session */
    }
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-full p-2 transition-colors hover:opacity-80"
      style={{
        color: "var(--color-text-secondary)",
        border: "1px solid var(--color-space-border)",
        background: "transparent",
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
