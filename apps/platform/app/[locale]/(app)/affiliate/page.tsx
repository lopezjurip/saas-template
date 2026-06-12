import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import type { Metadata } from "next";
import { getRosetta } from "~/hooks/get-rosetta";
import { AFFILIATION_STATE } from "~/lib/agencies";
import { assertLocale } from "~/lib/i18n.server";
import { type AffiliateAgency, AffiliateDashboard, type AffiliateInvitation } from "./affiliate-dashboard";

export async function generateMetadata(props: PageProps<"/[locale]/affiliate">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AffiliatePage(props: PageProps<"/[locale]/affiliate">) {
  const { locale } = await props.params;
  assertLocale(locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewer_profile_id = user?.id ?? null;

  const admin = createServiceRoleClient();

  const membershipsRes = viewer_profile_id
    ? await admin
        .from("agency_memberships")
        .select(
          "agency_membership_id, agency_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at, agency_membership_created_at, agencies(agency_id, agency_name, agency_slug, agency_disabled_at)",
        )
        .eq("profile_id", viewer_profile_id)
        .order("agency_membership_created_at", { ascending: true })
    : { data: [] as never[] };

  const memberships = membershipsRes.data ?? [];

  const acceptedAgencyIds = memberships
    .filter((m) => AFFILIATION_STATE(m) === "accepted" && m.agencies && !m.agencies.agency_disabled_at)
    .map((m) => m.agency_id);

  // Grants for the agencies the viewer is an active affiliate of.
  const grantsRes =
    acceptedAgencyIds.length > 0
      ? await admin
          .from("agencies_organizations_grants")
          .select("agency_id, organization_id, permission_id, organizations(organization_name, organization_slug)")
          .in("agency_id", acceptedAgencyIds)
      : { data: [] as never[] };

  const globalByAgency = new Set<string>();
  const orgsByAgency = new Map<
    string,
    { organization_id: number; organization_name: string; organization_slug: string | null }[]
  >();
  for (const g of grantsRes.data ?? []) {
    if (g.organization_id === null) {
      if (g.permission_id === "*") globalByAgency.add(g.agency_id);
    } else {
      const list = orgsByAgency.get(g.agency_id) ?? [];
      list.push({
        organization_id: g.organization_id,
        organization_name: g.organizations?.organization_name ?? String(g.organization_id),
        organization_slug: g.organizations?.organization_slug ?? null,
      });
      orgsByAgency.set(g.agency_id, list);
    }
  }

  const agencies: AffiliateAgency[] = memberships
    .filter((m) => AFFILIATION_STATE(m) === "accepted" && m.agencies && !m.agencies.agency_disabled_at)
    .map((m) => ({
      agency_id: m.agency_id,
      agency_name: m.agencies?.agency_name ?? m.agency_id.slice(0, 8),
      agency_slug: m.agencies?.agency_slug ?? null,
      is_global: globalByAgency.has(m.agency_id),
      orgs: orgsByAgency.get(m.agency_id) ?? [],
    }));

  const invitations: AffiliateInvitation[] = memberships
    .filter((m) => AFFILIATION_STATE(m) === "pending" && m.agencies)
    .map((m) => ({
      agency_membership_id: m.agency_membership_id,
      agency_name: m.agencies?.agency_name ?? m.agency_id.slice(0, 8),
      agency_slug: m.agencies?.agency_slug ?? null,
    }));

  return <AffiliateDashboard agencies={agencies} invitations={invitations} />;
}

const LOCALE_ES = { page_title: "Portal de afiliado" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Affiliate portal" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Portal de afiliado" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
