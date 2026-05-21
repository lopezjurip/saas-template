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
    this.locale = NORMALIZE_LOCALE(locale, Array.from(tree.keys()))!;
  }

  public withLocale = (lang: string): RosettaImpl<T> => {
    return new RosettaImpl(this.tree, lang, this.options);
  };

  public static fromDictionary<T>(dict: RosettaDict<T>, locale: string, options?: RosettaOptions): RosettaImpl<T> {
    const expanded = OBJECT_EXPAND_DOTTED_KEYS(dict as unknown as Record<string, unknown>);
    const merged = MERGE_LOCALES(expanded);
    return new RosettaImpl<T>(new Map<string, T>(Object.entries(merged) as any), locale, options);
  }

  public t = <P extends Key | Key[], X extends Record<string, any> | any[] = Record<string, any> | any[]>(
    key: P,
    params?: X,
    lang?: string,
  ): P extends Key[] ? ResolvePropType<T, Join<P, ".">> : P extends Key ? ResolvePropType<T, P> : any => {
    const activeLocale = lang || this.locale;
    const target = (activeLocale && this.tree.get(activeLocale)) || ({} as unknown as T);
    const defaultValue = this.options.strict ? RosettaImpl.MISSING : "";
    const val = dlv(target as any, key as any, defaultValue);

    if (val === RosettaImpl.MISSING) {
      throw new Error(`Rosetta: missing translation for key "${String(key)}" in locale "${activeLocale || "<unset>"}"`);
    }

    if (typeof val === "function")
      return val(params) as any;
    if (typeof val === "string")
      return tmpl(val, params ?? {}) as any;
    return val as any;
  };
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

function DEEP_CLONE(obj: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (OBJECT_IS_PLAIN(value)) {
      clone[key] = DEEP_CLONE(value as Record<string, unknown>);
    } else {
      clone[key] = value;
    }
  }
  return clone;
}

function MERGE_LOCALES(dict: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...dict };
  for (const locale of Object.keys(dict)) {
    const separator = locale.includes("-") ? "-" : locale.includes("_") ? "_" : null;
    if (!separator) continue;
    const baseLanguage = locale.split(separator)[0];
    if (!baseLanguage || baseLanguage === locale) continue;
    if (baseLanguage in dict) {
      const baseCopy = DEEP_CLONE(dict[baseLanguage] as Record<string, unknown>);
      result[locale] = OBJECT_MERGE_DEEP_INTO(baseCopy, dict[locale] as Record<string, unknown>);
    }
  }
  return result;
}

function NORMALIZE_LOCALE(locale: string, keys: string[], defaultLocale?: string): string | undefined {
  if (!locale || keys.length === 0) return defaultLocale;

  const normalizedLocale = locale.replace(/_/g, "-").toLowerCase().trim();
  const normalizedKeys = keys.map((key) => ({
    original: key,
    normalized: key.replace(/_/g, "-").toLowerCase(),
  }));

  const exactMatch = normalizedKeys.find((key) => key.normalized === normalizedLocale);
  if (exactMatch) return exactMatch.original;

  const languageCode = normalizedLocale.split("-")[0];
  if (languageCode && languageCode.length >= 2) {
    const languageMatches = normalizedKeys.filter((key) => key.normalized.split("-")[0] === languageCode);
    if (languageMatches.length > 0) {
      return languageMatches.sort((a, b) => a.normalized.localeCompare(b.normalized))[0]!.original;
    }
  }

  if (defaultLocale) {
    const normalizedDefault = defaultLocale.replace(/_/g, "-").toLowerCase();
    const defaultMatch = normalizedKeys.find((key) => key.normalized === normalizedDefault);
    if (defaultMatch) return defaultMatch.original;
  }

  return undefined;
}
