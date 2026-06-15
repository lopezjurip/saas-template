export const runtime = "nodejs";

import { createHash, createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import type { Database } from "@packages/supabase/types";
import { z } from "zod";
import { debug } from "~/lib/debug";

const log = debug("app:api:mcp");

const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
const JWT_SECRET = process.env["SUPABASE_JWT_SECRET"] ?? "super-secret-jwt-token-with-at-least-32-characters-long";

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function MINT_USER_JWT(profileId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        sub: profileId,
        role: "authenticated",
        iss: "supabase",
        aud: "authenticated",
        iat: now,
        exp: now + 300,
      }),
    ),
  );
  const signing = `${header}.${payload}`;
  const sig = b64url(createHmac("sha256", JWT_SECRET).update(signing).digest());
  return `${signing}.${sig}`;
}

async function VALIDATE_BEARER(token: string): Promise<string | null> {
  const hash = createHash("sha256").update(token).digest("hex");
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("api_keys")
    .select("profile_id, api_key_id")
    .eq("api_key_hash", hash)
    .is("api_key_revoked_at", null)
    .maybeSingle();
  if (!data) return null;
  await admin
    .from("api_keys")
    .update({ api_key_last_used_at: new Date().toISOString() })
    .eq("api_key_id", data["api_key_id"]);
  return data["profile_id"];
}

function CREATE_USER_SUPABASE(profileId: string) {
  const jwt = MINT_USER_JWT(profileId);
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function BUILD_MCP_SERVER(profileId: string): McpServer {
  const supabase = CREATE_USER_SUPABASE(profileId);

  const server = new McpServer({ name: "saas-template", version: "1.0.0" });

  server.registerTool(
    "viewer_profile",
    { description: "Get the authenticated user's profile (id and full name)." },
    async () => {
      const { data, error } = await supabase.rpc("viewer_profile", {});
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "tenants",
    { description: "List all tenants the authenticated user belongs to." },
    async () => {
      const { data, error } = await supabase.rpc("viewer_tenants");
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "tenant_by_slug",
    { description: "Get a specific tenant by its URL slug.", inputSchema: { tenant_slug: z.string() } },
    async ({ tenant_slug }) => {
      const { data, error } = await supabase.rpc("viewer_tenant_by_slug", { tenant_slug });
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "organizations",
    { description: "List all organizations the authenticated user is a member of." },
    async () => {
      const { data, error } = await supabase.rpc("viewer_organizations");
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "agencies",
    { description: "List all agencies the authenticated user has access to." },
    async () => {
      const { data, error } = await supabase.rpc("viewer_agencies");
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "viewer_has_permission",
    {
      description: "Check whether the authenticated user has a specific permission in an organization.",
      inputSchema: { organization_id: z.number().int(), permission_id: z.string() },
    },
    async ({ organization_id, permission_id }) => {
      const { data, error } = await supabase.rpc("viewer_has_permission", { organization_id, permission_id });
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "viewer_tenant_create",
    {
      description: "Create a new tenant with a unique slug.",
      inputSchema: { tenant_name: z.string().min(1), tenant_slug: z.string().min(1) },
    },
    async ({ tenant_name, tenant_slug }) => {
      const { data, error } = await supabase.rpc("viewer_tenant_create", { tenant_name, tenant_slug });
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "viewer_organization_create",
    {
      description: "Create a new organization inside a tenant.",
      inputSchema: {
        organization_name: z.string().min(1),
        organization_slug: z.string().min(1),
        tenant_id: z.number().int(),
      },
    },
    async ({ organization_name, organization_slug, tenant_id }) => {
      const { data, error } = await supabase.rpc("viewer_organization_create", {
        organization_name,
        organization_slug,
        tenant_id,
      });
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  server.registerTool(
    "viewer_profile_update",
    {
      description: "Update the authenticated user's full name.",
      inputSchema: { profile_name_full: z.string().min(2) },
    },
    async ({ profile_name_full }) => {
      const { data, error } = await supabase.rpc("viewer_profile_update", { profile_name_full });
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    },
  );

  return server;
}

async function handleMcp(request: Request): Promise<Response> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const profileId = await VALIDATE_BEARER(token);
  if (!profileId) {
    log.warn("[handleMcp] invalid or revoked API key");
    return new Response(JSON.stringify({ error: "Invalid or revoked API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const server = BUILD_MCP_SERVER(profileId);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}

export const GET = handleMcp;
export const POST = handleMcp;
export const DELETE = handleMcp;
