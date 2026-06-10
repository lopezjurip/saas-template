import { BOOLEAN } from "@packages/utils/boolean";

type Region = { readonly subtag: string };

type LanguageEntry<T extends string> = {
  readonly tag: T;
  readonly label: string;
  readonly regions: readonly [Region, ...Region[]];
};

export class LocaleConfig<L extends string> {
  readonly languages: readonly LanguageEntry<L>[];
  readonly supported: readonly L[];
  readonly defaultLocale: L;
  readonly bcp47: Record<L, string>;
  readonly label: Record<L, string>;
  readonly cookie: string;

  constructor({
    languages,
    defaultLocale,
    cookie = "NEXT_LOCALE",
  }: {
    readonly languages: readonly LanguageEntry<L>[];
    defaultLocale: L;
    cookie?: string;
  }) {
    this.languages = languages;
    this.defaultLocale = defaultLocale;
    this.cookie = cookie;
    this.supported = languages.map((l) => l.tag) as readonly L[];
    this.bcp47 = Object.fromEntries(
      languages.map((l) => [l.tag, `${l.tag}-${l.regions[0].subtag}`]),
    ) as Record<L, string>;
    this.label = Object.fromEntries(
      languages.map((l) => [l.tag, l.label]),
    ) as Record<L, string>;
  }

  private findSupported(value: string): L | undefined {
    const lower = value.toLowerCase();
    return this.supported.find((s) => s.toLowerCase() === lower) as L | undefined;
  }

  isSupported(value: unknown): value is L {
    return typeof value === "string" && this.findSupported(value) !== undefined;
  }

  extractFromPath(pathname: string): { locale: L | null; pathAfterLocale: string } {
    const segments = pathname.split("/").filter(BOOLEAN);
    const first = segments[0];
    if (first) {
      const locale = this.findSupported(first);
      if (locale) {
        const rest = segments.slice(1).join("/");
        return { locale, pathAfterLocale: rest ? `/${rest}` : "/" };
      }
    }
    return { locale: null, pathAfterLocale: pathname };
  }

  parseAcceptLanguage(header: string | null): L | null {
    if (!header) return null;
    const codes = header
      .split(",")
      .map((entry) => entry.trim().split(";").at(0)?.trim().toLowerCase())
      .filter(BOOLEAN);
    for (const code of codes) {
      // 1. Exact match (case-insensitive): 'es-CL' → 'es-CL'
      const exact = this.findSupported(code);
      if (exact) return exact;
      // 2. Language-prefix fallback: 'es-AR' → first supported 'es-*' or 'es'
      const lang = code.split("-").at(0);
      if (lang) {
        const prefix = this.supported.find(
          (s) => s.toLowerCase() === lang || s.toLowerCase().startsWith(`${lang}-`),
        ) as L | undefined;
        if (prefix) return prefix;
      }
    }
    return null;
  }

  resolveFromRequest(request: {
    cookies: { get(name: string): { value: string } | undefined };
    headers: { get(name: string): string | null };
  }): L {
    const cookie = request.cookies.get(this.cookie)?.value;
    if (this.isSupported(cookie)) return cookie;
    const fromHeader = this.parseAcceptLanguage(request.headers.get("accept-language"));
    if (fromHeader) return fromHeader;
    return this.defaultLocale;
  }
}
