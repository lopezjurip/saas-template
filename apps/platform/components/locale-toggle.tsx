"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { useTransition } from "react";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES, type SupportedLocale } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";

/**
 * Locale toggle component allowing users to switch between supported languages.
 * Writes the NEXT_LOCALE cookie and refreshes the tree; locale is not part of the URL.
 */
export function LocaleToggle({ className, ...props }: ComponentProps<"div">) {
  const { t } = useRosetta(LOCALES);
  const [pending, startTransition] = useTransition();
  const [current, setLocale] = useLocaleCookie();

  /**
   * Changes the locale: persists the cookie and re-renders (handled inside useLocaleCookie).
   */
  function selectLocale(next: SupportedLocale) {
    if (next === current) return;
    startTransition(() => setLocale(next));
  }

  return (
    <div
      {...props}
      role="radiogroup"
      aria-label={t("group")}
      aria-busy={pending}
      className={cn(
        "bg-card text-card-foreground border-border inline-flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm",
        className,
      )}
      data-component="LocaleToggle"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LOCALE_LABEL[locale]}
            title={LOCALE_LABEL[locale]}
            onClick={() => selectLocale(locale)}
            className={cn(
              "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-tiny font-semibold uppercase tracking-wide transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {locale.slice(0, 2).toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

const LOCALE_ES = {
  group: "Idioma",
};

const LOCALES = {
  es: LOCALE_ES,
  en: { group: "Language" } satisfies typeof LOCALE_ES,
  pt: { group: "Idioma" } satisfies typeof LOCALE_ES,
};
