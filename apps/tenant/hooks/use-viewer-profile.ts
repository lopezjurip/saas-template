"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerProfileFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileFragment on profiles {
    profile_id
    profile_name_full
    profile_onboarded_at
    profile_disabled_at
    profile_created_at
    profile_updated_at
  }
`);

export type ViewerProfileFragmentType = ResultOf<typeof ViewerProfileFragment>;

const UseViewerProfileHookQuery = /*#__PURE__*/ gql(`
  query UseViewerProfileHookQuery {
    profile: viewer_profile {
      ...ViewerProfileFragment
    }
  }
`);

type UseViewerProfileQueryData = ResultOf<typeof UseViewerProfileHookQuery>;

/**
 * Returns the authenticated viewer's profile via GraphQL.
 * @example
 * const { data: { profile } = { profile: null } } = useViewerProfile();
 */
export function useViewerProfile(config?: SWRConfiguration<UseViewerProfileQueryData>) {
  return useGraphyQuery({ query: UseViewerProfileHookQuery }, config);
}
