"use client";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import { usePostHog } from "@posthog/next";
import { useEffect } from "react";
import { gql } from "~/generated/graphql";

const PostHogIdentifyQuery = /*#__PURE__*/ gql(`
  query PostHogIdentify {
    profile: viewerProfile {
      profileId
      profileNameFull
      profileOnboardedAt
      profileCreatedAt
    }
    tenants: viewerTenants {
      edges {
        node {
          tenantId
          tenantSlug
          tenantTier
          tenantCreatedAt
        }
      }
    }
    organizations: viewerOrganizations {
      edges {
        node {
          organizationId
          organizationName
          tenantId
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

    posthog?.identify(profile["profileId"], {
      email: user["email"],
      name: profile["profileNameFull"],
      onboarded_at: profile["profileOnboardedAt"],
      created_at: profile["profileCreatedAt"],
    });

    for (const { ["node"]: tenant } of data["tenants"]?.["edges"] ?? []) {
      posthog?.group("tenant", String(tenant["tenantId"]), {
        slug: tenant["tenantSlug"],
        tier: tenant["tenantTier"],
        created_at: tenant["tenantCreatedAt"],
      });
    }
    for (const { ["node"]: organization } of data["organizations"]?.["edges"] ?? []) {
      posthog?.group("organization", String(organization["organizationId"]), {
        name: organization["organizationName"],
        tenant_id: String(organization["tenantId"]),
      });
    }
  }, [user, posthog, data]);

  return null;
}
