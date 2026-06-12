import type { RosettaDict } from "@packages/rosetta/rosetta";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

/**
 * Resolves the `t` translator and `TError` constructor for the current server locale.
 *
 * @example
 * const { t, TError } = await getRosetta({ es: { hello: "Hola" }, en: { hello: "Hello" } });
 * t("hello"); // "Hola" | "Hello"
 * throw new TError("hello", {}, cause);
 */
export async function getRosetta<T>(dict: RosettaDict<T>, locale?: string) {
  const requestedLocale = locale ?? (await getServerLocale());
  const rosetta = ROSETTA(dict, requestedLocale);
  return {
    locale: requestedLocale,
    t: rosetta.t,
    TError: rosetta.TError,
  };
}
