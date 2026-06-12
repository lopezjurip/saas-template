import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const ViewerProfileGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileGetFragment on profiles {
    profile_id
    profile_name_full
    profile_onboarded_at
    profile_disabled_at
    profile_created_at
    profile_updated_at
  }
`);

export type ViewerProfileGetFragmentType = ResultOf<typeof ViewerProfileGetFragment>;

export const ViewerProfileGet = /*#__PURE__*/ gql(`
  query ViewerProfileGet {
    profile: viewer_profile {
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
    redirect("/[locale]/auth");
  }
  return { data: { profile }, ...extra };
}
