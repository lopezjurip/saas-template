"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import {
  DEFAULT_LOCALE,
  IS_SUPPORTED_LOCALE,
  LOCALE_COOKIE,
  LOCALE_LABEL,
  LOCALE_TO_BCP47,
  SUPPORTED_LOCALES,
} from "~/lib/i18n";

const LOCALE_ES = {
  group: "Idioma",
};

const LOCALES = {
  es: LOCALE_ES,
  en: { group: "Language" } satisfies typeof LOCALE_ES,
};

export function LocaleToggle() {
  const r = useRosetta(LOCALES);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const [pending, startTransition] = useTransition();

  const current = IS_SUPPORTED_LOCALE(params?.locale) ? params.locale : DEFAULT_LOCALE;

  function selectLocale(next: (typeof SUPPORTED_LOCALES)[number]) {
    if (next === current) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    // <html lang> is rendered by the root layout; soft navigation doesn't re-render it, so update
    // the live DOM here so screen readers / spellcheck pick up the new language immediately.
    document.documentElement.lang = LOCALE_TO_BCP47[next];
    const nextPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    startTransition(() => router.push(nextPath));
  }

  return (
    <div
      role="radiogroup"
      aria-label={r.t("group")}
      aria-busy={pending}
      className="bg-card text-card-foreground border-border inline-flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm"
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
              "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
