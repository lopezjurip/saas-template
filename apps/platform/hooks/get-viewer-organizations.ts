import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
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
  query ViewerOrganizationsGetQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {
    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {
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
    organization: viewer_organization_by_id(organization_id: $organization_id) {
      ...ViewerOrganizationGetFragment
    }
  }
`);

type ViewerOrganizationsGetQueryVars = VariablesOf<typeof ViewerOrganizationsGetQuery>;

export const getViewerOrganizations = cache(
  async (options?: Pick<ViewerOrganizationsGetQueryVars, "filter" | "orderBy">) => {
    const graphy = await getGraphySession();
    return await graphy.query({ query: ViewerOrganizationsGetQuery, variables: options ?? {} });
  },
);

export const getViewerOrganization = cache(async (organization_id: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationByIdGetQuery, variables: { organization_id } });
});
