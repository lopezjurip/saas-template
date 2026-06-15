"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerTenantUseFragment = /*#__PURE__*/ gql(`
  fragment ViewerTenantUseFragment on Tenants {
    tenantId
    tenantSlug
    tenantName
    tenantTier
  }
`);

export type ViewerTenantUseFragmentType = ResultOf<typeof ViewerTenantUseFragment>;

export const ViewerTenantsUse = /*#__PURE__*/ gql(`
  query ViewerTenantsUse(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: TenantsFilter
    $orderBy: [TenantsOrderBy!]
  ) {
    tenants: viewerTenants(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...ViewerTenantUseFragment
        }
      }
    }
  }
`);

export const ViewerTenantByIdUse = /*#__PURE__*/ gql(`
  query ViewerTenantByIdUse($tenantId: Int!) {
    tenant: viewerTenantById(tenantId: $tenantId) {
      ...ViewerTenantUseFragment
    }
  }
`);

export const ViewerTenantBySlugUse = /*#__PURE__*/ gql(`
  query ViewerTenantBySlugUse($tenantSlug: String!) {
    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {
      ...ViewerTenantUseFragment
    }
  }
`);

type ViewerTenantsUseData = ResultOf<typeof ViewerTenantsUse>;
type ViewerTenantsUseVars = VariablesOf<typeof ViewerTenantsUse>;
type ViewerTenantByIdUseData = ResultOf<typeof ViewerTenantByIdUse>;
type ViewerTenantBySlugUseData = ResultOf<typeof ViewerTenantBySlugUse>;

export function useViewerTenants(options?: ViewerTenantsUseVars, config?: SWRConfiguration<ViewerTenantsUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantsUse, variables: options ?? {} } : null, config);
}

export function useViewerTenantById(tenant_id: number, config?: SWRConfiguration<ViewerTenantByIdUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantByIdUse, variables: { tenantId: tenant_id } } : null, config);
}

export function useViewerTenantBySlug(tenant_slug: string, config?: SWRConfiguration<ViewerTenantBySlugUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantBySlugUse, variables: { tenantSlug: tenant_slug } } : null, config);
}
