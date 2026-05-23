"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "light", label: "Tema claro", Icon: Sun },
  { value: "system", label: "Tema del sistema", Icon: Monitor },
  { value: "dark", label: "Tema oscuro", Icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch — server renders without knowing the theme; we only
  // light up the active segment after mounting on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="bg-card text-card-foreground border-border fixed top-4 right-4 z-50 inline-flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
