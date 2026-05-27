"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowUpRight, ChevronDown, Globe, HelpCircle, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useTransition } from "react";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { useRosetta } from "~/hooks/use-rosetta";
import { LOCALE_COOKIE, LOCALE_LABEL, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";

export function SettingsMenu({
  locale,
  settingsHref,
  compact,
}: {
  locale: string;
  settingsHref: string;
  compact?: boolean;
}) {
  const { t } = useRosetta(LOCALES);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && (resolvedTheme ?? "light") === "dark";

  const themeOptions = [
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
    { value: "system", label: t("themeSystem") },
  ];
  const themeLabel = mounted ? (themeOptions.find((option) => option.value === theme)?.label ?? "") : "";
  const localeLabel = LOCALE_LABEL[locale as keyof typeof LOCALE_LABEL] ?? locale;

  const onChangeLocale = (next: string) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.documentElement.lang = LOCALE_TO_BCP47[next as keyof typeof LOCALE_TO_BCP47] ?? next;
    const nextPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    startTransition(() => router.replace(nextPath));
  };

  const trigger = compact ? (
    <Tip label={t("trigger")} disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-open={open}
        className="text-foreground/80 hover:bg-accent/60 hover:text-foreground data-[open=true]:bg-accent flex h-9 w-9 items-center justify-center rounded-md transition-colors"
      >
        <SettingsIcon size={16} />
      </button>
    </Tip>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      data-open={open}
      className="text-foreground/80 hover:bg-accent/60 hover:text-foreground data-[open=true]:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
    >
      <SettingsIcon size={15} className="text-muted-foreground" />
      <span className="flex-1">{t("trigger")}</span>
    </button>
  );

  return (
    <div className="relative" ref={ref} aria-busy={pending}>
      {trigger}
      {open && (
        <div
          className={cn(
            "border-border bg-card text-card-foreground overflow-hidden rounded-md border shadow-lg",
            compact ? "absolute bottom-0 left-full z-40 ml-2 w-64" : "absolute bottom-full left-0 right-0 z-30 mb-1.5",
          )}
        >
          <div className="text-muted-foreground px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider">
            {t("heading")}
          </div>
          <div className="px-1 pb-1">
            <label className="hover:bg-accent relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
              {dark ? (
                <Moon size={14} className="text-muted-foreground" />
              ) : (
                <Sun size={14} className="text-muted-foreground" />
              )}
              <span className="flex-1">{t("theme")}</span>
              <span className="text-muted-foreground text-xs">{themeLabel}</span>
              <ChevronDown size={11} className="text-muted-foreground" />
              <select
                aria-label={t("theme")}
                value={mounted ? (theme ?? "system") : "system"}
                onChange={(event) => setTheme(event.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none bg-transparent opacity-0"
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="hover:bg-accent relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
              <Globe size={14} className="text-muted-foreground" />
              <span className="flex-1">{t("language")}</span>
              <span className="text-muted-foreground text-xs">{localeLabel}</span>
              <ChevronDown size={11} className="text-muted-foreground" />
              <select
                aria-label={t("language")}
                value={locale}
                onChange={(event) => onChangeLocale(event.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none bg-transparent opacity-0"
              >
                {SUPPORTED_LOCALES.map((value) => (
                  <option key={value} value={value}>
                    {LOCALE_LABEL[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="border-border border-t px-1 py-1">
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <SettingsIcon size={14} className="text-muted-foreground" />
              <span>{t("openSettings")}</span>
            </Link>
            <button
              type="button"
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => setOpen(false)}
            >
              <HelpCircle size={14} className="text-muted-foreground" />
              <span className="flex-1">{t("help")}</span>
              <ArrowUpRight size={12} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  trigger: "Configuración",
  heading: "Preferencias",
  theme: "Tema",
  themeLight: "Claro",
  themeDark: "Oscuro",
  themeSystem: "Sistema",
  language: "Idioma",
  openSettings: "Abrir configuración",
  help: "Ayuda y documentación",
};

const LOCALE_EN: typeof LOCALE_ES = {
  trigger: "Settings",
  heading: "Preferences",
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  language: "Language",
  openSettings: "Open settings",
  help: "Help & docs",
};

const LOCALE_PT: typeof LOCALE_ES = {
  trigger: "Configurações",
  heading: "Preferências",
  theme: "Tema",
  themeLight: "Claro",
  themeDark: "Escuro",
  themeSystem: "Sistema",
  language: "Idioma",
  openSettings: "Abrir configurações",
  help: "Ajuda e documentação",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
