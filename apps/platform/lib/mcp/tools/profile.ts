/**
 * MCP tool: update_profile
 *
 * Updates the authenticated viewer's display name.
 * The mutation filters on `profileId: { eq: $profile_id }` — RLS ensures only
 * the viewer's own profile row is mutated (viewer_profile_id() matches `sub`).
 *
 * The profile_id argument is taken from `ctx.userId` (set in `verifyToken`).
 */

import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:profile");

const UpdateProfileMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdateProfileMcp($filter: ProfilesFilter!, $set: ProfilesUpdateInput!) {
    updateProfilesCollection(filter: $filter, set: $set) {
      affectedCount
    }
  }
`);

const UpdateProfileSchema = {
  profile_name_full: z.string().min(1).max(256).describe("New display name for the viewer's profile."),
};

type UpdateProfileArgs = InferArgs<typeof UpdateProfileSchema>;

/**
 * `update_profile` — updates the authenticated viewer's display name.
 *
 * @example
 * const res = await new UpdateProfileTool().run({ profile_name_full: "Ada" }, ctx);
 */
export class UpdateProfileTool extends McpTool<typeof UpdateProfileSchema> {
  readonly name = "update_profile";
  readonly description =
    "Updates the authenticated viewer's display name (profileNameFull). Only the viewer's own profile can be updated — RLS enforces this.";
  readonly inputSchema = UpdateProfileSchema;

  async *handle(args: UpdateProfileArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);

    if (!ctx.userId) {
      return { content: [{ type: "text", text: "Could not resolve userId from token" }], isError: true };
    }

    const { data, error } = await graphy.mutate({
      query: UpdateProfileMcpMutation,
      variables: {
        filter: { profileId: { eq: ctx.userId } },
        set: { profileNameFull: args["profile_name_full"] },
      },
    });

    if (error) {
      log.error("[update_profile] mutation failed: %o", { userId: ctx.userId, message: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const affectedCount = data?.["updateProfilesCollection"]?.["affectedCount"] ?? 0;
    if (affectedCount === 0) {
      return {
        content: [{ type: "text", text: "No profile updated (profile not found or RLS denied)" }],
        isError: true,
      };
    }

    return {
      content: [
        { type: "text", text: JSON.stringify({ updated: true, profileNameFull: args["profile_name_full"] }, null, 2) },
      ],
    };
  }
}
