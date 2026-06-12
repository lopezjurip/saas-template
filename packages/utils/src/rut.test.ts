import { describe, expect, it } from "vitest";
import { RUT_FORMAT, RUT_NORMALIZE, RUT_VALIDATE } from "./rut";

describe("RUT_NORMALIZE", () => {
  it("should normalize a valid RUT", () => {
    expect(RUT_NORMALIZE("18.525.562-k")).toBe("18525562K");
    expect(RUT_NORMALIZE("18.525.562-K")).toBe("18525562K");
    expect(RUT_NORMALIZE("18.525.562k")).toBe("18525562K");
    expect(RUT_NORMALIZE("18. 525.562K")).toBe("18525562K");
    expect(RUT_NORMALIZE("18525562k")).toBe("18525562K");
    expect(RUT_NORMALIZE("18525562K")).toBe("18525562K");
    expect(RUT_NORMALIZE(" 18525562K  ")).toBe("18525562K");
    expect(RUT_NORMALIZE(".18525562K - ")).toBe("18525562K"); // is this ok?
  });
});

/**
 * RUT must be normalized first before validation.
 */
describe("RUT_VALIDATE", () => {
  it("should invalidate a falsy RUT", () => {
    expect(RUT_VALIDATE(undefined)).toBe(false);
    expect(RUT_VALIDATE(null)).toBe(false);
    expect(RUT_VALIDATE("")).toBe(false);
    expect(RUT_VALIDATE(RUT_NORMALIZE("0000000-0"))).toBe(false);
  });

  it("should validate a valid RUT", () => {
    expect(RUT_VALIDATE("18525562K")).toBe(true);
  });

  it("should invalidate an invalid RUT", () => {
    expect(RUT_VALIDATE("185255621")).toBe(false);
  });
});

describe("RUT_FORMAT", () => {
  it("should format a valid RUT", () => {
    expect(RUT_FORMAT("18525562K")).toBe("18.525.562-K");
    expect(RUT_FORMAT("18525562K", { dots: false })).toBe("18525562-K");
  });
});
