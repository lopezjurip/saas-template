import type { Maybe } from "./maybe";

/**
 * Untested from https://stackoverflow.com/a/9204568/3416691
 */
export const EMAIL_REGEX = /*#__PURE__*/ /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Untested */
export const URL_REGEX = /*#__PURE__*/ /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
/** Untested */
export const UUID_REGEX = /*#__PURE__*/ /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
/** Untested */
export const IPV4_REGEX =
  /*#__PURE__*/
  /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
/** Untested */
export const IPV6_REGEX =
  /*#__PURE__*/
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;

export function IS_EMAIL(input: unknown): input is string {
  return typeof input === "string" && EMAIL_REGEX.test(input);
}

const URL_FIELDS = /*#__PURE__*/ [
  "hash",
  "host",
  "hostname",
  "password",
  "pathname",
  "port",
  "protocol",
  "search",
  "username",
] as const;
export type URLParts = Pick<URL, (typeof URL_FIELDS)[number]>;

/** Extracts `[key]` segment names from a URL template string literal. */
export type ExtractURLSegments<S extends string> = S extends `${string}[${infer K}]${infer Rest}`
  ? K | ExtractURLSegments<Rest>
  : never;

type ReplaceRecord<TUrl extends string | URL> = TUrl extends string
  ? [ExtractURLSegments<TUrl>] extends [never]
    ? Record<string, string | number>
    : Partial<Record<ExtractURLSegments<TUrl>, string | number>>
  : Record<string, string | number>;

/**
 * Throws detailed error.
 * To remove querystring set `search` to `""`.
 * `replace` substitutes `[key]` placeholders in pathname after URL construction.
 * When `url` is a string literal, `replace` keys are inferred from `[segment]` patterns.
 * @example
 * URL_NEW("/[locale]/t/[tenant_slug]", base, { replace: { locale: "es-CL", tenant_slug: "acme" } })
 */
export function URL_NEW<const TUrl extends string | URL>(
  url: TUrl,
  base?: string | URL,
  overwrite?: Partial<URLParts> & { params?: Record<string | number, any>; replace?: ReplaceRecord<TUrl> },
) {
  try {
    const result = new URL(url, base);

    if (overwrite) {
      if (overwrite.replace) {
        let { pathname } = result;
        for (const [key, value] of Object.entries(overwrite.replace)) {
          pathname = pathname.replaceAll(`[${key}]`, encodeURIComponent(String(value)));
        }
        result.pathname = pathname;
      }
      for (const [key, value] of Object.entries(overwrite)) {
        if (URL_FIELDS.includes(key as any)) {
          // @ts-expect-error: ignore
          result[key] = value;
        }
      }
      if (overwrite.params) {
        for (const [key, value] of Object.entries(overwrite.params)) {
          if (value === undefined) {
            // skip
          } else if (value === null) {
            result.searchParams.delete(key);
          } else {
            result.searchParams.set(key, value);
          }
        }
      }
    }

    return result;
  } catch (e: any) {
    throw new Error(`${e.message} — new URL('${url}', '${base}')`);
  }
}

export interface URLFormatOptions {
  protocol?: boolean;
  hostname?: boolean;
  port?: boolean;
  pathname?: boolean;
  search?: boolean;
  hash?: boolean;
}
/** Use this instead of BetterURL */
export function URL_FORMAT(url: URL, opts?: URLFormatOptions): string {
  if (!opts) {
    return url.href;
  }
  const protocol = url.protocol;
  let str = "";
  // TODO: add more
  if (opts.protocol) {
    str += `${protocol}//`;
  }
  if (opts.hostname) {
    str += url.hostname;
  }
  if (opts.port) {
    const port = url.port || (protocol === "https:" && 443) || (protocol === "http:" && 80);
    if (port) {
      str += `:${port}`;
    }
  }
  if (opts.pathname) {
    str += url.pathname;
  }
  if (opts.search) {
    str += url.search ?? "";
  }
  if (opts.hash) {
    str += url.hash;
  }
  return str;
}

// TODO: replace will only replace first occurrence.
function HREF_FORMAT_REDUCER(acc: string, [key, value]: any[]) {
  const encoded = encodeURIComponent(value);
  return acc.replace(`[${key}]`, encoded);
}

/**
 * We use this to format href with dynamic params and query strings based on Next.js Link component.
 * When using query, any previous query string in the href will be removed and undefined/null values will be skipped.
 * @example
 * const path = FORMAT_HREF("/dashboard/[tenant]", { tenant: "foo" });
 * const pathWithQuery = FORMAT_HREF("/dashboard/[tenant]", { tenant: "foo" }, { ref: "bar" });
 */
export function HREF_FORMAT(href: string, params?: Maybe<Record<string, any>>, query?: Maybe<Record<string, any>>) {
  let result = href;
  if (params) {
    result = Object.entries(params).reduce(HREF_FORMAT_REDUCER, href);
  }
  if (query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        // skip
      } else {
        searchParams.set(key, value);
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      result += `?${qs}`;
    }
  }
  return result;
}

export function URL_UTM(
  url: URL,
  options: { source?: string; medium?: string; campaign?: string; content?: string },
): URL {
  const cloned = new URL(url);
  if (options["source"]) {
    cloned.searchParams.set("utm_source", options["source"]);
  }
  if (options["medium"]) {
    cloned.searchParams.set("utm_medium", options["medium"]);
  }
  if (options["campaign"]) {
    cloned.searchParams.set("utm_campaign", options["campaign"]);
  }
  if (options["content"]) {
    cloned.searchParams.set("utm_content", options["content"]);
  }
  return cloned;
}

/**
 * Normalizes email by trimming and lowercasing and removing + tags for gmail.
 * @example
 * const normalized = EMAIL_NORMALIZE("foo+bar@gmail.com"); // "foo@gmail.com"
 */
export function EMAIL_NORMALIZE(
  email: string,
  { tags = "remove-all" }: { tags?: "keep" | "remove-gmail" | "remove-all" } = {},
): string {
  const normalized = email.trim().toLowerCase();
  if (tags === "remove-gmail") {
    if (email.endsWith("@gmail.com") || email.endsWith("@googlemail.com")) {
      return EMAIL_REMOVE_TAGS(normalized);
    }
  } else if (tags === "remove-all") {
    return EMAIL_REMOVE_TAGS(normalized);
  }
  return normalized;
}

/**
 * Remove "+" tags from email.
 * @example
 * const cleaned = EMAIL_REMOVE_TAGS("foo+bar@example.com"); // "foo@example.com"
 */
export function EMAIL_REMOVE_TAGS(email: string): string {
  return email.replace(/\+.*(?=@)/, "");
}

/**
 * Parses hash parameters from a URL object and returns them as a record.
 * @example
 * const url = new URL("https://example.com/path#mobile_app=true&access_token=abc123");
 * const params = URL_PARSE_HASH(url);
 * const object = Object.fromEntries(params.entries());
 */
export function IS_EXTERNAL(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}

export function URL_PARSE_HASH(url: URL): URLSearchParams {
  const hash = url.hash.slice(1);
  if (!hash) {
    return new URLSearchParams();
  }
  return new URLSearchParams(hash);
}
