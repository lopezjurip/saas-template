// Agencies feature — shared types + pure helpers for the real-data screens.
// The DB models agencies with three tables (agencies, agency_memberships,
// agencies_organizations_grants). Affiliation state is derived from the
// *_accepted_at / *_revoked_at / *_rejected_at columns; grants are explicit
// per-org or global (organization_id IS NULL) and always carry permission_id '*'
// (the catalog has no read-only capability slugs, and the read-visibility RLS
// only ever checks '*').

export const AGENCY_WILDCARD = "*";

export type AffiliationState = "accepted" | "pending" | "revoked" | "rejected";

// Mirrors the relevant columns of public.agency_memberships.
export type MembershipTimestamps = {
  agency_membership_accepted_at: string | null;
  agency_membership_revoked_at: string | null;
  agency_membership_rejected_at: string | null;
};

/**
 * Derives the affiliation state from the membership lifecycle timestamps.
 * Precedence: revoked > rejected > accepted > pending.
 */
export function AFFILIATION_STATE(m: MembershipTimestamps): AffiliationState {
  if (m.agency_membership_revoked_at) return "revoked";
  if (m.agency_membership_rejected_at) return "rejected";
  if (m.agency_membership_accepted_at) return "accepted";
  return "pending";
}

/** An affiliate is "active" when accepted and neither revoked nor rejected. */
export function IS_ACTIVE_MEMBERSHIP(m: MembershipTimestamps): boolean {
  return AFFILIATION_STATE(m) === "accepted";
}

/** Two-letter avatar initials for a name (or email local-part). Pure. */
export function INITIALS_OF(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}
