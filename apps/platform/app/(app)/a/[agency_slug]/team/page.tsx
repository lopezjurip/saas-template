import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { AFFILIATION_STATE } from "~/lib/agencies";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { type TeamAffiliate, TeamList } from "./team-list";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyTeamPage(props: PageProps<"/a/[agency_slug]/team">) {
  const { agency_slug } = await props.params;

  // Re-fetch the cached, RLS-scoped agency row (the layout already gated access).
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  // The roster + each member's email come from the security-definer
  // `viewer_agency_team` RPC under the caller's JWT (gated to accepted
  // affiliates) — no service-role client, no `auth.admin.listUsers()`.
  const supabase = await createSupabaseServerClient();
  const [userRes, membershipsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("viewer_agency_team", { agency_id: agency["agencyId"] }),
  ]);

  const user = userRes.data.user;
  const memberships = membershipsRes.data ?? [];

  const affiliates: TeamAffiliate[] = memberships.map((m) => ({
    agency_membership_id: m["agency_membership_id"],
    profile_id: m["profile_id"],
    state: AFFILIATION_STATE(m),
    name: m["profile_name_full"] ?? m["email"] ?? m["profile_id"].slice(0, 8),
    email: m["email"] ?? null,
    is_self: Boolean(user && m["profile_id"] === user.id),
  }));

  return (
    <TeamList
      agencyId={agency["agencyId"]}
      affiliates={affiliates}
      inviteHref={ROUTE("/a/[agency_slug]/team", { agency_slug: agency["agencySlug"] })}
    />
  );
}

const LOCALE_ES = { page_title: "Equipo de la agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agency team" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Equipe da agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
