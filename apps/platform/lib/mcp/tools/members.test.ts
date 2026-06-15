import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it, vi } from "vitest";
import type { McpContext } from "~/lib/mcp/tool";
import { ListOrganizationMembersTool } from "./members";

/** Reads the text payload of the first content block. */
function TEXT_OF(res: CallToolResult): string {
  const block = res.content[0];
  return block && block.type === "text" ? block.text : "";
}

/** Fake PostgREST query builder whose terminal `.order()` resolves to `result`. */
function QUERY_BUILDER(result: unknown) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "is"]) {
    builder[method] = () => builder;
  }
  builder["order"] = () => Promise.resolve(result);
  return builder;
}

/** Builds a fake McpContext with a stubbed Supabase client. */
function CONTEXT(rpcResult: unknown, membersResult: unknown): McpContext {
  return {
    token: "token",
    userId: "user-1",
    host: undefined,
    graphy: {} as never,
    supabase: {
      rpc: vi.fn().mockResolvedValue(rpcResult),
      from: () => QUERY_BUILDER(membersResult),
    },
  } as unknown as McpContext;
}

describe("ListOrganizationMembersTool", () => {
  it("returns Forbidden when the viewer lacks the permission", async () => {
    const ctx = CONTEXT({ data: false, error: null }, { data: [], error: null });

    const res = await new ListOrganizationMembersTool().run({ organization_id: 1 }, ctx);

    expect(res.isError).toBe(true);
    expect(TEXT_OF(res)).toContain("Forbidden");
  });

  it("surfaces a permission-check error", async () => {
    const ctx = CONTEXT({ data: null, error: { message: "rpc down" } }, { data: [], error: null });

    const res = await new ListOrganizationMembersTool().run({ organization_id: 1 }, ctx);

    expect(res.isError).toBe(true);
    expect(TEXT_OF(res)).toContain("rpc down");
  });

  it("lists members when the viewer has the permission", async () => {
    const ctx = CONTEXT(
      { data: true, error: null },
      {
        data: [
          {
            organization_membership_id: 10,
            profile_id: "p1",
            profiles: { profile_name_full: "Ada" },
            organization_membership_invite_email: null,
            organization_membership_accepted_at: "2026-01-01T00:00:00Z",
            organization_membership_created_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      },
    );

    const res = await new ListOrganizationMembersTool().run({ organization_id: 1 }, ctx);

    expect(res.isError).toBeUndefined();
    const parsed = JSON.parse(TEXT_OF(res));
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ organizationMembershipId: 10, profileNameFull: "Ada", status: "active" });
  });
});
