"use client";
import { getSupabaseClientUserMetadata } from "@packages/supabase/client.browser";
import { useSupabaseUser } from "@packages/supabase/react";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogIdentify() {
  const posthog = usePostHog();
  const { data: user } = useSupabaseUser();

  useEffect(() => {
    if (!user) {
      posthog?.reset();
      return;
    }
    posthog?.identify(user.id, { email: user.email });
    void getSupabaseClientUserMetadata().then((metadata) => {
      if (metadata?.tenants?.length) {
        posthog?.group("tenant", String(metadata.tenants[0].id));
      }
    });
  }, [user, posthog]);

  return null;
}
