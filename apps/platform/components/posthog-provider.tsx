import { PostHogProvider as PHProvider, PostHogPageView } from "@posthog/next";
import { cookies } from "next/headers";

interface BootstrapData {
  distinctId?: string;
  featureFlags?: Record<string, string | boolean>;
}

export async function PostHogProvider({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("ph_bootstrap")?.value;
  let bootstrap: BootstrapData | undefined;
  if (raw) {
    try {
      bootstrap = JSON.parse(raw) as BootstrapData;
    } catch {
      bootstrap = undefined;
    }
  }

  return (
    <PHProvider
      clientOptions={{
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageleave: true,
        bootstrap: bootstrap
          ? {
              distinctID: bootstrap["distinctId"],
              featureFlags: bootstrap["featureFlags"],
            }
          : undefined,
      }}
    >
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
