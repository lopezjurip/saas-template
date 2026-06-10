import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerTenantGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerTenantGetFragment on tenants {
    tenant_id
    tenant_slug
    tenant_name
    tenant_tier
  }
`);

export type ViewerTenantGetFragmentType = ResultOf<typeof ViewerTenantGetFragment>;

export const ViewerTenantsGetQuery = /*#__PURE__*/ gql(`
  query ViewerTenantsGetQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {
    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          ...ViewerTenantGetFragment
        }
      }
    }
  }
`);

export const ViewerTenantBySlugGetQuery = /*#__PURE__*/ gql(`
  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {
    tenant: viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {
      ...ViewerTenantGetFragment
    }
  }
`);

type ViewerTenantsGetQueryVars = VariablesOf<typeof ViewerTenantsGetQuery>;

export const getViewerTenants = cache(async (options?: Pick<ViewerTenantsGetQueryVars, "filter" | "orderBy">) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantsGetQuery, variables: options ?? {} });
});

export const getViewerTenantBySlug = cache(async (tenant_slug: string) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantBySlugGetQuery, variables: { tenant_slug } });
});
