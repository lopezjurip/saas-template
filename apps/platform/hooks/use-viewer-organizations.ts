"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerOrganizationHookFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationHookFragment on organizations {
    organization_id
    tenant_id
    organization_slug
    organization_name
  }
`);

export type ViewerOrganizationHookFragmentType = ResultOf<typeof ViewerOrganizationHookFragment>;

export const ViewerOrganizationsHookQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationsHookQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {
    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          ...ViewerOrganizationHookFragment
        }
      }
    }
  }
`);

export const ViewerOrganizationByIdHookQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {
    organization: viewer_organization_by_id(target_organization_id: $organization_id) {
      ...ViewerOrganizationHookFragment
    }
  }
`);

type ViewerOrganizationsHookQueryData = ResultOf<typeof ViewerOrganizationsHookQuery>;
type ViewerOrganizationsHookQueryVars = VariablesOf<typeof ViewerOrganizationsHookQuery>;
type ViewerOrganizationByIdHookQueryData = ResultOf<typeof ViewerOrganizationByIdHookQuery>;

export function useViewerOrganizations(
  options?: Pick<ViewerOrganizationsHookQueryVars, "filter" | "orderBy">,
  config?: SWRConfiguration<ViewerOrganizationsHookQueryData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerOrganizationsHookQuery, variables: options ?? {} } : null, config);
}

export function useViewerOrganization(
  organization_id: number,
  config?: SWRConfiguration<ViewerOrganizationByIdHookQueryData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(
    user ? { query: ViewerOrganizationByIdHookQuery, variables: { organization_id } } : null,
    config,
  );
}
