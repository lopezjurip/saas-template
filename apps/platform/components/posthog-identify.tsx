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
      profile_created_at
    }
    tenants: viewer_tenants {
      edges {
        node {
          tenant_id
          tenant_slug
          tenant_tier
          tenant_created_at
        }
      }
    }
    organizations: viewer_organizations {
      edges {
        node {
          organization_id
          organization_name
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

  useEffect(() => {
    if (!user) {
      return posthog?.reset();
    }
    const profile = data?.["profile"];
    if (!profile) {
      return;
    }

    posthog?.identify(profile["profile_id"], {
      email: user["email"],
      name: profile["profile_name_full"],
      onboarded_at: profile["profile_onboarded_at"],
      created_at: profile["profile_created_at"],
    });

    for (const { ["node"]: tenant } of data["tenants"]?.["edges"] ?? []) {
      posthog?.group("tenant", String(tenant["tenant_id"]), {
        slug: tenant["tenant_slug"],
        tier: tenant["tenant_tier"],
        created_at: tenant["tenant_created_at"],
      });
    }
    for (const { ["node"]: organization } of data["organizations"]?.["edges"] ?? []) {
      posthog?.group("organization", String(organization["organization_id"]), {
        name: organization["organization_name"],
        tenant_id: String(organization["tenant_id"]),
      });
    }
  }, [user, posthog, data]);

  return null;
}
