import { describe, expect, it } from "vitest";
import type { McpContext } from "~/lib/mcp/tool";
import { getGraphyFromMcpAssert, getSupabaseFromMcpAssert, McpUnauthorizedError } from "./clients";

const ANON: McpContext = { token: undefined, userId: undefined, host: undefined };

describe("MCP client resolvers — Assert gating", () => {
  it("getGraphyFromMcpAssert throws McpUnauthorizedError for anonymous callers", () => {
    expect(() => getGraphyFromMcpAssert(ANON)).toThrow(McpUnauthorizedError);
  });

  it("getSupabaseFromMcpAssert throws McpUnauthorizedError for anonymous callers", () => {
    expect(() => getSupabaseFromMcpAssert(ANON)).toThrow(McpUnauthorizedError);
  });
});
