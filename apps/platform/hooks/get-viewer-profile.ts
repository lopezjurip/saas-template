import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
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

export const ViewerProfileGetQuery = /*#__PURE__*/ gql(`
  query ViewerProfileGetQuery {
    profile: viewer_profile {
      ...ViewerProfileGetFragment
    }
  }
`);

/**
 * Fetches the authenticated viewer's profile via GraphQL (server-side).
 */
export async function getViewerProfile() {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerProfileGetQuery });
}
