"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerAgencyUseFragment = /*#__PURE__*/ gql(`
  fragment ViewerAgencyUseFragment on Agencies {
    agencyId
    agencySlug
    agencyName
  }
`);

export type ViewerAgencyUseFragmentType = ResultOf<typeof ViewerAgencyUseFragment>;

export const ViewerAgenciesUse = /*#__PURE__*/ gql(`
  query ViewerAgenciesUse(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: AgenciesFilter
    $orderBy: [AgenciesOrderBy!]
  ) {
    agencies: viewerAgencies(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...ViewerAgencyUseFragment
        }
      }
    }
  }
`);

export const ViewerAgencyByIdUse = /*#__PURE__*/ gql(`
  query ViewerAgencyByIdUse($agencyId: Int!) {
    agency: viewerAgencyById(agencyId: $agencyId) {
      ...ViewerAgencyUseFragment
    }
  }
`);

export const ViewerAgencyBySlugUse = /*#__PURE__*/ gql(`
  query ViewerAgencyBySlugUse($agencySlug: String!) {
    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {
      ...ViewerAgencyUseFragment
    }
  }
`);

type ViewerAgenciesUseData = ResultOf<typeof ViewerAgenciesUse>;
type ViewerAgenciesUseVars = VariablesOf<typeof ViewerAgenciesUse>;
type ViewerAgencyByIdUseData = ResultOf<typeof ViewerAgencyByIdUse>;
type ViewerAgencyBySlugUseData = ResultOf<typeof ViewerAgencyBySlugUse>;

export function useViewerAgencies(options?: ViewerAgenciesUseVars, config?: SWRConfiguration<ViewerAgenciesUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerAgenciesUse, variables: options ?? {} } : null, config);
}

export function useViewerAgencyById(agency_id: number, config?: SWRConfiguration<ViewerAgencyByIdUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerAgencyByIdUse, variables: { agencyId: agency_id } } : null, config);
}

export function useViewerAgencyBySlug(agency_slug: string, config?: SWRConfiguration<ViewerAgencyBySlugUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerAgencyBySlugUse, variables: { agencySlug: agency_slug } } : null, config);
}
