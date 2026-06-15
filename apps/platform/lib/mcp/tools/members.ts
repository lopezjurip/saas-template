/**
 * MCP tool: list_organization_members
 *
 * Lists active members and pending invitations for a given organization.
 * The caller must have `members_manage` permission (or `*`) on that organization —
 * `viewer_has_permission` is security definer and enforces this via RLS at query time.
 *
 * GraphQL approach: PostgREST authenticated client (NOT graphy/GraphQL).
 * Reason: `organizationMembershipsCollection` is not exposed as a top-level
 * pg_graphql query field visible to viewers, and the generated schema confirms no
 * existing ViewerOrganizationMemberships document. The members page in the app uses
 * the PostgREST client directly (see app/(app)/t/[tenant_slug]/.../settings/members/page.tsx).
 * We replicate that pattern here with an authenticated (user-token-scoped) client so
 * RLS `viewer_has_permission` gates access correctly — no service-role escalation.
 */

import { z } from "zod";
import { debug } from "~/lib/debug";
import { getSupabaseFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:members");

const ListOrganizationMembersSchema = {
  organization_id: z.number().int().positive().describe("The organization_id to list members for."),
};

type ListOrganizationMembersArgs = InferArgs<typeof ListOrganizationMembersSchema>;

/**
 * `list_organization_members` — lists active members + pending invitations for an org.
 * Requires `members_manage` (or `*`) on that org; RLS enforces it via `viewer_has_permission`.
 *
 * @example
 * const res = await new ListOrganizationMembersTool().run({ organization_id: 1 }, ctx);
 */
export class ListOrganizationMembersTool extends McpTool<typeof ListOrganizationMembersSchema> {
  readonly name = "list_organization_members";
  readonly description = [
    "Lists active members and pending invitations for the given organization.",
    "Requires `members_manage` or `*` permission on that organization;",
    "returns an error if the viewer lacks it (RLS enforcement via viewer_has_permission).",
  ].join(" ");
  readonly inputSchema = ListOrganizationMembersSchema;

  async *handle(args: ListOrganizationMembersArgs, ctx: McpContext): McpToolStream {
    const { organization_id } = args;
    const supabase = getSupabaseFromMcpAssert(ctx);

    // Check permission first using the authenticated client (RLS-backed).
    const { data: canManage, error: permError } = await supabase.rpc("viewer_has_permission", {
      organization_id,
      permission_id: "members_manage",
    });

    if (permError) {
      log.error("[list_organization_members] permission check failed: %o", {
        organization_id,
        error: permError.message,
      });
      return { content: [{ type: "text", text: `Permission check error: ${permError.message}` }], isError: true };
    }

    if (!canManage) {
      return {
        content: [{ type: "text", text: "Forbidden: requires members_manage or * permission on this organization" }],
        isError: true,
      };
    }

    const { data: members, error: membersError } = await supabase
      .from("organization_memberships")
      .select(
        "organization_membership_id, profile_id, organization_membership_invite_email, organization_membership_accepted_at, organization_membership_created_at, profiles(profile_name_full)",
      )
      .eq("organization_id", organization_id)
      .is("organization_membership_revoked_at", null)
      .is("organization_membership_rejected_at", null)
      .order("organization_membership_created_at", { ascending: true });

    if (membersError) {
      log.error("[list_organization_members] query failed: %o", { organization_id, error: membersError.message });
      return { content: [{ type: "text", text: `Error: ${membersError.message}` }], isError: true };
    }

    const result = (members ?? []).map((row: Record<string, unknown>) => ({
      organizationMembershipId: row["organization_membership_id"],
      profileId: row["profile_id"],
      profileNameFull: (row["profiles"] as Record<string, unknown> | null)?.["profile_name_full"] ?? null,
      inviteEmail: row["organization_membership_invite_email"],
      acceptedAt: row["organization_membership_accepted_at"],
      createdAt: row["organization_membership_created_at"],
      status: row["organization_membership_accepted_at"] ? "active" : "pending",
    }));

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}
