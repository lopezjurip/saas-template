import { describe, expect, it } from "vitest";
import { JWT_DECODE_PAYLOAD } from "./jwt";

/**
 * Encodes payload to Base64url format without padding, matching JWT serialization.
 */
function ENCODE_PAYLOAD(payload: unknown): string {
  return btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function BUILD_JWT(payload: unknown): string {
  const header = ENCODE_PAYLOAD({ alg: "HS256", typ: "JWT" });
  return `${header}.${ENCODE_PAYLOAD(payload)}.signature`;
}

describe("JWT_DECODE_PAYLOAD", () => {
  it("decodes a standard JWT payload", () => {
    // Reference example from https://jwt.io
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    expect(JWT_DECODE_PAYLOAD(token)).toEqual({
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    });
  });

  it("decodes a payload encoded with base64url chars (- and _)", () => {
    // Payloads with `-`/`_` in base64url need translation to `+`/`/` before atob.
    const payload = { data: ">>>???" }; // base64 of this JSON contains `+` and `/`
    const token = BUILD_JWT(payload);
    expect(JWT_DECODE_PAYLOAD(token)).toEqual(payload);
  });

  it("decodes a payload that needs padding restored", () => {
    // Length 1 mod 4 needs 3 `=` padding chars added back.
    const payload = { a: 1 };
    const token = BUILD_JWT(payload);
    const segment = token.split(".")[1]!;
    expect(segment.endsWith("=")).toBe(false); // sanity: padding was stripped
    expect(JWT_DECODE_PAYLOAD(token)).toEqual(payload);
  });

  it("decodes hook-injected Supabase app_metadata claims", () => {
    const payload = {
      app_metadata: {
        tenants: [{ id: 1, slug: "acme" }],
        organizations: [{ id: 10, role: "owner" }],
        is_concierge: false,
        onboarded: true,
      },
    };
    expect(JWT_DECODE_PAYLOAD(BUILD_JWT(payload))).toEqual(payload);
  });

  it("returns null when the token has no payload segment", () => {
    expect(JWT_DECODE_PAYLOAD("only-one-segment")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(JWT_DECODE_PAYLOAD("")).toBeNull();
  });

  it("returns null when the payload segment is not valid base64", () => {
    expect(JWT_DECODE_PAYLOAD("header.!!!not-base64!!!.sig")).toBeNull();
  });

  it("returns null when the decoded payload is not valid JSON", () => {
    const notJson = btoa("not json at all").replace(/=+$/, "");
    expect(JWT_DECODE_PAYLOAD(`header.${notJson}.sig`)).toBeNull();
  });
});
