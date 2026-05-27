// Shared GraphQL fragments + queries used by both the client hooks (use-viewer-*.ts)
// and the server helpers (get-viewer-*.ts). Lives in its own module — no "use client" /
// "server-only" directive — so both bundles can import it cleanly.

import type { ResultOf } from "@graphql-typed-document-node/core";
import { gql } from "~/generated/graphql";

// ---- profile ----------------------------------------------------------------

export const ViewerProfileFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileFragment on profiles {
    profile_id
    profile_name_full
    profile_onboarded_at
    profile_disabled_at
    profile_created_at
    profile_updated_at
  }
`);

export type ViewerProfileFragmentType = ResultOf<typeof ViewerProfileFragment>;

export const ViewerProfileQuery = /*#__PURE__*/ gql(`
  query ViewerProfileQuery {
    profile: viewer_profile {
      ...ViewerProfileFragment
    }
  }
`);

// ---- tenants ----------------------------------------------------------------

export const ViewerTenantFragment = /*#__PURE__*/ gql(`
  fragment ViewerTenantFragment on tenants {
    tenant_id
    tenant_slug
    tenant_name
    tenant_tier
  }
`);

export type ViewerTenantFragmentType = ResultOf<typeof ViewerTenantFragment>;

export const ViewerTenantsQuery = /*#__PURE__*/ gql(`
  query ViewerTenantsQuery {
    tenantsCollection(
      filter: { tenant_disabled_at: { is: NULL } }
      orderBy: [{ tenant_name: AscNullsLast }]
    ) {
      edges {
        node {
          ...ViewerTenantFragment
        }
      }
    }
  }
`);

export const ViewerTenantBySlugQuery = /*#__PURE__*/ gql(`
  query ViewerTenantBySlugQuery($tenant_slug: String!) {
    tenantsCollection(
      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }
      first: 1
    ) {
      edges {
        node {
          ...ViewerTenantFragment
        }
      }
    }
  }
`);

// ---- organizations ----------------------------------------------------------

export const ViewerOrganizationFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationFragment on organizations {
    organization_id
    tenant_id
    organization_slug
    organization_name
  }
`);

export type ViewerOrganizationFragmentType = ResultOf<typeof ViewerOrganizationFragment>;

export const ViewerOrganizationsQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationsQuery($tenant_id: Int) {
    organizationsCollection(
      filter: {
        tenant_id: { eq: $tenant_id }
        organization_disabled_at: { is: NULL }
      }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          ...ViewerOrganizationFragment
        }
      }
    }
  }
`);

export const ViewerOrganizationByIdQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationByIdQuery($organization_id: Int!) {
    organizationsCollection(
      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }
      first: 1
    ) {
      edges {
        node {
          ...ViewerOrganizationFragment
        }
      }
    }
  }
`);
