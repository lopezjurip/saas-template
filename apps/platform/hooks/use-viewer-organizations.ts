"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerOrganizationUseFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationUseFragment on organizations {
    organization_id
    tenant_id
    organization_slug
    organization_name
  }
`);

export type ViewerOrganizationUseFragmentType = ResultOf<typeof ViewerOrganizationUseFragment>;

export const ViewerOrganizationsUse = /*#__PURE__*/ gql(`
  query ViewerOrganizationsUse(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: organizationsFilter
    $orderBy: [organizationsOrderBy!]
  ) {
    organizations: viewer_organizations(
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
  query ViewerOrganizationByIdUse($organization_id: Int!) {
    organization: viewer_organization_by_id(organization_id: $organization_id) {
      ...ViewerOrganizationUseFragment
    }
  }
`);

export const ViewerOrganizationBySlugUse = /*#__PURE__*/ gql(`
  query ViewerOrganizationBySlugUse($organization_slug: String!) {
    organizations: viewer_organizations(
      first: 1
      filter: { organization_slug: { eq: $organization_slug } }
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
  return useGraphyQuery(user ? { query: ViewerOrganizationByIdUse, variables: { organization_id } } : null, config);
}

export function useViewerOrganizationBySlug(
  organization_slug: string,
  config?: SWRConfiguration<ViewerOrganizationBySlugUseData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerOrganizationBySlugUse, variables: { organization_slug } } : null, config);
}
