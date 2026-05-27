import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerOrganizationGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationGetFragment on organizations {
    organization_id
    tenant_id
    organization_slug
    organization_name
  }
`);

export type ViewerOrganizationGetFragmentType = ResultOf<typeof ViewerOrganizationGetFragment>;

export const ViewerOrganizationsGetQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationsGetQuery($tenant_id: Int) {
    organizationsCollection(
      filter: {
        tenant_id: { eq: $tenant_id }
        organization_disabled_at: { is: NULL }
      }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          ...ViewerOrganizationGetFragment
        }
      }
    }
  }
`);

export const ViewerOrganizationByIdGetQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {
    organizationsCollection(
      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }
      first: 1
    ) {
      edges {
        node {
          ...ViewerOrganizationGetFragment
        }
      }
    }
  }
`);

export async function getViewerOrganizations(tenant_id?: number) {
  const graphy = await getGraphySession();
  return await graphy.query({
    query: ViewerOrganizationsGetQuery,
    variables: { tenant_id: tenant_id ?? null },
  });
}

export async function getViewerOrganization(organization_id: number) {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationByIdGetQuery, variables: { organization_id } });
}
