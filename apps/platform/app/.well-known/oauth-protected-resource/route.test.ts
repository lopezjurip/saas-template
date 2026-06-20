import { describe, expect, it, vi } from "vitest";

// Set env var before the route module initializes (vi.hoisted runs before static imports)
const { capturedConfig } = vi.hoisted(() => {
  process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://test.supabase.co";
  return { capturedConfig: { authServerUrls: [] as string[] } };
});

vi.mock("mcp-handler", () => ({
  protectedResourceHandler: (config: { authServerUrls: string[] }) => {
    capturedConfig.authServerUrls = [...config.authServerUrls];
    return async (req: Request) =>
      new Response(
        JSON.stringify({ resource: new URL(req.url).origin, authorization_servers: config.authServerUrls }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
  },
  metadataCorsOptionsRequestHandler: () => async () => new Response(null, { status: 204 }),
}));

import { GET } from "~/app/.well-known/oauth-protected-resource/route";

describe("oauth-protected-resource route", () => {
  it("authorization server URL is NEXT_PUBLIC_SUPABASE_URL + /auth/v1", () => {
    // Fails if [auth.oauth_server] is disabled or SUPABASE_URL is wrong
    expect(capturedConfig.authServerUrls[0]).toBe("https://test.supabase.co/auth/v1");
  });

  it("GET responds 200 with authorization_servers ending in /auth/v1", async () => {
    const req = new Request("https://example.com/.well-known/oauth-protected-resource");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorization_servers: string[] };
    expect(body["authorization_servers"][0]).toMatch(/\/auth\/v1$/);
  });
});
