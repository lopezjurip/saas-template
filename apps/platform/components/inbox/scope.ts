import type { Route } from "next";
import { ROUTE } from "~/lib/route";

/**
 * Discriminated union representing the three conversation inbox scopes.
 *
 * @example
 * const scope: InboxScope = { kind: "personal" };
 * const scope: InboxScope = { kind: "organization", tenant_slug: "acme", organization_id: 42 };
 * const scope: InboxScope = { kind: "agency", agency_slug: "abc", agency_id: 7 };
 */
export type InboxScope =
  | { kind: "personal" }
  | { kind: "organization"; tenant_slug: string; organization_id: number }
  | { kind: "agency"; agency_slug: string; agency_id: number };

/**
 * Returns the RPC args (without `include_archived`) for a given inbox scope.
 * Caller merges with `{ include_archived }`.
 *
 * @example
 * const args = SCOPE_RPC_ARGS({ kind: "personal" });
 * // { p_scope: "personal" }
 */
export function SCOPE_RPC_ARGS(scope: InboxScope): {
  p_scope: string;
  p_organization_id?: number;
  p_agency_id?: number;
} {
  if (scope.kind === "personal") {
    return { p_scope: "personal" };
  }
  if (scope.kind === "organization") {
    return { p_scope: "organization", p_organization_id: scope.organization_id };
  }
  return { p_scope: "agency", p_agency_id: scope.agency_id };
}

/**
 * Returns the inbox list href for a given scope.
 *
 * @example
 * SCOPE_INBOX_HREF({ kind: "personal" }) // "/home/inbox"
 */
export function SCOPE_INBOX_HREF(scope: InboxScope): Route {
  if (scope.kind === "personal") {
    return ROUTE("/home/inbox");
  }
  if (scope.kind === "organization") {
    return ROUTE("/t/[tenant_slug]/[organization_id]/inbox", {
      tenant_slug: scope.tenant_slug,
      organization_id: scope.organization_id,
    });
  }
  return ROUTE("/a/[agency_slug]/inbox", { agency_slug: scope.agency_slug });
}

/**
 * Returns the detail href for a given scope and conversation ID.
 *
 * @example
 * SCOPE_DETAIL_HREF({ kind: "personal" }, "conv-uuid")
 * // "/home/inbox/conv-uuid"
 */
export function SCOPE_DETAIL_HREF(scope: InboxScope, conversation_id: string): Route {
  if (scope.kind === "personal") {
    return ROUTE("/home/inbox/[conversation_id]", { conversation_id });
  }
  if (scope.kind === "organization") {
    return ROUTE("/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]", {
      tenant_slug: scope.tenant_slug,
      organization_id: scope.organization_id,
      conversation_id,
    });
  }
  return ROUTE("/a/[agency_slug]/inbox/[conversation_id]", {
    agency_slug: scope.agency_slug,
    conversation_id,
  });
}
