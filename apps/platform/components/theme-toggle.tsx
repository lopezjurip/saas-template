"use client";

import { useMounted } from "@packages/react-hooks/use-mounted";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { useRosetta } from "~/lib/i18n.client";

/**
 * Theme toggle component allowing users to switch between light, dark, and system themes.
 * Avoids hydration mismatch by only lighting up the active segment after mounting on the client.
 */
export function ThemeToggle({ className, ...props }: ComponentProps<"div">) {
  const { t } = useRosetta(LOCALES);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const OPTIONS = [
    { value: "light", label: t("light"), Icon: Sun },
    { value: "system", label: t("system"), Icon: Monitor },
    { value: "dark", label: t("dark"), Icon: Moon },
  ] as const;

  return (
    <div
      {...props}
      role="radiogroup"
      aria-label={t("group")}
      className={cn(
        "bg-card text-card-foreground border-border inline-flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm",
        className,
      )}
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

const LOCALE_ES = {
  group: "Tema",
  light: "Tema claro",
  system: "Tema del sistema",
  dark: "Tema oscuro",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    group: "Theme",
    light: "Light theme",
    system: "System theme",
    dark: "Dark theme",
  } satisfies typeof LOCALE_ES,
  pt: {
    group: "Tema",
    light: "Tema claro",
    system: "Tema do sistema",
    dark: "Tema escuro",
  } satisfies typeof LOCALE_ES,
};
