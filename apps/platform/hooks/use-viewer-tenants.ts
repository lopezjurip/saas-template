"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerTenantHookFragment = /*#__PURE__*/ gql(`
  fragment ViewerTenantHookFragment on tenants {
    tenant_id
    tenant_slug
    tenant_name
    tenant_tier
  }
`);

export type ViewerTenantHookFragmentType = ResultOf<typeof ViewerTenantHookFragment>;

export const ViewerTenantsHookQuery = /*#__PURE__*/ gql(`
  query ViewerTenantsHookQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {
    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          ...ViewerTenantHookFragment
        }
      }
    }
  }
`);

export const ViewerTenantBySlugHookQuery = /*#__PURE__*/ gql(`
  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {
    tenant: viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {
      ...ViewerTenantHookFragment
    }
  }
`);

type ViewerTenantsHookQueryData = ResultOf<typeof ViewerTenantsHookQuery>;
type ViewerTenantsHookQueryVars = VariablesOf<typeof ViewerTenantsHookQuery>;
type ViewerTenantBySlugHookQueryData = ResultOf<typeof ViewerTenantBySlugHookQuery>;

export function useViewerTenants(
  options?: Pick<ViewerTenantsHookQueryVars, "filter" | "orderBy">,
  config?: SWRConfiguration<ViewerTenantsHookQueryData>,
) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantsHookQuery, variables: options ?? {} } : null, config);
}

export function useViewerTenantBySlug(tenant_slug: string, config?: SWRConfiguration<ViewerTenantBySlugHookQueryData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantBySlugHookQuery, variables: { tenant_slug } } : null, config);
}
