import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerTenantGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerTenantGetFragment on Tenants {
    tenantId
    tenantSlug
    tenantName
    tenantTier
  }
`);

export type ViewerTenantGetFragmentType = ResultOf<typeof ViewerTenantGetFragment>;

export const ViewerTenantsGet = /*#__PURE__*/ gql(`
  query ViewerTenantsGet(
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
          ...ViewerTenantGetFragment
        }
      }
    }
  }
`);

export const ViewerTenantByIdGet = /*#__PURE__*/ gql(`
  query ViewerTenantByIdGet($tenantId: Int!) {
    tenant: viewerTenantById(tenantId: $tenantId) {
      ...ViewerTenantGetFragment
    }
  }
`);

export const ViewerTenantBySlugGet = /*#__PURE__*/ gql(`
  query ViewerTenantBySlugGet($tenantSlug: String!) {
    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {
      ...ViewerTenantGetFragment
    }
  }
`);

type ViewerTenantsGetVars = VariablesOf<typeof ViewerTenantsGet>;

/**
 * Fetches the tenants that the viewer has access to.
 */
export const getViewerTenants = cache(async (options?: ViewerTenantsGetVars) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantsGet, variables: options ?? {} });
});

/**
 * Fetches the tenant that the viewer has access to by its ID.
 */
export const getViewerTenantById = cache(async (tenant_id: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantByIdGet, variables: { tenantId: tenant_id } });
});

/**
 * Fetches the tenant by its ID and asserts it exists. Throws a 404 if not found.
 */
export async function getViewerTenantByIdAssert(tenant_id: number) {
  const { data, ...extra } = await getViewerTenantById(tenant_id);
  const tenant = data && data["tenant"];
  if (!tenant) {
    notFound();
  }
  return { data: { tenant }, ...extra };
}

/**
 * Fetches the tenant that the viewer has access to by its slug.
 */
export const getViewerTenantBySlug = cache(async (tenant_slug: string) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerTenantBySlugGet, variables: { tenantSlug: tenant_slug } });
});

/**
 * Fetches the tenant by its slug and asserts it exists. Throws a 404 if not found.
 */
export async function getViewerTenantBySlugAssert(tenant_slug: string) {
  const { data, ...extra } = await getViewerTenantBySlug(tenant_slug);
  const tenant = data && data["tenant"];
  if (!tenant) {
    notFound();
  }
  return { data: { tenant }, ...extra };
}
