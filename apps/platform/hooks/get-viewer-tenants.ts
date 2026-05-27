import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
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
  query ViewerTenantsGetQuery {
    viewer_tenants(
      orderBy: [{ tenant_name: AscNullsLast }]
    ) {
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
    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {
      ...ViewerTenantGetFragment
    }
  }
`);

export const getViewerTenants = cache(async () => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantsGetQuery });
});

export const getViewerTenantBySlug = cache(async (tenant_slug: string) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantBySlugGetQuery, variables: { tenant_slug } });
});
