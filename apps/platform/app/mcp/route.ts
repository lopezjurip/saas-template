import { createServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SERVER_INFO = { name: "saas-template", version: "1.0.0" };
const PROTOCOL_VERSION = "2024-11-05";

/**
 * MCP Streamable HTTP endpoint for the SaaS template.
 * Implements JSON-RPC 2.0 + MCP protocol (stateless per-request).
 * Auth via: `Authorization: Bearer <api_key>`
 *
 * @example
 * curl -X POST /mcp \
 *   -H "Authorization: Bearer sk_..." \
 *   -H "Content-Type: application/json" \
 *   -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return rpcError(null, -32600, "Missing Authorization header", 401);
  }

  const admin = createServiceRoleClient();
  // @ts-expect-error api_key_validate_internal not yet in schema — add before activating this route
  const { data: profileId } = await admin.rpc("api_key_validate_internal", { key_value: token });

  if (!profileId) {
    return rpcError(null, -32600, "Invalid or revoked API key", 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return rpcError(null, -32700, "Parse error", 400);
  }

  const { id, method, params } = body as {
    id: string | number | null;
    method: string;
    params?: Record<string, unknown>;
  };

  switch (method) {
    case "initialize":
      return rpcOk(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case "notifications/initialized":
      return new NextResponse(null, { status: 204 });

    case "ping":
      return rpcOk(id, {});

    case "tools/list":
      return rpcOk(id, { tools: TOOLS_LIST });

    case "tools/call": {
      const toolName = (params as { name: string; arguments?: Record<string, unknown> })["name"];
      const toolArgs = (params as { name: string; arguments?: Record<string, unknown> })["arguments"] ?? {};
      const result = await callTool(toolName, toolArgs, profileId as string, admin);
      return rpcOk(id, result);
    }

    default:
      return rpcError(id, -32601, `Method not found: ${method}`, 404);
  }
}

function rpcOk(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

const TOOLS_LIST = [
  {
    name: "viewer_profile",
    description: "Get the authenticated user's profile (name, email, id).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tenants",
    description: "List all tenants the authenticated user has access to.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tenant_by_slug",
    description: "Get a specific tenant by its slug.",
    inputSchema: {
      type: "object",
      required: ["tenant_slug"],
      properties: {
        tenant_slug: { type: "string", description: "The tenant URL slug" },
      },
    },
  },
  {
    name: "organizations",
    description: "List all organizations the authenticated user is a member of.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "agencies",
    description: "List all agencies the authenticated user has access to.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "viewer_has_permission",
    description: "Check if the authenticated user has a specific permission in an organization.",
    inputSchema: {
      type: "object",
      required: ["organization_id", "permission_id"],
      properties: {
        organization_id: { type: "number", description: "Organization ID" },
        permission_id: { type: "string", description: "Permission slug (e.g. 'members_manage' or '*')" },
      },
    },
  },
];

type AdminClient = ReturnType<typeof createServiceRoleClient>;

async function callTool(
  name: string,
  args: Record<string, unknown>,
  profileId: string,
  admin: AdminClient,
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  function ok(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
  function err(message: string) {
    return { content: [{ type: "text" as const, text: message }], isError: true };
  }

  try {
    switch (name) {
      case "viewer_profile": {
        const { data, error } = await admin
          .from("profiles")
          .select("profile_id, profile_name_full, profile_name_first, profile_name_last")
          .eq("profile_id", profileId)
          .maybeSingle();
        if (error) return err(error.message);
        return ok(data);
      }

      case "tenants": {
        const { data, error } = await admin
          .from("organization_memberships")
          .select("organizations(tenant_id, tenants(tenant_id, tenant_slug, tenant_name, tenant_tier))")
          .eq("profile_id", profileId)
          .is("organization_membership_revoked_at", null)
          .is("organization_membership_rejected_at", null);
        if (error) return err(error.message);
        const seen = new Set<number>();
        const tenants = (data ?? []).flatMap((m) => {
          const org = m["organizations"] as Record<string, unknown> | null;
          if (!org) return [];
          const t = org["tenants"] as Record<string, unknown> | null;
          if (!t || seen.has(t["tenant_id"] as number)) return [];
          seen.add(t["tenant_id"] as number);
          return [t];
        });
        return ok(tenants);
      }

      case "tenant_by_slug": {
        const tenant_slug = args["tenant_slug"] as string;
        if (!tenant_slug) return err("tenant_slug is required");
        const { data: tenant, error: tErr } = await admin
          .from("tenants")
          .select("tenant_id, tenant_slug, tenant_name, tenant_tier")
          .eq("tenant_slug", tenant_slug)
          .maybeSingle();
        if (tErr) return err(tErr.message);
        if (!tenant) return ok(null);
        const { data: membership } = await admin
          .from("organization_memberships")
          .select("organization_id")
          .eq("profile_id", profileId)
          .is("organization_membership_revoked_at", null)
          .in(
            "organization_id",
            (
              await admin.from("organizations").select("organization_id").eq("tenant_id", tenant["tenant_id"])
            ).data?.map((o) => o["organization_id"] as number) ?? [],
          )
          .limit(1)
          .maybeSingle();
        if (!membership) return err("Tenant not found or access denied");
        return ok(tenant);
      }

      case "organizations": {
        const { data, error } = await admin
          .from("organization_memberships")
          .select("organization_id, organizations(organization_id, organization_name, organization_slug, tenant_id)")
          .eq("profile_id", profileId)
          .is("organization_membership_revoked_at", null)
          .is("organization_membership_rejected_at", null);
        if (error) return err(error.message);
        const orgs = (data ?? []).map((m) => m["organizations"]).filter(Boolean);
        return ok(orgs);
      }

      case "agencies": {
        const { data, error } = await admin
          .from("agency_memberships")
          .select("agency_id, agencies(agency_id, agency_slug, agency_name)")
          .eq("profile_id", profileId)
          .is("agency_membership_revoked_at", null);
        if (error) return err(error.message);
        const agencies = (data ?? []).map((m) => m["agencies"]).filter(Boolean);
        return ok(agencies);
      }

      case "viewer_has_permission": {
        const organization_id = args["organization_id"] as number;
        const permission_id = args["permission_id"] as string;
        const { data: membership } = await admin
          .from("organization_memberships")
          .select("organization_membership_id")
          .eq("profile_id", profileId)
          .eq("organization_id", organization_id)
          .is("organization_membership_revoked_at", null)
          .maybeSingle();
        if (!membership) return ok({ has_permission: false });
        const { data: wildcard } = await admin
          .from("organization_membership_permissions")
          .select("permission_id")
          .eq("organization_membership_id", membership["organization_membership_id"])
          .eq("permission_id", "*")
          .maybeSingle();
        if (wildcard) return ok({ has_permission: true });
        const { data: perm } = await admin
          .from("organization_membership_permissions")
          .select("permission_id")
          .eq("organization_membership_id", membership["organization_membership_id"])
          .eq("permission_id", permission_id)
          .maybeSingle();
        return ok({ has_permission: !!perm });
      }

      default:
        return err(`Unknown tool: ${name}`);
    }
  } catch (e) {
    return err(String(e));
  }
}
