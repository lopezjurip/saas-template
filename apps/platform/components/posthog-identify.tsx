"use client";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import { usePostHog } from "@posthog/next";
import { useEffect } from "react";
import { gql } from "~/generated/graphql";

const PostHogIdentifyQuery = /*#__PURE__*/ gql(`
  query PostHogIdentify {
    profile: viewer_profile {
      profile_id
      profile_name_full
      profile_onboarded_at
    }
    tenants: viewer_tenants {
      edges {
        node {
          tenant_id
          tenant_slug
        }
      }
    }
    organizations: viewer_organizations {
      edges {
        node {
          organization_id
          tenant_id
        }
      }
    }
  }
`);

export function PostHogIdentify() {
  const posthog = usePostHog();
  const { data: user } = useSupabaseUser();
  const { data } = useGraphyQuery(user ? { query: PostHogIdentifyQuery } : null);
  const profile = data?.profile;

  useEffect(() => {
    if (!user) {
      return posthog?.reset();
    } else if (!profile) {
      return;
    }

    posthog?.identify(profile["profile_id"], {
      email: user["email"],
      name: profile["profile_name_full"],
      onboarded_at: profile["profile_onboarded_at"],
    });

    for (const edge of data?.tenants?.edges ?? []) {
      posthog?.group("tenant", String(edge.node.tenant_id), { slug: edge.node.tenant_slug });
    }
    for (const edge of data?.organizations?.edges ?? []) {
      posthog?.group("organization", String(edge.node.organization_id), {
        tenant_id: String(edge.node.tenant_id),
      });
    }
  }, [user, profile, posthog, data]);

  return null;
}
