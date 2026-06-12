import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_FROM_PATH, LOCALE_SUPPORTED_RESOLVE } from "./i18n";

describe("i18n locale resolution", () => {
  it("treats only canonical locales as supported", () => {
    expect(IS_SUPPORTED_LOCALE("es-CL")).toBe(true);
    expect(IS_SUPPORTED_LOCALE("es")).toBe(false);
  });

  it("resolves short and regional aliases to canonical supported locales", () => {
    expect(LOCALE_SUPPORTED_RESOLVE("es")).toBe("es-CL");
    expect(LOCALE_SUPPORTED_RESOLVE("es-AR")).toBe("es-CL");
    expect(LOCALE_SUPPORTED_RESOLVE("en")).toBe("en-US");
    expect(LOCALE_SUPPORTED_RESOLVE("pt")).toBe("pt-BR");
  });

  it("returns null for unsupported locale families", () => {
    expect(LOCALE_SUPPORTED_RESOLVE("fr")).toBeNull();
  });

  it("extracts canonical locales directly from the path", () => {
    expect(LOCALE_FROM_PATH("/es-CL/faq")).toEqual({
      locale: "es-CL",
      canonicalLocale: "es-CL",
      localeCandidate: "es-CL",
      localeIsCanonical: true,
      pathAfterLocale: "/faq",
    });
  });

  it("flags resolvable legacy locales for canonical redirect handling", () => {
    expect(LOCALE_FROM_PATH("/en/pricing")).toEqual({
      locale: null,
      canonicalLocale: "en-US",
      localeCandidate: "en",
      localeIsCanonical: false,
      pathAfterLocale: "/pricing",
    });

    expect(LOCALE_FROM_PATH("/es-AR/faq")).toEqual({
      locale: null,
      canonicalLocale: "es-CL",
      localeCandidate: "es-AR",
      localeIsCanonical: false,
      pathAfterLocale: "/faq",
    });
  });

  it("leaves non-locale paths to the missing-locale redirect flow", () => {
    expect(LOCALE_FROM_PATH("/faq")).toEqual({
      locale: null,
      canonicalLocale: null,
      localeCandidate: null,
      localeIsCanonical: false,
      pathAfterLocale: "/faq",
    });
  });

  it("treats the configured default as canonical", () => {
    expect(DEFAULT_LOCALE).toBe("es-CL");
  });
});
