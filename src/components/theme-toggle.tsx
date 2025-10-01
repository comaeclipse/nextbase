"use client";

import { useTheme } from "@/components/theme-provider";
import { useMemo, useState } from "react";

type ToggleSize = "sm" | "md";

export function ThemeToggle({ size = "md" }: { size?: ToggleSize }) {
  const { theme, toggleTheme } = useTheme();
  const [isHovering, setHovering] = useState(false);

  const dimension = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  const icon = useMemo(() => {
    if (theme === "dark") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="size-5"
          aria-hidden
        >
          <path
            d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        className="size-5"
        aria-hidden
      >
        <circle cx={12} cy={12} r={4} />
        <path strokeLinecap="round" d="m3 12 1.5 .75M12 3v1M21 12l-1.5 .75M12 20v1" />
        <path strokeLinecap="round" d="m5.5 5.5 1.35 1.35M18.5 5.5l-1.35 1.35M18.5 18.5l-1.35-1.35M5.5 18.5l1.35-1.35" />
      </svg>
    );
  }, [theme]);

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative inline-flex ${dimension} items-center justify-center rounded-full border border-transparent transition-all duration-300 ease-out`}
      style={{
        background: isHovering
          ? "color-mix(in srgb, var(--accent) 18%, transparent)"
          : "color-mix(in srgb, var(--surface-elevated) 95%, transparent)",
        color: "var(--text-primary)",
        boxShadow: isHovering ? "var(--shadow-soft)" : "none",
      }}
    >
      <span className="absolute inset-0 rounded-full border opacity-40" />
      {icon}
    </button>
  );
}
