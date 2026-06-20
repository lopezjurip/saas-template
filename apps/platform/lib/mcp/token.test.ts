import { describe, expect, it, vi } from "vitest";

// Set required env vars before module imports (vi.hoisted runs before static imports)
vi.hoisted(() => {
  process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://test.supabase.co";
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "test-anon-key";
});

// Mock jose — createRemoteJWKSet is called at module level, jwtVerify / decodeJwt per call
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mock-jwks"),
  jwtVerify: vi.fn(),
  decodeJwt: vi.fn(),
}));

// Mock Supabase client for HS256 fallback tests
const { mockGetUser } = vi.hoisted(() => ({ mockGetUser: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser: mockGetUser } })),
}));

import { decodeJwt, jwtVerify } from "jose";
import { mcpTokenVerify } from "./token";

const mockJwtVerify = vi.mocked(jwtVerify);
const mockDecodeJwt = vi.mocked(decodeJwt);

function makeReq(host = "lvh.me:7003", proto = "https") {
  return new Request(`${proto}://${host}/api/mcp`, {
    headers: { host, "x-forwarded-proto": proto },
  });
}

describe("verifyToken", () => {
  it("returns undefined for missing token", async () => {
    expect(await mcpTokenVerify(makeReq(), undefined)).toBeUndefined();
  });

  describe("RS256 path (local JWKS)", () => {
    it("accepts token with matching aud string", async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: { sub: "user-123", aud: "https://lvh.me:7003" },
        protectedHeader: { alg: "RS256" },
      } as never);

      const result = await mcpTokenVerify(makeReq(), "rs256-token");
      expect(result).toMatchObject({ extra: { user_id: "user-123", host: "lvh.me:7003" } });
    });

    it("accepts token with aud as array containing resource", async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: { sub: "user-456", aud: ["https://lvh.me:7003", "other"] },
        protectedHeader: { alg: "RS256" },
      } as never);

      const result = await mcpTokenVerify(makeReq(), "rs256-multi-aud");
      expect(result).toMatchObject({ extra: { user_id: "user-456" } });
    });

    it("rejects token with aud = 'authenticated' (password-grant)", async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: { sub: "user-789", aud: "authenticated" },
        protectedHeader: { alg: "RS256" },
      } as never);

      // aud mismatch → undefined immediately, no HS256 fallback triggered
      expect(await mcpTokenVerify(makeReq(), "password-grant-token")).toBeUndefined();
    });

    it("rejects token with missing sub", async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: { aud: "https://lvh.me:7003" },
        protectedHeader: { alg: "RS256" },
      } as never);

      expect(await mcpTokenVerify(makeReq(), "no-sub-token")).toBeUndefined();
    });

    it("returns undefined for expired / invalid-signature tokens", async () => {
      mockJwtVerify.mockRejectedValueOnce(new Error("token expired"));
      // Fallback also fails
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "expired" } });

      expect(await mcpTokenVerify(makeReq(), "expired-token")).toBeUndefined();
    });
  });

  describe("HS256 fallback (GoTrue getUser)", () => {
    it("accepts HS256 token with correct aud", async () => {
      mockJwtVerify.mockRejectedValueOnce(new Error("HS256 not verifiable locally"));
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "hs256-user" } }, error: null });
      mockDecodeJwt.mockReturnValueOnce({ sub: "hs256-user", aud: "https://lvh.me:7003" } as never);

      const result = await mcpTokenVerify(makeReq(), "hs256-oauth-token");
      expect(result).toMatchObject({ extra: { user_id: "hs256-user" } });
    });

    it("accepts HS256 token with missing aud (legacy GoTrue behaviour)", async () => {
      mockJwtVerify.mockRejectedValueOnce(new Error("HS256 not verifiable locally"));
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "hs256-user" } }, error: null });
      mockDecodeJwt.mockReturnValueOnce({ sub: "hs256-user" } as never);

      const result = await mcpTokenVerify(makeReq(), "hs256-no-aud-token");
      expect(result).toMatchObject({ extra: { user_id: "hs256-user" } });
    });

    it("rejects HS256 token with aud = 'authenticated'", async () => {
      mockJwtVerify.mockRejectedValueOnce(new Error("HS256 not verifiable locally"));
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "hs256-user" } }, error: null });
      mockDecodeJwt.mockReturnValueOnce({ sub: "hs256-user", aud: "authenticated" } as never);

      expect(await mcpTokenVerify(makeReq(), "hs256-password-grant")).toBeUndefined();
    });

    it("returns undefined when getUser reports invalid token", async () => {
      mockJwtVerify.mockRejectedValueOnce(new Error("HS256 not verifiable locally"));
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "invalid" } });

      expect(await mcpTokenVerify(makeReq(), "invalid-token")).toBeUndefined();
    });
  });
});
