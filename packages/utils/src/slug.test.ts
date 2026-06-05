import { describe, expect, it } from "vitest";
import { SLUG_REGEX, SLUGIFY } from "./slug";

describe("SLUGIFY", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(SLUGIFY("BDO Auditores")).toBe("bdo-auditores");
    expect(SLUGIFY("Fiscalizadores SII")).toBe("fiscalizadores-sii");
    expect(SLUGIFY("Estudio Contable Andrade")).toBe("estudio-contable-andrade");
  });

  it("strips diacritics via NFD normalization", () => {
    expect(SLUGIFY("Contadores Larraín")).toBe("contadores-larrain");
    expect(SLUGIFY("María Soto")).toBe("maria-soto");
    expect(SLUGIFY("Ábaco")).toBe("abaco");
    expect(SLUGIFY("ÑOÑO")).toBe("nono");
  });

  it("collapses runs of separators and trims leading/trailing hyphens", () => {
    expect(SLUGIFY("  Hello   World!!  ")).toBe("hello-world");
    expect(SLUGIFY("a@@@b")).toBe("a-b");
    expect(SLUGIFY("foo___bar")).toBe("foo-bar");
  });

  it("drops every non-alphanumeric character", () => {
    expect(SLUGIFY("Acme & Co. (2026)")).toBe("acme-co-2026");
  });

  it("returns an empty string when nothing alphanumeric remains", () => {
    expect(SLUGIFY("")).toBe("");
    expect(SLUGIFY("---")).toBe("");
    expect(SLUGIFY("¿!¡?")).toBe("");
  });

  it("is idempotent on an already-slugified value", () => {
    expect(SLUGIFY("bdo-auditores")).toBe("bdo-auditores");
  });
});

describe("SLUG_REGEX", () => {
  it("accepts lowercase alphanumeric slugs with interior hyphens", () => {
    expect(SLUG_REGEX.test("bdo-auditores")).toBe(true);
    expect(SLUG_REGEX.test("fiscalizadores-sii")).toBe(true);
    expect(SLUG_REGEX.test("a1b2")).toBe(true);
    expect(SLUG_REGEX.test("a".repeat(40))).toBe(true);
  });

  it("rejects empty, edge-hyphen, uppercase, spaced and over-long values", () => {
    expect(SLUG_REGEX.test("")).toBe(false);
    expect(SLUG_REGEX.test("-abc")).toBe(false);
    expect(SLUG_REGEX.test("abc-")).toBe(false);
    expect(SLUG_REGEX.test("BDO")).toBe(false);
    expect(SLUG_REGEX.test("foo bar")).toBe(false);
    expect(SLUG_REGEX.test("a".repeat(41))).toBe(false);
  });

  it("produces a valid slug from any real agency name (capped at 40)", () => {
    for (const name of ["BDO Auditores", "Fiscalizadores SII", "Soporte Humane", "Contadores Larraín"]) {
      expect(SLUG_REGEX.test(SLUGIFY(name).slice(0, 40))).toBe(true);
    }
  });
});
