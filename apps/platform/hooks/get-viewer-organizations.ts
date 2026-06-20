import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerOrganizationGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationGetFragment on Organizations {
    organizationId
    tenantId
    organizationSlug
    organizationName
  }
`);

export type ViewerOrganizationGetFragmentType = ResultOf<typeof ViewerOrganizationGetFragment>;

export const ViewerOrganizationsGet = /*#__PURE__*/ gql(`
  query ViewerOrganizationsGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: OrganizationsFilter
    $orderBy: [OrganizationsOrderBy!]
  ) {
    organizations: viewerOrganizations(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...ViewerOrganizationGetFragment
        }
      }
    }
  }
`);

export const ViewerOrganizationByIdQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationByIdQuery($organizationId: Int!) {
    organization: viewerOrganizationById(organizationId: $organizationId) {
      ...ViewerOrganizationGetFragment
    }
  }
`);

export const ViewerOrganizationBySlugQuery = /*#__PURE__*/ gql(`
  query ViewerOrganizationBySlugQuery($organizationSlug: String!) {
    organizations: viewerOrganizations(
      first: 1
      filter: { organizationSlug: { eq: $organizationSlug } }
    ) {
      edges {
        node {
          ...ViewerOrganizationGetFragment
        }
      }
    }
  }
`);

type ViewerOrganizationsGetVars = VariablesOf<typeof ViewerOrganizationsGet>;

/**
 * Fetches the organizations that the viewer has access to.
 * @example
 * const { data } = await getViewerOrganizations();
 */
export const getViewerOrganizations = cache(async (options?: ViewerOrganizationsGetVars) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationsGet, variables: options ?? {} });
});

/**
 * Fetches the organization that the viewer has access to by its ID.
 */
export const getViewerOrganizationById = cache(async (organization_id: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationByIdQuery, variables: { organizationId: organization_id } });
});

/**
 * Fetches the organization that the viewer has access to by its ID and asserts that it exists. If the organization does not exist, it will throw a 404 error.
 */
export async function getViewerOrganizationByIdAssert(organization_id: number) {
  const { data, ...extra } = await getViewerOrganizationById(organization_id);
  const organization = data && data["organization"];
  if (!organization) {
    notFound();
  }
  return { data: { organization }, ...extra };
}

/**
 * Fetches the organization that the viewer has access to by its slug.
 */
export const getViewerOrganizationBySlug = cache(async (organization_slug: string) => {
  const graphy = await getGraphySession();
  const result = await graphy.query({
    query: ViewerOrganizationBySlugQuery,
    variables: { organizationSlug: organization_slug },
  });
  const organization = result.data?.["organizations"]?.["edges"]?.[0]?.["node"] ?? null;
  return { ...result, data: { organization } };
});

/**
 * Fetches the organization that the viewer has access to by its slug and asserts that it exists. If the organization does not exist, it will throw a 404 error.
 */
export async function getViewerOrganizationBySlugAssert(organization_slug: string) {
  const { data, ...extra } = await getViewerOrganizationBySlug(organization_slug);
  if (!data.organization) {
    notFound();
  }
  return { data: { organization: data.organization }, ...extra };
}
