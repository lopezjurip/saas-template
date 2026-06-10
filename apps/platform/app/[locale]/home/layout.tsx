// Owns the /home namespace — auth-gated, no tenant context yet.
// Unlike /auth/*, the home shell is full-bleed so the picker can stretch / the user
// menu can anchor to the bottom-left.

import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { FloatingChrome } from "~/components/floating-chrome";

export default async function HomeLayout(props: LayoutProps<"/[locale]/home">) {
  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/[locale]/auth?next=${encodeURIComponent("/[locale]/home")}`);
  }
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
