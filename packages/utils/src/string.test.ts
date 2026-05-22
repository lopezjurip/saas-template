import { describe, expect, it } from "vitest";
import { SLUGIFY } from "./slug";
import {
  FORMAT,
  HUMANIZE,
  LEVENSHTEIN,
  SPACE_NON_BREAKING,
  STRING_INLINE,
  STRING_MAX,
  STRING_MIN,
  STRING_NORMALIZE,
  SUGGESTIONS_FIND,
} from "./string";
import { UUID_REGEX, UUID_ZERO } from "./uuid";

describe("STRING_NORMALIZE", () => {
  it("should normalize a string", () => {
    expect(STRING_NORMALIZE("áéíóúü")).toBe("aeiouu");
    expect(STRING_NORMALIZE("ñ")).toBe("n");
    expect(STRING_NORMALIZE("ÁÉÍÓÚ")).toBe("AEIOU");
    expect(STRING_NORMALIZE("Ñ")).toBe("N");
  });
  it("should normalize a string keeping whitespace", () => {
    expect(STRING_NORMALIZE("Á É Í Ó Ú", { keepWhitespace: true })).toBe("A E I O U");
    expect(STRING_NORMALIZE("á é í ó ú", { keepWhitespace: true })).toBe("a e i o u");
    expect(STRING_NORMALIZE("ñ", { keepWhitespace: true })).toBe("n");
    expect(STRING_NORMALIZE("Ñ", { keepWhitespace: true })).toBe("N");
    expect(STRING_NORMALIZE("á é í ó ú ñ", { keepWhitespace: true })).toBe("a e i o u n");
  });
  it("should normalize a string keeping dashes", () => {
    expect(STRING_NORMALIZE("A-B 2", { keepDashes: true })).toBe("A-B2");
  });
  it("should normalize a string keeping whitespace and dashes", () => {
    expect(STRING_NORMALIZE("A-B 2", { keepWhitespace: true, keepDashes: true })).toBe("A-B 2");
  });

  it("should remove non-breaking spaces", () => {
    expect(STRING_NORMALIZE(`a${SPACE_NON_BREAKING}b`)).toBe("ab");
  });

  it("should normalize company name with ampersand", () => {
    expect(STRING_NORMALIZE("Sociedad de Inversiones Legado & Futuro")).toBe("SociedaddeInversionesLegadoFuturo");
    expect(STRING_NORMALIZE("Sociedad de Inversiones Legado & Futuro", { keepWhitespace: true })).toBe(
      "Sociedad de Inversiones Legado Futuro",
    );
  });
});

describe("HUMANIZE", () => {
  it("should humanize a string", () => {
    expect(HUMANIZE("camelCase")).toBe("Camel Case");
    expect(HUMANIZE("snake_case")).toBe("Snake Case");
    expect(HUMANIZE("kebab-case")).toBe("Kebab Case");
    expect(HUMANIZE("PascalCase")).toBe("Pascal Case");
    expect(HUMANIZE("UPPER_CASE")).toBe("Upper Case");
    expect(HUMANIZE("lower_case")).toBe("Lower Case");
  });
});

describe("FORMAT", () => {
  it("should format strings with %s", () => {
    const result = FORMAT("Hello %s!", "world");
    expect(result).toBe("Hello world!");
  });

  it("should format numbers with %d", () => {
    const result = FORMAT("Number: %d", 42);
    expect(result).toBe("Number: 42");
  });

  it("should format objects with %o", () => {
    const result = FORMAT("Object: %o", { key: "value" });
    expect(result).toBe('Object: {"key":"value"}');
  });

  it("should format objects with %O", () => {
    const result = FORMAT("Object: %O", { key: "value" });
    expect(result).toBe('Object: {\n  "key": "value"\n}');
  });

  it("should format JSON with %j", () => {
    const result = FORMAT("JSON: %j", { key: "value" });
    expect(result).toBe('JSON: {"key":"value"}');
  });

  it("should format Iterables to Arrays with %a", () => {
    const result = FORMAT("Array: %a", new Set([1, 2, 3]));
    expect(result).toBe("Array: [1,2,3]");
  });

  it.skip("should handle escaped % characters", () => {
    const result = FORMAT("%%s", "ignored");
    expect(result).toBe("%s");
  });

  it("should append remaining arguments", () => {
    const result = FORMAT("Hello %s", "world", "extra");
    expect(result).toBe("Hello world extra");
  });
});

describe("SLUGIFY", () => {
  it("should convert string to lowercase and replace spaces with hyphens", () => {
    const result = SLUGIFY("Hello World");
    expect(result).toBe("hello-world");
  });

  it("should remove accents from characters", () => {
    const result = SLUGIFY("Café");
    expect(result).toBe("cafe");
  });

  it("should replace invalid characters with spaces", () => {
    const result = SLUGIFY("Hello@World!");
    expect(result).toBe("hello-world");
  });

  it("should replace multiple spaces or hyphens with a single hyphen", () => {
    const result = SLUGIFY("Hello   World---");
    expect(result).toBe("hello-world");
  });
});

describe("STRING_INLINE", () => {
  it("should inline a string", () => {
    const result = STRING_INLINE("Hello\nWorld");
    expect(result).toBe("Hello World");
  });

  it("should inline a string with multiple newlines", () => {
    const result = STRING_INLINE("Hello\n\n\nWorld");
    expect(result).toBe("Hello World");
  });

  it("should inline a string with leading and trailing newlines", () => {
    const result = STRING_INLINE("\nHello\nWorld\n");
    expect(result).toBe("Hello World");
  });

  it("should inline a string with leading and trailing whitespace", () => {
    const result = STRING_INLINE("  Hello World  ");
    expect(result).toBe("Hello World");
  });
});

// test uuid:
describe("UUID_REGEX", () => {
  it("should match valid UUIDs", () => {
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(UUID_REGEX.test("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });
  it("should not match invalid UUIDs", () => {
    expect(UUID_REGEX.test("invalid-uuid")).toBe(false);
    expect(UUID_REGEX.test("12345")).toBe(false);
  });
  it("should not match empty strings", () => {
    expect(UUID_REGEX.test("")).toBe(false);
  });
  it("should not match strings with invalid characters", () => {
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716-44665544000!")).toBe(false);
  });
  it("should match UUIDs with uppercase letters", () => {
    expect(UUID_REGEX.test("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });
  it("should match UUIDs with lowercase letters", () => {
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });
  it("should match UUIDs with mixed case letters", () => {
    expect(UUID_REGEX.test("550E8400-e29b-41d4-a716-446655440000")).toBe(true);
  });
  it("should match UUID_ZERO", () => {
    expect(UUID_REGEX.test(UUID_ZERO)).toBe(true);
  });
});

describe("SPACE_NON_BREAKING", () => {
  it("should be a non-breaking space character", () => {
    expect(SPACE_NON_BREAKING).toBe("\u00a0");
  });

  it("should not be a regular space character", () => {
    expect(SPACE_NON_BREAKING).not.toBe(" ");
  });

  it("should have length of 1", () => {
    expect(SPACE_NON_BREAKING.length).toBe(1);
  });

  it("should not be removed by replaceAll with regular space", () => {
    expect(`a${SPACE_NON_BREAKING}b`.replaceAll(" ", "")).toBe(`a${SPACE_NON_BREAKING}b`);
  });

  it("should be removed by trim", () => {
    expect(`a${SPACE_NON_BREAKING}`.trim()).toBe("a");
  });
});

describe("LEVENSHTEIN", () => {
  it("identical strings → 0", () => {
    expect(LEVENSHTEIN("abc", "abc")).toBe(0);
  });
  it("empty strings → 0", () => {
    expect(LEVENSHTEIN("", "")).toBe(0);
  });
  it("one empty string → length of other", () => {
    expect(LEVENSHTEIN("abc", "")).toBe(3);
    expect(LEVENSHTEIN("", "abc")).toBe(3);
  });
  it("one substitution", () => {
    expect(LEVENSHTEIN("cat", "bat")).toBe(1);
  });
  it("one insertion", () => {
    expect(LEVENSHTEIN("proyectos", "proyectoos")).toBe(1);
  });
  it("one deletion", () => {
    expect(LEVENSHTEIN("blog", "bolg")).toBe(2);
  });
});

describe("SUGGESTIONS_FIND", () => {
  const urls = ["/proyectos", "/blog", "/app/auth/login", "/noticias", "/trabajos"];

  it("returns close match for typo", () => {
    expect(SUGGESTIONS_FIND("/proyectoos", urls)).toContain("/proyectos");
  });
  it("returns close match for transposition", () => {
    expect(SUGGESTIONS_FIND("/bolg", urls)).toContain("/blog");
  });
  it("returns close match for suffix typo", () => {
    expect(SUGGESTIONS_FIND("/app/auth/loginn", urls)).toContain("/app/auth/login");
  });
  it("returns nothing for unrelated path", () => {
    expect(SUGGESTIONS_FIND("/completely-random-xyz-abc", urls)).toHaveLength(0);
  });
  it("respects limit option", () => {
    expect(SUGGESTIONS_FIND("/proyectos", urls, { limit: 1 })).toHaveLength(1);
  });
  it("strips query string before matching", () => {
    expect(SUGGESTIONS_FIND("/proyectoos?foo=bar", urls)).toContain("/proyectos");
  });
});

describe("STRING_MIN/MAX", () => {
  it("should return the minimum string", () => {
    expect(STRING_MIN("b", "a", "c")).toBe("a");
    expect(STRING_MIN("2023-01-01", "2022-12-31", "2023-06-15")).toBe("2022-12-31");
  });
  it("should return the maximum string", () => {
    expect(STRING_MAX("b", "a", "c")).toBe("c");
    expect(STRING_MAX("2023-01-01", "2022-12-31", "2023-06-15")).toBe("2023-06-15");
  });
});
