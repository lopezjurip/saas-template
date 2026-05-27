"use client";

import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { GraphyProvider } from "@packages/graphy/react";
import { useSupabase } from "@packages/supabase/react";
import { URL_NEW } from "@packages/utils/url";
import { useEffect, useMemo, useState } from "react";

/**
 * Wraps the app with a GraphyProvider whose client tracks the current Supabase session.
 * The client is rebuilt on every auth event so the SWR cache (keyed by access_token_hash) invalidates.
 * @example
 * <GraphyClientProvider><App /></GraphyClientProvider>
 */
export function GraphyClientProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAccessToken(data?.session?.access_token ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const client = useMemo(
    () =>
      new GraphyClientSupabase(
        URL_NEW("/graphql/v1", process.env["NEXT_PUBLIC_SUPABASE_URL"]),
        process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
        accessToken,
      ),
    [accessToken],
  );

  return <GraphyProvider value={client}>{children}</GraphyProvider>;
}
