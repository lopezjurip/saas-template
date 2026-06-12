"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { useRosetta } from "~/hooks/use-rosetta";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_LABEL, SUPPORTED_LOCALES, type SupportedLocale } from "~/lib/i18n";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";

const LOCALE_ES = {
  group: "Idioma",
};

const LOCALES = {
  es: LOCALE_ES,
  en: { group: "Language" } satisfies typeof LOCALE_ES,
  pt: { group: "Idioma" } satisfies typeof LOCALE_ES,
};

export function LocaleToggle() {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const [pending, startTransition] = useTransition();
  const [_, setLocale] = useLocaleCookie();

  const current = IS_SUPPORTED_LOCALE(params?.locale) ? params.locale : DEFAULT_LOCALE;

  function selectLocale(next: SupportedLocale) {
    if (next === current) return;
    // Fire-and-forget: the proxy re-sets this cookie (1yr) on the next request, so the bare write is enough.
    setLocale(next);
    // <html lang> is rendered by the root layout; soft navigation doesn't re-render it, so update
    // the live DOM here so screen readers / spellcheck pick up the new language immediately.
    document.documentElement.lang = next;
    const nextPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    startTransition(() => router.replace(ROUTE_HREF(UNSAFE_ROUTE(nextPath))));
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("group")}
      aria-busy={pending}
      className="bg-card text-card-foreground border-border inline-flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm"
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
