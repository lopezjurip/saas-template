/**
 * MCP tools: agency permission administration.
 *
 * Two surfaces, both through pg_graphql via the authenticated (user-token) graphy client so RLS is
 * the only gate:
 *  - Agency↔org access grants (`permission_grants` with `subjectAgencyId`) — the ORG side decides,
 *    so the write policy requires `organization_manage` on the organization.
 *  - The agency's own team — affiliate lifecycle (`viewerAgencyMembership*` RPCs) and per-affiliate
 *    capabilities (`permission_grants` with `subjectAgencyMembershipId`), both gated by
 *    `agency_members_manage`.
 *
 * Inviting only attaches an EXISTING registered user; creating a brand-new auth user + sending the
 * invite email is a server-only side effect kept in the web action (GoTrue can't run under RLS).
 */

import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:agency-admin");

/** Agency↔org grants are read-access markers keyed on '*' (see external-access action). */
const GRANT_PERMISSION = "*";

/** True when a GraphQL error is a unique-violation (so a re-grant reads as idempotent). */
function IS_DUPLICATE(message: string): boolean {
  return /duplicate key value|already exists/i.test(message);
}

const GrantAgencyOrgAccessMcpMutation = /*#__PURE__*/ gql(`
  mutation GrantAgencyOrgAccessMcp($objects: [PermissionGrantsInsertInput!]!) {
    insertIntoPermissionGrantsCollection(objects: $objects) {
      affectedCount
    }
  }
`);

const OrgAccessSchema = {
  agency_id: z.number().int().positive().describe("Agency to grant/revoke access for."),
  organization_id: z.number().int().positive().describe("Organization granting/revoking the access."),
};
type OrgAccessArgs = InferArgs<typeof OrgAccessSchema>;

/**
 * `grant_agency_org_access` — let an agency reach one of your organizations.
 * RLS requires `organization_manage` on that organization.
 *
 * @example
 * await new GrantAgencyOrgAccessTool().run({ agency_id: 2, organization_id: 1 }, ctx);
 */
export class GrantAgencyOrgAccessTool extends McpTool<typeof OrgAccessSchema> {
  readonly name = "grant_agency_org_access";
  readonly description = [
    "Grant an agency read access to one of your organizations.",
    "Requires `organization_manage` (or `*`) on that organization (RLS-enforced).",
    "Idempotent: an existing grant is reported as already granted.",
  ].join(" ");
  readonly inputSchema = OrgAccessSchema;

  async *handle(args: OrgAccessArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: GrantAgencyOrgAccessMcpMutation,
      variables: {
        objects: [
          {
            subjectAgencyId: args["agency_id"],
            objectOrganizationId: args["organization_id"],
            permissionId: GRANT_PERMISSION,
          },
        ],
      },
    });

    if (error) {
      if (IS_DUPLICATE(error.message)) {
        return { content: [{ type: "text", text: "Already granted." }] };
      }
      log.error("[grant_agency_org_access] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const granted = (data?.["insertIntoPermissionGrantsCollection"]?.["affectedCount"] ?? 0) > 0;
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, granted }, null, 2) }] };
  }
}

const RevokeAgencyOrgAccessMcpMutation = /*#__PURE__*/ gql(`
  mutation RevokeAgencyOrgAccessMcp($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
    deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`);

/**
 * `revoke_agency_org_access` — remove an agency's access to one of your organizations.
 * RLS requires `organization_manage`; only org-scoped grants are matched (globals are platform-managed).
 *
 * @example
 * await new RevokeAgencyOrgAccessTool().run({ agency_id: 2, organization_id: 1 }, ctx);
 */
export class RevokeAgencyOrgAccessTool extends McpTool<typeof OrgAccessSchema> {
  readonly name = "revoke_agency_org_access";
  readonly description = [
    "Revoke an agency's access to one of your organizations.",
    "Requires `organization_manage` (or `*`) on that organization (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = OrgAccessSchema;

  async *handle(args: OrgAccessArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: RevokeAgencyOrgAccessMcpMutation,
      variables: {
        filter: {
          subjectAgencyId: { eq: args["agency_id"] },
          objectOrganizationId: { eq: args["organization_id"] },
          permissionId: { eq: GRANT_PERMISSION },
        },
      },
    });

    if (error) {
      log.error("[revoke_agency_org_access] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const revoked = (data?.["deleteFromPermissionGrantsCollection"]?.["affectedCount"] ?? 0) > 0;
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, revoked }, null, 2) }] };
  }
}

const InviteAffiliateMcpMutation = /*#__PURE__*/ gql(`
  mutation InviteAffiliateMcp($agency_id: Int!, $email: String!) {
    membership: viewerAgencyMembershipInviteByEmail(agencyId: $agency_id, email: $email) {
      agencyMembershipId
    }
  }
`);

const InviteSchema = {
  agency_id: z.number().int().positive().describe("Agency to invite the person into."),
  email: z.string().email().describe("Email of an EXISTING registered user to invite as an affiliate."),
};
type InviteArgs = InferArgs<typeof InviteSchema>;

/**
 * `invite_affiliate` — invite an existing registered user into the agency (pending until they accept).
 * RLS requires `agency_members_manage`; raises `user_not_found` if the email isn't registered.
 *
 * @example
 * await new InviteAffiliateTool().run({ agency_id: 2, email: "auditor@example.com" }, ctx);
 */
export class InviteAffiliateTool extends McpTool<typeof InviteSchema> {
  readonly name = "invite_affiliate";
  readonly description = [
    "Invite an EXISTING registered user (by email) into an agency as a pending affiliate.",
    "Requires `agency_members_manage` (or `*`) on the agency (RLS-enforced).",
    "Returns user_not_found when the email has no account — onboarding a brand-new user is done in the web app.",
  ].join(" ");
  readonly inputSchema = InviteSchema;

  async *handle(args: InviteArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: InviteAffiliateMcpMutation,
      variables: { agency_id: args["agency_id"], email: args["email"] },
    });

    if (error) {
      log.error("[invite_affiliate] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const agency_membership_id = data?.["membership"]?.["agencyMembershipId"];
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, agency_membership_id }, null, 2) }] };
  }
}

const UpdateAffiliateMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdateAffiliateMcp($agency_membership_id: Int!, $operation: String!) {
    membership: viewerAgencyMembershipUpdate(agencyMembershipId: $agency_membership_id, operation: $operation) {
      agencyMembershipId
    }
  }
`);

const UpdateAffiliateSchema = {
  agency_membership_id: z.number().int().positive().describe("Affiliate membership to revoke or reactivate."),
  operation: z.enum(["revoke", "reactivate"]).describe("'revoke' removes the affiliate; 'reactivate' restores them."),
};
type UpdateAffiliateArgs = InferArgs<typeof UpdateAffiliateSchema>;

/**
 * `update_affiliate` — revoke or reactivate an affiliate's membership.
 * RLS requires `agency_members_manage`; revoke is blocked for the agency's last team admin.
 *
 * @example
 * await new UpdateAffiliateTool().run({ agency_membership_id: 7, operation: "revoke" }, ctx);
 */
export class UpdateAffiliateTool extends McpTool<typeof UpdateAffiliateSchema> {
  readonly name = "update_affiliate";
  readonly description = [
    "Revoke or reactivate an agency affiliate's membership.",
    "Requires `agency_members_manage` (or `*`) on the agency (RLS-enforced).",
    "Revoke is blocked if it would strip the agency's last team admin (last_admin_protected).",
  ].join(" ");
  readonly inputSchema = UpdateAffiliateSchema;

  async *handle(args: UpdateAffiliateArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdateAffiliateMcpMutation,
      variables: { agency_membership_id: args["agency_membership_id"], operation: args["operation"] },
    });

    if (error) {
      log.error("[update_affiliate] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const agency_membership_id = data?.["membership"]?.["agencyMembershipId"];
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: true, agency_membership_id, operation: args["operation"] }, null, 2),
        },
      ],
    };
  }
}

const GrantAgencyMemberPermissionMcpMutation = /*#__PURE__*/ gql(`
  mutation GrantAgencyMemberPermissionMcp($objects: [PermissionGrantsInsertInput!]!) {
    insertIntoPermissionGrantsCollection(objects: $objects) {
      affectedCount
    }
  }
`);

const AgencyMemberPermSchema = {
  agency_membership_id: z.number().int().positive().describe("Affiliate membership to grant/revoke the capability on."),
  permission_id: z.string().min(1).describe("Agency capability slug, e.g. 'agency_members_manage' or '*'."),
};
type AgencyMemberPermArgs = InferArgs<typeof AgencyMemberPermSchema>;

/**
 * `grant_agency_member_permission` — grant an agency capability to an affiliate (e.g. delegate team management).
 * RLS requires `agency_members_manage` (or `*`) on the agency.
 *
 * @example
 * await new GrantAgencyMemberPermissionTool().run({ agency_membership_id: 7, permission_id: "agency_members_manage" }, ctx);
 */
export class GrantAgencyMemberPermissionTool extends McpTool<typeof AgencyMemberPermSchema> {
  readonly name = "grant_agency_member_permission";
  readonly description = [
    "Grant an agency capability (e.g. 'agency_members_manage') to an affiliate — used to delegate team management.",
    "Requires `agency_members_manage` (or `*`) on the agency (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = AgencyMemberPermSchema;

  async *handle(args: AgencyMemberPermArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: GrantAgencyMemberPermissionMcpMutation,
      variables: {
        objects: [{ subjectAgencyMembershipId: args["agency_membership_id"], permissionId: args["permission_id"] }],
      },
    });

    if (error) {
      if (IS_DUPLICATE(error.message)) {
        return { content: [{ type: "text", text: "Already granted." }] };
      }
      log.error("[grant_agency_member_permission] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const granted = (data?.["insertIntoPermissionGrantsCollection"]?.["affectedCount"] ?? 0) > 0;
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, granted, permission_id: args["permission_id"] }, null, 2) },
      ],
    };
  }
}

const RevokeAgencyMemberPermissionMcpMutation = /*#__PURE__*/ gql(`
  mutation RevokeAgencyMemberPermissionMcp($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
    deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`);

/**
 * `revoke_agency_member_permission` — remove an agency capability from an affiliate.
 * RLS requires `agency_members_manage`; the last-admin trigger blocks stripping the agency's final admin.
 *
 * @example
 * await new RevokeAgencyMemberPermissionTool().run({ agency_membership_id: 7, permission_id: "agency_members_manage" }, ctx);
 */
export class RevokeAgencyMemberPermissionTool extends McpTool<typeof AgencyMemberPermSchema> {
  readonly name = "revoke_agency_member_permission";
  readonly description = [
    "Remove an agency capability from an affiliate.",
    "Requires `agency_members_manage` (or `*`) on the agency (RLS-enforced).",
    "Blocked if it would strip the agency's last admin (last_admin_protected).",
  ].join(" ");
  readonly inputSchema = AgencyMemberPermSchema;

  async *handle(args: AgencyMemberPermArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: RevokeAgencyMemberPermissionMcpMutation,
      variables: {
        filter: {
          subjectAgencyMembershipId: { eq: args["agency_membership_id"] },
          permissionId: { eq: args["permission_id"] },
        },
      },
    });

    if (error) {
      log.error("[revoke_agency_member_permission] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const removed = (data?.["deleteFromPermissionGrantsCollection"]?.["affectedCount"] ?? 0) > 0;
    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, removed, permission_id: args["permission_id"] }, null, 2) },
      ],
    };
  }
}
