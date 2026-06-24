"use client";

// ⚠️ Shared viewer hook — use ONLY when component needs just this one resource alone.
// Many resources? Do NOT stack get-viewer-*/use-viewer-* hooks (= N round-trips).
// Write ONE colocated gql in that file, spread fragments, single call.

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerOrganizationUseFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationUseFragment on Organizations {
    organizationId
    tenantId
    organizationSlug
    organizationName
  }
`);

export type ViewerOrganizationUseFragmentType = ResultOf<typeof ViewerOrganizationUseFragment>;

export const ViewerOrganizationsUse = /*#__PURE__*/ gql(`
  query ViewerOrganizationsUse(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: OrganizationsFilter
    $orderBy: [OrganizationsOrderBy!]
  ) {
    organizations: viewerOrganizationsCollection(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...ViewerOrganizationUseFragment
        }
      }
    }
  }
`);

export const ViewerOrganizationByIdUse = /*#__PURE__*/ gql(`
  query ViewerOrganizationByIdUse($organizationId: Int!) {
    organization: viewerOrganizationById(organizationId: $organizationId) {
      ...ViewerOrganizationUseFragment
    }
  }
`);

export const ViewerOrganizationBySlugUse = /*#__PURE__*/ gql(`
  query ViewerOrganizationBySlugUse($organizationSlug: String!) {
    organizations: viewerOrganizationsCollection(
      first: 1
      filter: { organizationSlug: { eq: $organizationSlug } }
    ) {
      edges {
        node {
          ...ViewerOrganizationUseFragment
        }
      }
    }
  }
`);

type ViewerOrganizationsUseData = ResultOf<typeof ViewerOrganizationsUse>;
type ViewerOrganizationsUseVars = VariablesOf<typeof ViewerOrganizationsUse>;
type ViewerOrganizationByIdUseData = ResultOf<typeof ViewerOrganizationByIdUse>;
type ViewerOrganizationBySlugUseData = ResultOf<typeof ViewerOrganizationBySlugUse>;

export function useViewerOrganizations(
  options?: ViewerOrganizationsUseVars,
  config?: SWRConfiguration<ViewerOrganizationsUseData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerOrganizationsUse, variables: options ?? {} } : null, config);
}

export function useViewerOrganization(
  organization_id: number,
  config?: SWRConfiguration<ViewerOrganizationByIdUseData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(
    user ? { query: ViewerOrganizationByIdUse, variables: { organizationId: organization_id } } : null,
    config,
  );
}

export function useViewerOrganizationBySlug(
  organization_slug: string,
  config?: SWRConfiguration<ViewerOrganizationBySlugUseData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(
    user ? { query: ViewerOrganizationBySlugUse, variables: { organizationSlug: organization_slug } } : null,
    config,
  );
}
