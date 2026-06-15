/**
 * MCP tool: whoami
 *
 * Returns the authenticated viewer's profile.
 * RLS `viewer_profile_id()` (reads `sub` from the Bearer token) scopes the result.
 */

import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:whoami");

const WhoamiMcpQuery = /*#__PURE__*/ gql(`
  query WhoamiMcp {
    profile: viewerProfile {
      profileId
      profileNameFull
      profileOnboardedAt
      profileDisabledAt
      profileCreatedAt
      profileUpdatedAt
    }
  }
`);

/**
 * `whoami` — returns the authenticated user's profile.
 *
 * @example
 * const res = await new WhoamiTool().run({}, ctx);
 */
export class WhoamiTool extends McpTool {
  readonly name = "whoami";
  readonly description = "Returns the authenticated user's profile (display name, onboarding status, timestamps).";

  async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream {
    const { data, error } = await ctx.graphy.query({ query: WhoamiMcpQuery });

    if (error) {
      log.error("[whoami] graphy query failed: %o", { message: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const profile = data?.["profile"];
    if (!profile) {
      return { content: [{ type: "text", text: "Profile not found" }], isError: true };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              profileId: profile["profileId"],
              profileNameFull: profile["profileNameFull"],
              profileOnboardedAt: profile["profileOnboardedAt"],
              profileDisabledAt: profile["profileDisabledAt"],
              profileCreatedAt: profile["profileCreatedAt"],
              profileUpdatedAt: profile["profileUpdatedAt"],
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
