import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRosetta } from "~/hooks/get-rosetta";
import { AFFILIATION_STATE, IS_ACTIVE_MEMBERSHIP } from "~/lib/agencies";
import { assertLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AgencyConsole, type ConsoleData } from "./agency-console";

export async function generateMetadata(props: PageProps<"/[locale]/a/[agency_slug]">): Promise<Metadata> {
  const { locale, agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const admin = createServiceRoleClient();
  const { data } = await admin.from("agencies").select("agency_name").eq("agency_slug", agency_slug).maybeSingle();
  return { title: data?.agency_name ?? t("page_title") };
}

export default async function AgencyConsolePage(props: PageProps<"/[locale]/a/[agency_slug]">) {
  const { locale, agency_slug } = await props.params;
  assertLocale(locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceRoleClient();

  const agencyRes = await admin
    .from("agencies")
    .select("agency_id, agency_name, agency_slug, agency_disabled_at")
    .eq("agency_slug", agency_slug)
    .maybeSingle();
  if (!agencyRes.data) notFound();
  const agency = agencyRes.data;

  const [membershipsRes, grantsRes, usersRes] = await Promise.all([
    admin
      .from("agency_memberships")
      .select(
        "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at, agency_membership_created_at, profiles(profile_name_full)",
      )
      .eq("agency_id", agency.agency_id)
      .order("agency_membership_created_at", { ascending: true }),
    admin
      .from("agencies_organizations_grants")
      .select("agency_id, organization_id, permission_id, organizations(organization_name, organization_slug)")
      .eq("agency_id", agency.agency_id),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const memberships = membershipsRes.data ?? [];

  // Only an ACTIVE affiliate of this agency may open its console.
  const viewerIsActive = memberships.some((m) => user && m.profile_id === user.id && IS_ACTIVE_MEMBERSHIP(m));
  if (!viewerIsActive) notFound();

  const emailByProfileId = new Map<string, string | null>();
  if (!usersRes.error) {
    for (const u of usersRes.data.users) emailByProfileId.set(u.id, u.email ?? null);
  }

  const affiliates = memberships.map((m) => ({
    agency_membership_id: m.agency_membership_id,
    profile_id: m.profile_id,
    state: AFFILIATION_STATE(m),
    name: m.profiles?.profile_name_full ?? emailByProfileId.get(m.profile_id) ?? m.profile_id.slice(0, 8),
    email: emailByProfileId.get(m.profile_id) ?? null,
    is_self: Boolean(user && m.profile_id === user.id),
  }));

  const grants = grantsRes.data ?? [];
  const isGlobal = grants.some((g) => g.organization_id === null && g.permission_id === "*");
  const orgs = grants
    .filter((g) => g.organization_id !== null)
    .map((g) => ({
      organization_id: g.organization_id as number,
      organization_name: g.organizations?.organization_name ?? String(g.organization_id),
      organization_slug: g.organizations?.organization_slug ?? null,
    }));

  const data: ConsoleData = {
    agency_id: agency.agency_id,
    agency_name: agency.agency_name,
    agency_slug: agency.agency_slug,
    disabled: Boolean(agency.agency_disabled_at),
    affiliates,
    is_global: isGlobal,
    orgs,
  };

  return (
    <AgencyConsole
      data={data}
      inviteHref={ROUTE("/[locale]/admin/agencies/[slug]/affiliates/new", {
        locale,
        slug: agency["agency_slug"],
      })}
    />
  );
}

const LOCALE_ES = { page_title: "Consola de agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agency console" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Console da agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
