"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const ViewerProfileHookFragment = /*#__PURE__*/ gql(`
  fragment ViewerProfileHookFragment on profiles {
    profile_id
    profile_name_full
    profile_onboarded_at
    profile_disabled_at
    profile_created_at
    profile_updated_at
  }
`);

export type ViewerProfileHookFragmentType = ResultOf<typeof ViewerProfileHookFragment>;

export const ViewerProfileHookQuery = /*#__PURE__*/ gql(`
  query ViewerProfileHookQuery {
    profile: viewer_profile {
      ...ViewerProfileHookFragment
    }
  }
`);

type ViewerProfileHookQueryData = ResultOf<typeof ViewerProfileHookQuery>;

/**
 * Returns the authenticated viewer's profile via GraphQL (client-side hook).
 * @example
 * const { data: { profile } = { ["profile"]: null } } = useViewerProfile();
 */
export function useViewerProfile(config?: SWRConfiguration<ViewerProfileHookQueryData>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerProfileHookQuery } : null, config);
}
