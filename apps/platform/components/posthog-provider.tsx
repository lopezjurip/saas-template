import { PostHogPageView, PostHogProvider as PHProvider } from "@posthog/next";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider
      clientOptions={{
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageleave: true,
      }}
    >
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
