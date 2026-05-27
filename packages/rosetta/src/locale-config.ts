export class LocaleConfig<L extends string> {
  readonly supported: readonly L[];
  readonly defaultLocale: L;
  readonly bcp47: Record<L, string>;
  readonly label: Record<L, string>;
  readonly cookie: string;

  constructor({
    supported,
    defaultLocale,
    bcp47,
    label,
    cookie = "NEXT_LOCALE",
  }: {
    supported: readonly L[];
    defaultLocale: L;
    bcp47: Record<L, string>;
    label: Record<L, string>;
    cookie?: string;
  }) {
    this.supported = supported;
    this.defaultLocale = defaultLocale;
    this.bcp47 = bcp47;
    this.label = label;
    this.cookie = cookie;
  }

  isSupported(value: unknown): value is L {
    return typeof value === "string" && (this.supported as readonly string[]).includes(value);
  }

  extractFromPath(pathname: string): { locale: L | null; pathAfterLocale: string } {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (first && this.isSupported(first)) {
      const rest = segments.slice(1).join("/");
      return { locale: first, pathAfterLocale: rest ? `/${rest}` : "/" };
    }
    return { locale: null, pathAfterLocale: pathname };
  }

  parseAcceptLanguage(header: string | null): L | null {
    if (!header) return null;
    const codes = header
      .split(",")
      .map((entry) => entry.trim().split(";")[0]?.split("-")[0]?.toLowerCase())
      .filter((c): c is string => Boolean(c));
    for (const code of codes) {
      if (this.isSupported(code)) return code;
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
