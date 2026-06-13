import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_SUPPORTED_RESOLVE } from "./i18n";

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

  it("falls back to English when nothing resolves", () => {
    expect(DEFAULT_LOCALE).toBe("en-US");
  });
});
