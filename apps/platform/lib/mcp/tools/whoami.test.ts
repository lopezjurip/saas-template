import type { CallToolResult, ServerNotification } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it, vi } from "vitest";
import { type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
import { WhoamiTool } from "./whoami";

/** Builds a fake McpContext whose `graphy.query` resolves to the given result. */
function CONTEXT(queryResult: unknown): McpContext {
  return {
    token: "token",
    userId: "user-1",
    host: undefined,
    graphy: { query: vi.fn().mockResolvedValue(queryResult) },
    supabase: {} as never,
  } as unknown as McpContext;
}

/** Reads the text payload of the first content block. */
function TEXT_OF(res: CallToolResult): string {
  const block = res.content[0];
  return block && block.type === "text" ? block.text : "";
}

describe("WhoamiTool", () => {
  it("returns the viewer profile as JSON", async () => {
    const ctx = CONTEXT({
      data: { profile: { profileId: "p1", profileNameFull: "Ada" } },
      error: null,
    });

    const res = await new WhoamiTool().run({}, ctx);

    expect(res.isError).toBeUndefined();
    expect(JSON.parse(TEXT_OF(res))).toMatchObject({ profileId: "p1", profileNameFull: "Ada" });
  });

  it("surfaces a graphy error", async () => {
    const ctx = CONTEXT({ data: null, error: { message: "boom" } });

    const res = await new WhoamiTool().run({}, ctx);

    expect(res.isError).toBe(true);
    expect(TEXT_OF(res)).toContain("boom");
  });

  it("returns an error when no profile is found", async () => {
    const ctx = CONTEXT({ data: { profile: null }, error: null });

    const res = await new WhoamiTool().run({}, ctx);

    expect(res.isError).toBe(true);
    expect(TEXT_OF(res)).toContain("Profile not found");
  });
});

/** Tool that streams two notifications then returns — exercises `run`'s generator driver. */
class StreamingTool extends McpTool {
  readonly name = "streaming";
  readonly description = "test";

  async *handle(_args: Record<string, unknown>, _ctx: McpContext): McpToolStream {
    yield { method: "notifications/message", params: { level: "info", data: "step 1" } };
    yield { method: "notifications/message", params: { level: "info", data: "step 2" } };
    return { content: [{ type: "text", text: "done" }] };
  }
}

describe("McpTool.run", () => {
  it("forwards each yielded notification to emit and returns the final result", async () => {
    const ctx = {} as McpContext;
    const notifications: ServerNotification[] = [];

    const res = await new StreamingTool().run({}, ctx, (notification) => {
      notifications.push(notification);
    });

    expect(notifications).toHaveLength(2);
    expect(notifications[0]).toMatchObject({ method: "notifications/message", params: { data: "step 1" } });
    expect(res.isError).toBeUndefined();
    expect(TEXT_OF(res)).toBe("done");
  });

  it("works without an emit callback (drops notifications)", async () => {
    const res = await new StreamingTool().run({}, {} as McpContext);

    expect(TEXT_OF(res)).toBe("done");
  });
});
