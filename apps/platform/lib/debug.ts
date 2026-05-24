import { CREATE_DEBUGGER } from "@packages/debug/index";
import { DEBUG } from "~/lib/constants";

// Single debugger root for apps/platform. To enable logs:
//   - Server (Node):     DEBUG="platform:*" pnpm dev
//   - Browser (devtools): localStorage.setItem("diary", "platform:*")
// Exclude a namespace with a leading "-", e.g. DEBUG="platform:*,-platform:noisy".
//
// Usage:
//   import { debug } from "~/lib/debug";
//   const log = debug("tenants:create");
//   log.error("rollback failed", { tenantId });
export const debug = CREATE_DEBUGGER("platform", DEBUG);
