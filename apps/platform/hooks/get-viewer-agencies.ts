import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerAgencyGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerAgencyGetFragment on agencies {
    agency_id
    agency_slug
    agency_name
  }
`);

export type ViewerAgencyGetFragmentType = ResultOf<typeof ViewerAgencyGetFragment>;

export const ViewerAgenciesGet = /*#__PURE__*/ gql(`
  query ViewerAgenciesGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: agenciesFilter
    $orderBy: [agenciesOrderBy!]
  ) {
    agencies: viewer_agencies(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...ViewerAgencyGetFragment
        }
      }
    }
  }
`);

export const ViewerAgencyByIdGet = /*#__PURE__*/ gql(`
  query ViewerAgencyByIdGet($agency_id: UUID!) {
    agency: viewer_agency_by_id(agency_id: $agency_id) {
      ...ViewerAgencyGetFragment
    }
  }
`);

export const ViewerAgencyBySlugGet = /*#__PURE__*/ gql(`
  query ViewerAgencyBySlugGet($agency_slug: String!) {
    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {
      ...ViewerAgencyGetFragment
    }
  }
`);

type ViewerAgenciesGetVars = VariablesOf<typeof ViewerAgenciesGet>;

/**
 * Fetches the agencies that the viewer is a member of.
 */
export const getViewerAgencies = cache(async (options?: ViewerAgenciesGetVars) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerAgenciesGet, variables: options ?? {} });
});

/**
 * Fetches the agency that the viewer belongs to by its ID.
 */
export const getViewerAgencyById = cache(async (agency_id: string) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerAgencyByIdGet, variables: { agency_id } });
});

/**
 * Fetches the agency by its ID and asserts it exists. Throws a 404 if not found.
 */
export async function getViewerAgencyByIdAssert(agency_id: string) {
  const { data, ...extra } = await getViewerAgencyById(agency_id);
  const agency = data && data["agency"];
  if (!agency) {
    notFound();
  }
  return { data: { agency }, ...extra };
}

/**
 * Fetches the agency that the viewer belongs to by its slug.
 */
export const getViewerAgencyBySlug = cache(async (agency_slug: string) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerAgencyBySlugGet, variables: { agency_slug } });
});

/**
 * Fetches the agency by its slug and asserts it exists. Throws a 404 if not found.
 */
export async function getViewerAgencyBySlugAssert(agency_slug: string) {
  const { data, ...extra } = await getViewerAgencyBySlug(agency_slug);
  const agency = data && data["agency"];
  if (!agency) {
    notFound();
  }
  return { data: { agency }, ...extra };
}
