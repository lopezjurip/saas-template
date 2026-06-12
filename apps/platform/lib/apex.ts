import "server-only";

import { headers } from "next/headers";
import { APP_HOST } from "~/lib/constants";

/**
 * Determines if the current request is being served on the apex host (e.g. "saas-template.com" or "www.saas-template.com")
 */
export async function isApexHost(): Promise<boolean> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const hostBase = host.split(":")[0] ?? "";
  const apexBase = APP_HOST.split(":")[0] ?? "";
  return hostBase === apexBase || hostBase === `www.${apexBase}`;
}
