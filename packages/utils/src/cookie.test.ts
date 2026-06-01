import { describe, expect, it } from "vitest";
import { COOKIE_MAX_AGE_ONE_YEAR, SERIALIZE_COOKIE } from "./cookie";

describe("SERIALIZE_COOKIE", () => {
  it("applies the defaults (Path=/, one-year Max-Age, SameSite=Lax)", () => {
    expect(SERIALIZE_COOKIE("humane_locale", "es")).toBe(
      `humane_locale=es; Path=/; Max-Age=${COOKIE_MAX_AGE_ONE_YEAR}; SameSite=Lax`,
    );
  });

  it("url-encodes the value", () => {
    expect(SERIALIZE_COOKIE("k", "a b/c")).toContain("k=a%20b%2Fc");
  });

  it("omits Max-Age for a session cookie (maxAgeSeconds: null)", () => {
    expect(SERIALIZE_COOKIE("k", "v", { maxAgeSeconds: null })).toBe("k=v; Path=/; SameSite=Lax");
  });

  it("adds Domain and Secure when provided", () => {
    expect(SERIALIZE_COOKIE("k", "v", { domain: ".lvh.me", secure: true })).toBe(
      `k=v; Path=/; Max-Age=${COOKIE_MAX_AGE_ONE_YEAR}; Domain=.lvh.me; SameSite=Lax; Secure`,
    );
  });

  it("forces Secure when SameSite is None", () => {
    expect(SERIALIZE_COOKIE("k", "v", { sameSite: "None" })).toContain("SameSite=None; Secure");
  });
});
