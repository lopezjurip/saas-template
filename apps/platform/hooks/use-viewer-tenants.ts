"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
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
  query ViewerTenantsHookQuery {
    tenantsCollection(
      filter: { tenant_disabled_at: { is: NULL } }
      orderBy: [{ tenant_name: AscNullsLast }]
    ) {
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
    tenantsCollection(
      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }
      first: 1
    ) {
      edges {
        node {
          ...ViewerTenantHookFragment
        }
      }
    }
  }
`);

type ViewerTenantsHookQueryData = ResultOf<typeof ViewerTenantsHookQuery>;
type ViewerTenantBySlugHookQueryData = ResultOf<typeof ViewerTenantBySlugHookQuery>;

export function useViewerTenants(config?: SWRConfiguration<ViewerTenantsHookQueryData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantsHookQuery } : null, config);
}

export function useViewerTenantBySlug(tenant_slug: string, config?: SWRConfiguration<ViewerTenantBySlugHookQueryData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerTenantBySlugHookQuery, variables: { tenant_slug } } : null, config);
}
