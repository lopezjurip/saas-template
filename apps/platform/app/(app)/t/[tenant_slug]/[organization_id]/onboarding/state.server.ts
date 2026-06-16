import "server-only";

import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import type { TenantOnboardingState } from "./state";

/**
 * Everything the tenant onboarding banner needs in a single round-trip, rooted at the tenant:
 * the finish flag, whether a logo exists (presence of an `avatar` row on the nested
 * `storage_tenants` relationship), and the per-organization membership counts. RLS scopes every
 * nested collection to what the viewer may see.
 */
const TenantOnboardingStateGet = /*#__PURE__*/ gql(`
  query TenantOnboardingStateGet($tenant_id: Int!) {
    tenant: viewerTenantById(tenantId: $tenant_id) {
      tenantOnboardedAt
      logo: storage_tenants(filter: { folder: { eq: "avatar" } }, first: 1) {
        edges {
          node {
            storageTenantId
          }
        }
      }
      organizations: organizationsCollection {
        edges {
          node {
            memberships: organizationMembershipsCollection {
              totalCount
            }
          }
        }
      }
    }
  }
`);

/**
 * Derives the tenant onboarding state from a single GraphQL query. Logo presence and the
 * first-member signal are read from real state (nested storage + membership counts). RLS scopes
 * every read to what the viewer may see — the banner is only rendered to tenant_manage holders
 * anyway.
 *
 * @example const state = await getTenantOnboardingState(1)
 */
export async function getTenantOnboardingState(tenant_id: number): Promise<TenantOnboardingState> {
  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: TenantOnboardingStateGet, variables: { tenant_id } });

  const tenant = data?.["tenant"] ?? null;

  const hasLogo = (tenant?.["logo"]?.["edges"]?.length ?? 0) > 0;

  const orgEdges = tenant?.["organizations"]?.["edges"] ?? [];
  const membershipCount = orgEdges.reduce((sum, edge) => sum + (edge["node"]?.["memberships"]?.["totalCount"] ?? 0), 0);
  // Founder is the first membership; anything beyond means a teammate was invited or joined.
  const hasFirstMember = membershipCount > 1;

  return {
    tenant_id,
    tenant_onboarded_at: tenant?.["tenantOnboardedAt"] ?? null,
    steps: {
      tenant_logo: hasLogo ? "done" : "pending",
      first_member: hasFirstMember ? "done" : "pending",
    },
  };
}
