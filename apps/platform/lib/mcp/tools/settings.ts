/**
 * MCP tools: tenant / organization settings administration.
 *
 * Native pg_graphql collection updates through the authenticated (user-token) graphy client; RLS is
 * the only gate. The `tenants` UPDATE policy requires `tenant_manage`; the `organizations` UPDATE
 * policy requires `organization_manage`. `filter` and `set` are both passed as typed variables.
 */

import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:settings");

const UpdateTenantMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdateTenantMcp($filter: TenantsFilter!, $set: TenantsUpdateInput!, $atMost: Int! = 1000) {
    updateTenantsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
      records {
        tenantName
        tenantOnboardedAt
      }
    }
  }
`);

const RenameTenantSchema = {
  tenant_id: z.number().int().positive().describe("Tenant to rename."),
  tenant_name: z.string().min(1).max(100).describe("New tenant name."),
};
type RenameTenantArgs = InferArgs<typeof RenameTenantSchema>;

/**
 * `rename_tenant` — change a tenant's display name. RLS requires `tenant_manage`.
 *
 * @example
 * await new RenameTenantTool().run({ tenant_id: 1, tenant_name: "Acme Holdings" }, ctx);
 */
export class RenameTenantTool extends McpTool<typeof RenameTenantSchema> {
  readonly name = "rename_tenant";
  readonly description = [
    "Rename a tenant (the billing entity).",
    "Requires `tenant_manage` (or `*`) on the tenant (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = RenameTenantSchema;

  async *handle(args: RenameTenantArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdateTenantMcpMutation,
      variables: {
        filter: { tenantId: { eq: args["tenant_id"] } },
        set: { tenantName: args["tenant_name"] },
      },
    });

    if (error) {
      log.error("[rename_tenant] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const record = data?.["updateTenantsCollection"]?.["records"]?.[0];
    if (!record) {
      return { content: [{ type: "text", text: "Forbidden or tenant not found." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, tenant_name: record["tenantName"] }, null, 2) }],
    };
  }
}

const UpdateOrganizationMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdateOrganizationMcp($filter: OrganizationsFilter!, $set: OrganizationsUpdateInput!, $atMost: Int! = 1000) {
    updateOrganizationsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
    }
  }
`);

const RenameOrgSchema = {
  organization_id: z.number().int().positive().describe("Organization to rename."),
  organization_name: z.string().min(1).max(100).describe("New organization name."),
};
type RenameOrgArgs = InferArgs<typeof RenameOrgSchema>;

/**
 * `rename_organization` — change an organization's display name. RLS requires `organization_manage`.
 *
 * @example
 * await new RenameOrganizationTool().run({ organization_id: 1, organization_name: "Acme Chile" }, ctx);
 */
export class RenameOrganizationTool extends McpTool<typeof RenameOrgSchema> {
  readonly name = "rename_organization";
  readonly description = [
    "Rename an organization (the operating unit).",
    "Requires `organization_manage` (or `*`) on the organization (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = RenameOrgSchema;

  async *handle(args: RenameOrgArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdateOrganizationMcpMutation,
      variables: {
        filter: { organizationId: { eq: args["organization_id"] } },
        set: { organizationName: args["organization_name"] },
      },
    });

    if (error) {
      log.error("[rename_organization] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const changed = (data?.["updateOrganizationsCollection"]?.["affectedCount"] ?? 0) > 0;
    if (!changed) {
      return { content: [{ type: "text", text: "Forbidden or organization not found." }], isError: true };
    }
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, organization_name: args["organization_name"] }, null, 2) },
      ],
    };
  }
}

const FinishOnboardingSchema = {
  tenant_id: z.number().int().positive().describe("Tenant whose onboarding to mark finished."),
};
type FinishOnboardingArgs = InferArgs<typeof FinishOnboardingSchema>;

/**
 * `finish_tenant_onboarding` — stamp a tenant's onboarding as complete. RLS requires `tenant_manage`.
 *
 * @example
 * await new FinishTenantOnboardingTool().run({ tenant_id: 1 }, ctx);
 */
export class FinishTenantOnboardingTool extends McpTool<typeof FinishOnboardingSchema> {
  readonly name = "finish_tenant_onboarding";
  readonly description = [
    "Mark a tenant's onboarding as finished.",
    "Requires `tenant_manage` (or `*`) on the tenant (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = FinishOnboardingSchema;

  async *handle(args: FinishOnboardingArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdateTenantMcpMutation,
      variables: {
        filter: { tenantId: { eq: args["tenant_id"] } },
        set: { tenantOnboardedAt: new Date().toISOString() },
      },
    });

    if (error) {
      log.error("[finish_tenant_onboarding] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const record = data?.["updateTenantsCollection"]?.["records"]?.[0];
    if (!record) {
      return { content: [{ type: "text", text: "Forbidden or tenant not found." }], isError: true };
    }
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, tenant_onboarded_at: record["tenantOnboardedAt"] }, null, 2) },
      ],
    };
  }
}
