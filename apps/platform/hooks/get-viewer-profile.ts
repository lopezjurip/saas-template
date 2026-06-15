import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerProfileGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileGetFragment on Profiles {
    profileId
    profileNameFull
    profileOnboardedAt
    profileDisabledAt
    profileCreatedAt
    profileUpdatedAt
  }
`);

export type ViewerProfileGetFragmentType = ResultOf<typeof ViewerProfileGetFragment>;

export const ViewerProfileGet = /*#__PURE__*/ gql(`
  query ViewerProfileGet {
    profile: viewerProfile {
      ...ViewerProfileGetFragment
    }
  }
`);

/**
 * Fetches the authenticated viewer's profile via GraphQL (server-side).
 * @example
 * const { data: { profile } } = await getViewerProfile();
 */
export const getViewerProfile = cache(async () => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerProfileGet });
});

export async function getViewerProfileRedirect() {
  const { data, ...extra } = await getViewerProfile();
  const profile = data && data["profile"];
  if (!profile) {
    // Short circuit.
    redirect("/auth");
  }
  return { data: { profile }, ...extra };
}
