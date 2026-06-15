import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { ConsentClient } from "./consent-client";

export default async function OAuthConsentPage(props: PageProps<"/oauth/consent">) {
  const searchParams = await props.searchParams;
  const authorization_id = SINGLE(searchParams["authorization_id"]);

  const user = await getSupabaseServerUser();
  if (!user) {
    const next = authorization_id
      ? `/oauth/consent?authorization_id=${encodeURIComponent(authorization_id)}`
      : "/oauth/consent";
    redirect(`/auth?next=${encodeURIComponent(next)}`);
  }

  return <ConsentClient authorization_id={authorization_id ?? null} />;
}
