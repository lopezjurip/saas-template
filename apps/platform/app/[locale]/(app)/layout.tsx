import { getSupabaseServerUserRedirect } from "@packages/supabase/client.server";

export default async function AppLayout(props: LayoutProps<"/[locale]">) {
  await getSupabaseServerUserRedirect(); // Redirects to auth if not authenticated.
  return <>{props.children}</>;
}
