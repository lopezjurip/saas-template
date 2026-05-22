import { describe, expect, it } from "vitest";
import { LOCALE_TO_ISO } from "./locale";

describe("LOCALE_TO_ISO", () => {
  it("should convert a locale to ISO", () => {
    expect(LOCALE_TO_ISO("es-CL")).toBe("es_CL");
    expect(LOCALE_TO_ISO("es_CL")).toBe("es_CL");
    expect(LOCALE_TO_ISO("en")).toBe("en_US");
    expect(LOCALE_TO_ISO("pt")).toBe("pt_BR");
  });
});
