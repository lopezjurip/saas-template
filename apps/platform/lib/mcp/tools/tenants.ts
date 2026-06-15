/**
 * MCP tools: list_tenants, list_organizations
 *
 * Viewer-scoped listings — RLS `viewer_tenant_ids()` / `viewer_organization_ids()`
 * enforce that only tenants and organizations the caller belongs to are returned.
 */

import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:tenants");

const ListTenantsMcpQuery = /*#__PURE__*/ gql(`
  query ListTenantsMcp {
    tenants: viewerTenants(orderBy: [{ tenantName: AscNullsLast }]) {
      edges {
        node {
          tenantId
          tenantSlug
          tenantName
          tenantTier
        }
      }
    }
  }
`);

const ListOrganizationsMcpQuery = /*#__PURE__*/ gql(`
  query ListOrganizationsMcp {
    organizations: viewerOrganizations(orderBy: [{ organizationName: AscNullsLast }]) {
      edges {
        node {
          organizationId
          tenantId
          organizationSlug
          organizationName
        }
      }
    }
  }
`);

/**
 * `list_tenants` — lists tenants the authenticated user belongs to.
 *
 * @example
 * const res = await new ListTenantsTool().run({}, ctx);
 */
export class ListTenantsTool extends McpTool {
  readonly name = "list_tenants";
  readonly description =
    "Lists all tenants the authenticated user is a member of (via any organization). RLS enforces membership.";

  async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.query({ query: ListTenantsMcpQuery });

    if (error) {
      log.error("[list_tenants] graphy query failed: %o", { message: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const edges = data?.["tenants"]?.["edges"] ?? [];
    const tenants = edges.map((edge) => {
      const node = edge["node"];
      return {
        tenantId: node["tenantId"],
        tenantSlug: node["tenantSlug"],
        tenantName: node["tenantName"],
        tenantTier: node["tenantTier"],
      };
    });

    return { content: [{ type: "text", text: JSON.stringify(tenants, null, 2) }] };
  }
}

/**
 * `list_organizations` — lists organizations the authenticated user belongs to.
 *
 * @example
 * const res = await new ListOrganizationsTool().run({}, ctx);
 */
export class ListOrganizationsTool extends McpTool {
  readonly name = "list_organizations";
  readonly description = "Lists all organizations the authenticated user is a member of. RLS enforces membership.";

  async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.query({ query: ListOrganizationsMcpQuery });

    if (error) {
      log.error("[list_organizations] graphy query failed: %o", { message: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const edges = data?.["organizations"]?.["edges"] ?? [];
    const organizations = edges.map((edge) => {
      const node = edge["node"];
      return {
        organizationId: node["organizationId"],
        tenantId: node["tenantId"],
        organizationSlug: node["organizationSlug"],
        organizationName: node["organizationName"],
      };
    });

    return { content: [{ type: "text", text: JSON.stringify(organizations, null, 2) }] };
  }
}
