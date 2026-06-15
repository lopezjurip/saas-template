/**
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata.
 * PUBLIC endpoint — no auth required; MCP clients fetch this to discover the Authorization Server.
 *
 * GET  /.well-known/oauth-protected-resource
 * OPTIONS /.well-known/oauth-protected-resource  (CORS preflight)
 *
 * Responds on both apex and tenant subdomains (same route, different Host header).
 * `resourceUrl` is auto-detected from proxy headers by `protectedResourceHandler`.
 *
 * Authorization Server: Supabase GoTrue at NEXT_PUBLIC_SUPABASE_URL/auth/v1.
 */

import { metadataCorsOptionsRequestHandler, protectedResourceHandler } from "mcp-handler";

const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];

const handler = protectedResourceHandler({
  authServerUrls: [`${SUPABASE_URL}/auth/v1`],
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { corsHandler as OPTIONS, handler as GET };
