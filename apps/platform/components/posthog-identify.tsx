"use client";
import { getSupabaseClientUserMetadata } from "@packages/supabase/client.browser";
import { useSupabaseUser } from "@packages/supabase/react";
import { usePostHog } from "@posthog/next";
import { useEffect } from "react";
import { useViewerProfile } from "~/hooks/use-viewer-profile";

export function PostHogIdentify() {
  const posthog = usePostHog();
  const { data: user } = useSupabaseUser();
  const { data: profileData } = useViewerProfile();
  const profile = profileData?.profile;

  useEffect(() => {
    if (!user) {
      posthog?.reset();
      return;
    }
    if (!profile) return;

    posthog?.identify(profile.profile_id, {
      ...(user.email && { email: user.email }),
      ...(profile.profile_name_full && { name: profile.profile_name_full }),
      ...(profile.profile_onboarded_at && { onboarded_at: profile.profile_onboarded_at }),
    });

    void getSupabaseClientUserMetadata().then((metadata) => {
      for (const tenant of metadata?.tenants ?? []) {
        posthog?.group("tenant", String(tenant.id), { slug: tenant.slug });
      }
      for (const org of metadata?.organizations ?? []) {
        posthog?.group("organization", String(org.id), { tenant_id: String(org.tenant_id) });
      }
    });
  }, [user, profile, posthog]);

  return null;
}
