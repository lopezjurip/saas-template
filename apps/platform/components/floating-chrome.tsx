"use client";

import { usePathname } from "next/navigation";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
import { SUPPORTED_LOCALES } from "~/lib/i18n";

// Routes whose layout renders its own theme/locale controls — hide the floating fallback there.
const LOCALES_GROUP = SUPPORTED_LOCALES.join("|");
const SHELL_PATH_PATTERN = new RegExp(`^/(?:${LOCALES_GROUP})/[^/]+/\\d+(?:/|$)`);
const MARKETING_PATH_PATTERN = new RegExp(`^/(?:${LOCALES_GROUP})(?:/(?:pricing|faq|legal)(?:/|$)|/?$)`);

export function FloatingChrome() {
  const pathname = usePathname();
  if (SHELL_PATH_PATTERN.test(pathname)) return null;
  if (MARKETING_PATH_PATTERN.test(pathname)) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <LocaleToggle />
      <ThemeToggle />
    </div>
  );
}
