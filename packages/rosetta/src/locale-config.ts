import { BOOLEAN } from "@packages/utils/boolean";

type LanguageEntry<T extends string> = {
  readonly tag: T;
  readonly label: string;
};

export class LocaleConfig<L extends string> {
  readonly languages: readonly LanguageEntry<L>[];
  readonly supported: readonly L[];
  readonly defaultLocale: L;
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
    this.label = Object.fromEntries(languages.map((l) => [l.tag, l.label])) as Record<L, string>;
  }

  isSupported(value: unknown): value is L {
    return typeof value === "string" && this.supported.includes(value as L);
  }

  extractFromPath(pathname: string): { locale: L | null; pathAfterLocale: string } {
    const segments = pathname.split("/").filter(BOOLEAN);
    const first = segments[0];
    if (first) {
      if (this.isSupported(first)) {
        const rest = segments.slice(1).join("/");
        return { locale: first, pathAfterLocale: rest ? `/${rest}` : "/" };
      }
    }
    return { locale: null, pathAfterLocale: pathname };
  }
}
