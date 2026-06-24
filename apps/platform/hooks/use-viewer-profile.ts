"use client";

// ⚠️ Shared viewer hook — use ONLY when component needs just this one resource alone.
// Many resources? Do NOT stack get-viewer-*/use-viewer-* hooks (= N round-trips).
// Write ONE colocated gql in that file, spread fragments, single call.

import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerProfileUseFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileUseFragment on Profiles {
    profileId
    profileNameFull
    profileOnboardedAt
    profileDeletedAt
    profileCreatedAt
    profileUpdatedAt
  }
`);

export type ViewerProfileUseFragmentType = ResultOf<typeof ViewerProfileUseFragment>;

export const ViewerProfileUse = /*#__PURE__*/ gql(`
  query ViewerProfileUse {
    profile: viewerProfile {
      ...ViewerProfileUseFragment
    }
  }
`);

type ViewerProfileUseData = ResultOf<typeof ViewerProfileUse>;

/**
 * Returns the authenticated viewer's profile via GraphQL (client-side ).
 * @example
 * const { data: { profile } = { ["profile"]: null } } = useViewerProfile();
 */
export function useViewerProfile(config?: SWRConfiguration<ViewerProfileUseData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerProfileUse } : null, config);
}
