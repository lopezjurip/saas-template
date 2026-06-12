import "server-only";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_CONFIG, LOCALE_COOKIE, type SupportedLocale } from "./i18n";

export async function getServerLocale(): Promise<SupportedLocale> {
  const c = await cookies();
  const value = c.get(LOCALE_COOKIE)?.value;
  return IS_SUPPORTED_LOCALE(value) ? value : DEFAULT_LOCALE;
}

export function assertLocale(value: unknown): asserts value is SupportedLocale {
  if (!LOCALE_CONFIG.isSupported(value)) notFound();
}

export function RESOLVE_LOCALE_FROM_REQUEST(request: NextRequest): SupportedLocale {
  return LOCALE_CONFIG.resolveFromRequest(request);
}
