export const APP_HOST = process.env["NEXT_PUBLIC_APEX_HOST"] ?? "lvh.me:7003";
// Domain-only portion of APP_HOST (no port) — used for hostname matching in the proxy
// so the port doesn't have to match the configured default port (e.g. when running on a different port in dev).
export const APEX_HOSTNAME = APP_HOST.split(":")[0] as string;

export const DEBUG = process.env["DEBUG"];
