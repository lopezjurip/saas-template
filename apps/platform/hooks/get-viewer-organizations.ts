import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { cache } from "react";
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
    viewer_organizations(
      filter: { tenant_id: { eq: $tenant_id } }
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
    viewer_organization_by_id(target_organization_id: $organization_id) {
      ...ViewerOrganizationGetFragment
    }
  }
`);

export const getViewerOrganizations = cache(async (tenant_id?: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({
    query: ViewerOrganizationsGetQuery,
    variables: { tenant_id: tenant_id ?? null },
  });
});

export const getViewerOrganization = cache(async (organization_id: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationByIdGetQuery, variables: { organization_id } });
});
