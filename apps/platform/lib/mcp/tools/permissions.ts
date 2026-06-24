/**
 * MCP tools: organization member permission administration.
 *
 * All four go through pg_graphql via the authenticated (user-token) graphy client, so Postgres RLS
 * is the only enforcement — no service-role escalation. The `organization_membership_permissions`
 * and `organization_memberships` write policies require `members_manage` (or `*`) on the membership's
 * organization; the last-admin triggers protect against lockout. This mirrors exactly what the web
 * member-edit form does (same GraphQL mutations), just exposed as MCP tools.
 */

import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:permissions");

/** True when a GraphQL error is a unique-violation (so a re-grant reads as idempotent). */
function IS_DUPLICATE(message: string): boolean {
  return /duplicate key value|already exists/i.test(message);
}

const GrantMemberPermissionMcpMutation = /*#__PURE__*/ gql(`
  mutation GrantMemberPermissionMcp($objects: [OrganizationMembershipPermissionsInsertInput!]!) {
    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {
      affectedCount
    }
  }
`);

const GrantSchema = {
  organization_membership_id: z.number().int().positive().describe("Target membership to grant the permission to."),
  permission_id: z.string().min(1).describe("Permission slug from the catalog, e.g. 'members_manage' or '*'."),
};
type GrantArgs = InferArgs<typeof GrantSchema>;

/**
 * `grant_member_permission` — grant one permission slug to a member.
 * RLS requires `members_manage` on the membership's org; the FK rejects unknown slugs.
 *
 * @example
 * await new GrantMemberPermissionTool().run({ organization_membership_id: 3, permission_id: "members_manage" }, ctx);
 */
export class GrantMemberPermissionTool extends McpTool<typeof GrantSchema> {
  readonly name = "grant_member_permission";
  readonly description = [
    "Grant one permission slug to an organization member.",
    "Requires `members_manage` (or `*`) on that member's organization (RLS-enforced).",
    "Idempotent: re-granting an existing permission is reported as already granted.",
  ].join(" ");
  readonly inputSchema = GrantSchema;

  async *handle(args: GrantArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: GrantMemberPermissionMcpMutation,
      variables: {
        objects: [
          { organizationMembershipId: args["organization_membership_id"], permissionId: args["permission_id"] },
        ],
      },
    });

    if (error) {
      if (IS_DUPLICATE(error.message)) {
        return { content: [{ type: "text", text: "Already granted." }] };
      }
      log.error("[grant_member_permission] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const affected = data?.["insertIntoOrganizationMembershipPermissionsCollection"]?.["affectedCount"] ?? 0;
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, granted: args["permission_id"], affected }, null, 2) },
      ],
    };
  }
}

const RevokeMemberPermissionMcpMutation = /*#__PURE__*/ gql(`
  mutation RevokeMemberPermissionMcp($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {
    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`);

const RevokeSchema = GrantSchema;
type RevokeArgs = InferArgs<typeof RevokeSchema>;

/**
 * `revoke_member_permission` — remove one permission slug from a member.
 * RLS requires `members_manage`; the last-admin trigger blocks stripping the org's final admin.
 *
 * @example
 * await new RevokeMemberPermissionTool().run({ organization_membership_id: 3, permission_id: "presets_manage" }, ctx);
 */
export class RevokeMemberPermissionTool extends McpTool<typeof RevokeSchema> {
  readonly name = "revoke_member_permission";
  readonly description = [
    "Remove one permission slug from an organization member.",
    "Requires `members_manage` (or `*`) on that member's organization (RLS-enforced).",
    "Blocked if it would strip the organization's last admin (last_admin_protected).",
  ].join(" ");
  readonly inputSchema = RevokeSchema;

  async *handle(args: RevokeArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: RevokeMemberPermissionMcpMutation,
      variables: {
        filter: {
          organizationMembershipId: { eq: args["organization_membership_id"] },
          permissionId: { eq: args["permission_id"] },
        },
      },
    });

    if (error) {
      log.error("[revoke_member_permission] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const removed = (data?.["deleteFromOrganizationMembershipPermissionsCollection"]?.["affectedCount"] ?? 0) > 0;
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, removed, permission_id: args["permission_id"] }, null, 2) },
      ],
    };
  }
}

const SetMemberPermissionsMcpMutation = /*#__PURE__*/ gql(`
  mutation SetMemberPermissionsMcp($organization_membership_id: Int!, $permission_ids: [String]!) {
    result: viewerOrganizationMembershipSetPermissionsCollection(
      organizationMembershipId: $organization_membership_id
      permissionIds: $permission_ids
    ) {
      edges { node { permissionId } }
    }
  }
`);

const SetSchema = {
  organization_membership_id: z
    .number()
    .int()
    .positive()
    .describe("Target membership whose permission set is replaced."),
  permission_ids: z
    .array(z.string().min(1))
    .describe("Final, exact set of permission slugs (e.g. a preset's slugs). Replaces all current grants."),
};
type SetArgs = InferArgs<typeof SetSchema>;

/**
 * `set_member_permissions` — atomically replace a member's whole permission set (preset apply).
 * One round-trip via `viewerOrganizationMembershipSetPermissionsCollection`; requires `members_manage`.
 *
 * @example
 * await new SetMemberPermissionsTool().run({ organization_membership_id: 3, permission_ids: ["organization_manage","members_manage"] }, ctx);
 */
export class SetMemberPermissionsTool extends McpTool<typeof SetSchema> {
  readonly name = "set_member_permissions";
  readonly description = [
    "Atomically replace an organization member's entire permission set with the given slugs",
    "(use this to apply a preset). Requires `members_manage` (or `*`); the last-admin trigger",
    "still blocks clearing the org's final admin. Returns the resulting permission slugs.",
  ].join(" ");
  readonly inputSchema = SetSchema;

  async *handle(args: SetArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: SetMemberPermissionsMcpMutation,
      variables: {
        organization_membership_id: args["organization_membership_id"],
        permission_ids: args["permission_ids"],
      },
    });

    if (error) {
      log.error("[set_member_permissions] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const edges = data?.["result"]?.["edges"] ?? [];
    const slugs = edges.map((edge) => edge["node"]["permissionId"]);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, permissions: slugs }, null, 2) }] };
  }
}

const UpdateMemberStatusMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdateMemberStatusMcp($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
    }
  }
`);

const StatusSchema = {
  organization_membership_id: z.number().int().positive().describe("Membership to revoke or reactivate."),
  operation: z.enum(["revoke", "reactivate"]).describe("'revoke' removes access; 'reactivate' restores it."),
};
type StatusArgs = InferArgs<typeof StatusSchema>;

/**
 * `update_member_status` — revoke or reactivate a membership.
 * RLS requires `members_manage`; the revoke trigger blocks self-removal and last-admin removal.
 *
 * @example
 * await new UpdateMemberStatusTool().run({ organization_membership_id: 3, operation: "revoke" }, ctx);
 */
export class UpdateMemberStatusTool extends McpTool<typeof StatusSchema> {
  readonly name = "update_member_status";
  readonly description = [
    "Revoke or reactivate an organization membership.",
    "Requires `members_manage` (or `*`) on that member's organization (RLS-enforced).",
    "Revoke is blocked for self-removal and for the organization's last admin.",
  ].join(" ");
  readonly inputSchema = StatusSchema;

  async *handle(args: StatusArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdateMemberStatusMcpMutation,
      variables: {
        filter: { organizationMembershipId: { eq: args["organization_membership_id"] } },
        set: { organizationMembershipRevokedAt: args["operation"] === "revoke" ? new Date().toISOString() : null },
      },
    });

    if (error) {
      log.error("[update_member_status] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const changed = (data?.["updateOrganizationMembershipsCollection"]?.["affectedCount"] ?? 0) > 0;
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, changed, operation: args["operation"] }, null, 2) }],
    };
  }
}
