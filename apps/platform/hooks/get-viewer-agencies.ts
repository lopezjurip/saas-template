// ⚠️ Shared viewer hook — use ONLY when page needs just this one resource alone.
// Many resources? Do NOT stack get-viewer-*/use-viewer-* hooks (= N round-trips).
// Write ONE colocated gql in page file, spread fragments, single call.
import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerAgencyGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerAgencyGetFragment on Agencies {
    agencyId
    agencySlug
    agencyName
    agencyDeletedAt
  }
`);

export type ViewerAgencyGetFragmentType = ResultOf<typeof ViewerAgencyGetFragment>;

export const ViewerAgenciesGet = /*#__PURE__*/ gql(`
  query ViewerAgenciesGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: AgenciesFilter
    $orderBy: [AgenciesOrderBy!]
  ) {
    agencies: viewerAgenciesCollection(
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
  query ViewerAgencyByIdGet($agencyId: Int!) {
    agency: viewerAgencyById(agencyId: $agencyId) {
      ...ViewerAgencyGetFragment
    }
  }
`);

export const ViewerAgencyBySlugGet = /*#__PURE__*/ gql(`
  query ViewerAgencyBySlugGet($agencySlug: String!) {
    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {
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
export const getViewerAgencyById = cache(async (agency_id: number) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerAgencyByIdGet, variables: { agencyId: agency_id } });
});

/**
 * Fetches the agency by its ID and asserts it exists. Throws a 404 if not found.
 */
export async function getViewerAgencyByIdAssert(agency_id: number) {
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
  return await graphy.query({ query: ViewerAgencyBySlugGet, variables: { agencySlug: agency_slug } });
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
