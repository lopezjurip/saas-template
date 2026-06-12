import { createServiceRoleClient } from "@packages/supabase/client.service";
import type { Metadata } from "next";
import { getRosetta } from "~/hooks/get-rosetta";
import { AGENCY_WILDCARD, IS_ACTIVE_MEMBERSHIP } from "~/lib/agencies";
import { assertLocale } from "~/lib/i18n.server";
import { AgencyDirectory, type AgencyDirItem } from "./agency-directory";

export async function generateMetadata(props: PageProps<"/[locale]/admin/agencies">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AdminAgenciesPage(props: PageProps<"/[locale]/admin/agencies">) {
  const { locale } = await props.params;
  assertLocale(locale);

  // The directory lists every agency. RLS scopes the authenticated client to
  // viewer_agency_ids(), so we use the service-role admin client for a platform view.
  const admin = createServiceRoleClient();

  const [agenciesRes, membershipsRes, grantsRes] = await Promise.all([
    admin
      .from("agencies")
      .select("agency_id, agency_name, agency_slug, agency_disabled_at")
      .order("agency_created_at", { ascending: true }),
    admin
      .from("agency_memberships")
      .select("agency_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at"),
    admin.from("agencies_organizations_grants").select("agency_id, organization_id, permission_id"),
  ]);

  const activeByAgency = new Map<string, number>();
  for (const m of membershipsRes.data ?? []) {
    if (IS_ACTIVE_MEMBERSHIP(m)) {
      activeByAgency.set(m.agency_id, (activeByAgency.get(m.agency_id) ?? 0) + 1);
    }
  }

  const globalByAgency = new Set<string>();
  const orgIdsByAgency = new Map<string, Set<number>>();
  for (const g of grantsRes.data ?? []) {
    if (g.organization_id === null) {
      if (g.permission_id === AGENCY_WILDCARD) globalByAgency.add(g.agency_id);
    } else {
      const set = orgIdsByAgency.get(g.agency_id) ?? new Set<number>();
      set.add(g.organization_id);
      orgIdsByAgency.set(g.agency_id, set);
    }
  }

  const items: AgencyDirItem[] = (agenciesRes.data ?? []).map((a) => ({
    agency_id: a.agency_id,
    agency_name: a.agency_name,
    agency_slug: a.agency_slug,
    disabled: Boolean(a.agency_disabled_at),
    active_affiliates: activeByAgency.get(a.agency_id) ?? 0,
    is_global: globalByAgency.has(a.agency_id),
    org_count: orgIdsByAgency.get(a.agency_id)?.size ?? 0,
  }));

  return <AgencyDirectory locale={locale} items={items} />;
}

const LOCALE_ES = { page_title: "Agencias" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agencies" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Agências" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
