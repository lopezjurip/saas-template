import "server-only";

import { match } from "@formatjs/intl-localematcher";
import type { RosettaDict } from "@packages/rosetta/rosetta";
import Negotiator from "negotiator";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  IS_SUPPORTED_LOCALE,
  LOCALE_COOKIE,
  LOCALE_SUPPORTED_RESOLVE,
  ROSETTA,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "./i18n";

export async function getServerLocale(): Promise<SupportedLocale> {
  const c = await cookies();
  const value = c.get(LOCALE_COOKIE)?.value;
  return LOCALE_SUPPORTED_RESOLVE(value) || DEFAULT_LOCALE;
}

export function assertLocale(value: unknown): asserts value is SupportedLocale {
  if (!IS_SUPPORTED_LOCALE(value)) {
    notFound();
  }
}

export function LOCALE_FROM_REQUEST(request: NextRequest): SupportedLocale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const resolvedCookie = LOCALE_SUPPORTED_RESOLVE(cookie);
  if (resolvedCookie) {
    return resolvedCookie;
  }
  const resolvedHeader = HEADER_ACCEPT_LANGUAGE_PARSE(request.headers.get("accept-language"));
  if (resolvedHeader) {
    return resolvedHeader;
  }
  return DEFAULT_LOCALE;
}

export function HEADER_ACCEPT_LANGUAGE_PARSE(header: string | null): SupportedLocale | null {
  if (!header) return null;

  const requestedLocales = new Negotiator({
    headers: {
      "accept-language": header,
    },
  }).languages();

  if (requestedLocales.length === 0) return null;

  try {
    return match(requestedLocales, SUPPORTED_LOCALES, DEFAULT_LOCALE) as SupportedLocale;
  } catch {
    return null;
  }
}
