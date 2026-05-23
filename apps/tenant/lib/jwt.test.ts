import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { JWT_DECODE, JWT_DECODE_ZOD, JWT_ENCODE } from "./jwt";

describe("JWT_ENCODE", () => {
  it("produces a three-segment dot-separated string", () => {
    expect(JWT_ENCODE({ sub: "x" }).split(".")).toHaveLength(3);
  });

  it("round-trips with JWT_DECODE", () => {
    const payload = { app_metadata: { tenants: [{ id: 1, slug: "acme" }] } };
    expect(JWT_DECODE(JWT_ENCODE(payload))).toEqual(payload);
  });

  it("uses base64url encoding (no +, /, or = characters in payload segment)", () => {
    const segment = JWT_ENCODE({ data: "hello world" }).split(".")[1];
    expect(segment).not.toMatch(/[+/=]/);
  });
});

describe("JWT_DECODE", () => {
  it("decodes app_metadata with tenants and organizations", () => {
    const payload = {
      app_metadata: {
        tenants: [{ id: 1, slug: "acme" }],
        organizations: [{ id: 10, role: "owner" }],
      },
    };
    expect(JWT_DECODE(JWT_ENCODE(payload))).toEqual(payload);
  });

  it("returns null for a token with no payload segment", () => {
    expect(JWT_DECODE("onlyone")).toBeNull();
    expect(JWT_DECODE("")).toBeNull();
  });

  it("returns null when the payload is not valid base64url JSON", () => {
    expect(JWT_DECODE("header.!!!.signature")).toBeNull();
  });

  it("handles standard base64url padding correctly", () => {
    // payload lengths that produce segments requiring 0, 1, or 2 padding chars
    for (const payload of [{ a: 1 }, { ab: 12 }, { abc: 123 }]) {
      const result = JWT_DECODE(JWT_ENCODE(payload));
      expect(result).toEqual(payload);
    }
  });

  it("returns an empty app_metadata when present but empty", () => {
    const payload = { app_metadata: {} };
    expect(JWT_DECODE(JWT_ENCODE(payload))).toEqual(payload);
  });

  it("returns a payload with no app_metadata key", () => {
    const payload = { sub: "user-id" };
    expect(JWT_DECODE(JWT_ENCODE(payload))).toEqual(payload);
  });
});

const TenantClaimSchema = z.object({ id: z.number(), slug: z.string() });

describe("JWT_DECODE_ZOD", () => {
  it("parses a valid token against the schema", () => {
    const payload = { id: 1, slug: "acme" };
    expect(JWT_DECODE_ZOD(JWT_ENCODE(payload), TenantClaimSchema)).toEqual(payload);
  });

  it("returns null when the token is invalid", () => {
    expect(JWT_DECODE_ZOD("bad", TenantClaimSchema)).toBeNull();
  });

  it("returns null when the payload fails schema validation", () => {
    expect(JWT_DECODE_ZOD(JWT_ENCODE({ id: "not-a-number", slug: "acme" }), TenantClaimSchema)).toBeNull();
  });

  it("infers the correct return type", () => {
    const result = JWT_DECODE_ZOD(JWT_ENCODE({ id: 2, slug: "demo" }), TenantClaimSchema);
    expectTypeOf(result).toEqualTypeOf<{ id: number; slug: string } | null>();
  });
});
