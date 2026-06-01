"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Light/dark theme toggle. The actual theme class (`dark`) is applied to
 * <html> by an inline script in the root layout *before* paint (no flash);
 * this button just flips that class and persists the choice to localStorage.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Read the theme the pre-paint script already applied, after hydration.
  useEffect(() => {
    setMounted(true);
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
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
      className="p-1.5 rounded transition-colors hover:opacity-80"
      style={{
        color: "var(--color-text-secondary)",
        border: "1px solid var(--color-space-border)",
        background: "transparent",
      }}
    >
      {/* Render a stable (invisible) icon until mounted to avoid hydration mismatch */}
      {mounted ? (
        isDark ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )
      ) : (
        <Moon size={16} style={{ opacity: 0 }} />
      )}
    </button>
  );
}
