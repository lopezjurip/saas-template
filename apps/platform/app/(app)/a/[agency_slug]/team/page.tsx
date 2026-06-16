import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AFFILIATION_STATE } from "~/lib/agencies";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { getAgencyBySlug } from "../get-agency";
import { type TeamAffiliate, TeamList } from "./team-list";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyTeamPage(props: PageProps<"/a/[agency_slug]/team">) {
  const { agency_slug } = await props.params;

  // Re-fetch the cached, RLS-scoped agency row (the layout already gated access).
  const agency = await getAgencyBySlug(agency_slug);
  if (!agency) notFound();

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseServiceRoleClient();

  const [userRes, membershipsRes, usersRes] = await Promise.all([
    supabase.auth.getUser(),
    admin
      .from("agency_memberships")
      .select(
        "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at, agency_membership_created_at, profiles(profile_name_full)",
      )
      .eq("agency_id", agency["agency_id"])
      .order("agency_membership_created_at", { ascending: true }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const user = userRes.data.user;
  const memberships = membershipsRes.data ?? [];

  const emailByProfileId = new Map<string, string | null>();
  if (!usersRes.error) {
    for (const u of usersRes.data.users) emailByProfileId.set(u.id, u.email ?? null);
  }

  const affiliates: TeamAffiliate[] = memberships.map((m) => ({
    agency_membership_id: m["agency_membership_id"],
    profile_id: m["profile_id"],
    state: AFFILIATION_STATE(m),
    name: m["profiles"]?.["profile_name_full"] ?? emailByProfileId.get(m["profile_id"]) ?? m["profile_id"].slice(0, 8),
    email: emailByProfileId.get(m["profile_id"]) ?? null,
    is_self: Boolean(user && m["profile_id"] === user.id),
  }));

  return (
    <TeamList
      agencyId={agency["agency_id"]}
      affiliates={affiliates}
      inviteHref={ROUTE("/a/[agency_slug]/team", { agency_slug: agency["agency_slug"] })}
    />
  );
}

const LOCALE_ES = { page_title: "Equipo de la agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agency team" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Equipe da agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
