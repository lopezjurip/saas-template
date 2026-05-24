import { cookies } from "next/headers";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_COOKIE, type SupportedLocale } from "./i18n";

export async function getServerLocale(): Promise<SupportedLocale> {
  const c = await cookies();
  const value = c.get(LOCALE_COOKIE)?.value;
  return IS_SUPPORTED_LOCALE(value) ? value : DEFAULT_LOCALE;
}
