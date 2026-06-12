import { describe, expect, it } from "vitest";
import { PARSE_ACCEPT_LANGUAGE_HEADER } from "./i18n.server";

describe("PARSE_ACCEPT_LANGUAGE_HEADER", () => {
  it("resolves the best supported canonical locale from Accept-Language", () => {
    expect(PARSE_ACCEPT_LANGUAGE_HEADER("es-AR, en;q=0.8")).toBe("es-CL");
    expect(PARSE_ACCEPT_LANGUAGE_HEADER("en-GB, es;q=0.8")).toBe("en-US");
    expect(PARSE_ACCEPT_LANGUAGE_HEADER("pt, en;q=0.8")).toBe("pt-BR");
  });

  it("returns null when the header is empty or missing", () => {
    expect(PARSE_ACCEPT_LANGUAGE_HEADER(null)).toBeNull();
    expect(PARSE_ACCEPT_LANGUAGE_HEADER("")).toBeNull();
  });
});
