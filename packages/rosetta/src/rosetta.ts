import { ErrorExtendable } from "@packages/utils/errors";
import dlv from "dlv";
import tmpl from "templite";

type Key = string | number | bigint | symbol;

/**
 * @see https://github.com/microsoft/TypeScript/pull/40336
 */
type PropType<T, Path extends Key> = string extends Path
  ? unknown
  : Path extends keyof T
    ? T[Path]
    : Path extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? PropType<T[K], R>
        : unknown
      : unknown;

type ResolvePropType<T, Path extends Key> =
  PropType<T, Path> extends (...args: any[]) => infer R ? R : PropType<T, Path>;

type Join<T extends unknown[], D extends string> = T extends []
  ? ""
  : T extends [string | number | boolean | bigint]
    ? `${T[0]}`
    : T extends [string | number | boolean | bigint, ...infer U]
      ? `${T[0]}${D}${Join<U, D>}`
      : string;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly any[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface RosettaOptions {
  strict?: boolean;
}

export type RosettaDict<T> = Record<string, DeepPartial<T>>;

export class RosettaImpl<T> {
  public static readonly MISSING = Symbol("missing");

  protected constructor(
    public readonly tree: Map<string, T>,
    public readonly locale: string,
    public readonly options: RosettaOptions = {},
  ) {
    this.locale = RESOLVE_DICTIONARY_LOCALE(locale, Array.from(tree.keys()));
  }

  /**
   * Returns new instance with given locale. Safe to pass as callback — arrow preserves `this`.
   * @example
   * const es = rosetta.withLocale("es");
   * const locales = ["en", "es", "pt"].map(rosetta.withLocale);
   */
  public withLocale = (lang: string): RosettaImpl<T> => {
    return new RosettaImpl(this.tree, lang, this.options);
  };

  /**
   * Builds instance from a locale dictionary, merging dot-notated keys and overlapping locales.
   * @example
   * const rosetta = RosettaImpl.fromDictionary(
   *   { en: { greeting: "Hello, {{name}}!" }, es: { greeting: "¡Hola, {{name}}!" } },
   *   "en",
   * );
   */
  public static fromDictionary<T>(dict: RosettaDict<T>, locale: string, options?: RosettaOptions): RosettaImpl<T> {
    const expanded = OBJECT_EXPAND_DOTTED_KEYS(dict as unknown as Record<string, unknown>);
    const merged = MERGE_LOCALES(expanded);
    return new RosettaImpl<T>(new Map<string, T>(Object.entries(merged) as any), locale, options);
  }

  /**
   * Resolves a translation key, interpolating `params`. Falls back to `""` unless `strict` mode throws on missing.
   * @example
   * rosetta.t("greeting", { name: "Ana" })          // "Hello, Ana!"
   * rosetta.t(["user", "role"], undefined, "es")     // dot-path via array, forced locale
   */
  public t = <P extends Key | Key[], X extends Record<string, any> | any[] = Record<string, any> | any[]>(
    key: P,
    params?: X,
    lang?: string,
  ): P extends Key[] ? ResolvePropType<T, Join<P, ".">> : P extends Key ? ResolvePropType<T, P> : any => {
    const activeLocale = lang ? RESOLVE_DICTIONARY_LOCALE(lang, Array.from(this.tree.keys())) : this.locale;
    const target = (activeLocale && this.tree.get(activeLocale)) || ({} as unknown as T);
    const defaultValue = this.options.strict ? RosettaImpl.MISSING : "";
    const val = dlv(target as any, key as any, defaultValue);

    if (val === RosettaImpl.MISSING) {
      throw new Error(`Rosetta: missing translation for key "${String(key)}" in locale "${activeLocale || "<unset>"}"`);
    }

    if (typeof val === "function") return val(params) as any;
    if (typeof val === "string") return tmpl(val, params ?? {}) as any;
    return val as any;
  };

  public get TError() {
    const t = this.t;
    type TParams = Parameters<typeof t>;
    return class TError extends ErrorExtendable {
      constructor(key: TParams[0], params?: TParams[1], cause?: unknown) {
        super(t(key, params) as string, cause !== undefined ? { cause } : undefined);
      }
    };
  }
}

function OBJECT_IS_PLAIN(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function OBJECT_EXPAND_DOTTED_KEYS(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.includes(".")) {
      const segments = key.split(".");
      let cursor = result;
      segments.forEach((seg, index) => {
        if (index === segments.length - 1) {
          cursor[seg] = OBJECT_IS_PLAIN(value) ? OBJECT_EXPAND_DOTTED_KEYS(value as Record<string, unknown>) : value;
        } else {
          if (!OBJECT_IS_PLAIN(cursor[seg])) cursor[seg] = {};
          cursor = cursor[seg] as Record<string, unknown>;
        }
      });
    } else if (OBJECT_IS_PLAIN(value)) {
      result[key] = OBJECT_EXPAND_DOTTED_KEYS(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function OBJECT_MERGE_DEEP_INTO(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (OBJECT_IS_PLAIN(value)) {
      if (!OBJECT_IS_PLAIN(target[key])) target[key] = {};
      OBJECT_MERGE_DEEP_INTO(target[key] as Record<string, unknown>, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function MERGE_LOCALES(dict: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...dict };
  for (const locale of Object.keys(dict)) {
    const separator = locale.includes("-") ? "-" : locale.includes("_") ? "_" : null;
    if (!separator) continue;
    const baseLanguage = locale.split(separator)[0];
    if (!baseLanguage || baseLanguage === locale) continue;
    if (baseLanguage in dict) {
      const baseCopy = structuredClone(dict[baseLanguage]) as Record<string, unknown>;
      result[locale] = OBJECT_MERGE_DEEP_INTO(baseCopy, dict[locale] as Record<string, unknown>);
    }
  }
  return result;
}

function RESOLVE_DICTIONARY_LOCALE(locale: string, keys: string[]): string {
  if (!locale || keys.length === 0) {
    throw new Error(`Rosetta: unsupported locale "${locale || "<unset>"}". Dictionary is empty.`);
  }

  const normalizedLocale = LOCALE_TAG_NORMALIZE(locale);
  const normalizedKeys = keys.map((key) => ({
    original: key,
    normalized: LOCALE_TAG_NORMALIZE(key),
  }));

  const exactMatch = normalizedKeys.find((key) => key.normalized === normalizedLocale);
  if (exactMatch) return exactMatch.original;

  const languageCode = normalizedLocale.split("-")[0];
  if (languageCode) {
    const baseMatch = normalizedKeys.find((key) => key.normalized === languageCode);
    if (baseMatch) return baseMatch.original;
  }

  throw new Error(
    `Rosetta: unsupported locale "${locale}". Available dictionary locales: ${keys.join(", ") || "<none>"}.`,
  );
}

function LOCALE_TAG_NORMALIZE(locale: string): string {
  return locale.replace(/_/g, "-").trim().toLowerCase();
}
