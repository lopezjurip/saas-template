import { createServiceRoleClient } from "@packages/supabase/client.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assertLocale, getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AffiliationInvite } from "./affiliation-invite";

export async function generateMetadata(
  props: PageProps<"/[locale]/admin/agencies/[slug]/affiliates/new">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AdminAgencyAffiliateNewPage(
  props: PageProps<"/[locale]/admin/agencies/[slug]/affiliates/new">,
) {
  const { locale, slug } = await props.params;
  assertLocale(locale);

  const admin = createServiceRoleClient();
  const { data: agency } = await admin
    .from("agencies")
    .select("agency_id, agency_name, agency_slug")
    .eq("agency_slug", slug)
    .maybeSingle();
  if (!agency) notFound();

  return (
    <AffiliationInvite
      agencyId={agency.agency_id}
      agencyName={agency.agency_name}
      agencyHref={ROUTE("/[locale]/admin/agencies/[slug]", { locale, slug: agency["agency_slug"] })}
    />
  );
}

const LOCALE_ES = { page_title: "Afiliar persona" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Affiliate a person" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Afiliar uma pessoa" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
