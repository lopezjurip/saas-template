import { describe, expect, it } from "vitest";
import { HEADER_ACCEPT_LANGUAGE_PARSE } from "./i18n.server";

describe("PARSE_ACCEPT_LANGUAGE_HEADER", () => {
  it("resolves the best supported canonical locale from Accept-Language", () => {
    expect(HEADER_ACCEPT_LANGUAGE_PARSE("es-AR, en;q=0.8")).toBe("es-CL");
    expect(HEADER_ACCEPT_LANGUAGE_PARSE("en-GB, es;q=0.8")).toBe("en-US");
    expect(HEADER_ACCEPT_LANGUAGE_PARSE("pt, en;q=0.8")).toBe("pt-BR");
  });

  it("returns null when the header is empty or missing", () => {
    expect(HEADER_ACCEPT_LANGUAGE_PARSE(null)).toBeNull();
    expect(HEADER_ACCEPT_LANGUAGE_PARSE("")).toBeNull();
  });
});
