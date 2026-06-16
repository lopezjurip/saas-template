import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { TenantGeneralSettings } from "./tenant-general-settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function TenantGeneralSettingsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/tenant/general">,
) {
  const { tenant_slug } = await props.params;

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);

  const supabase = await createSupabaseServerClient();
  const logoResult = await supabase
    .from("storage_tenants")
    .select("src")
    .eq("tenant_id", tenant["tenantId"])
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const logoSrc = logoResult.data?.["src"]
    ? new URL(logoResult.data["src"], process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString()
    : null;

  return (
    <TenantGeneralSettings
      tenantId={tenant["tenantId"]}
      tenantName={tenant["tenantName"]}
      tenantSlug={tenant["tenantSlug"]}
      logoSrc={logoSrc}
    />
  );
}

const LOCALE_ES = { page_title: "Empresa" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Company" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Empresa" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
