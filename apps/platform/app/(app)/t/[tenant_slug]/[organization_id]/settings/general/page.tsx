import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { z } from "zod";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/lib/i18n.server";
import { assertParams } from "~/lib/params";
import { GeneralSettings } from "./general-settings";

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/general">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationGeneralSettingsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/general">,
) {
  const { tenant_slug, organization_id } = assertParams(
    await props.params,
    z.object({ tenant_slug: z.string().min(1), organization_id: z.int().min(1) }),
    "notFound",
  );

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const supabase = await createSupabaseServerClient();
  const logoResult = await supabase
    .from("storage_organizations")
    .select("src")
    .eq("organization_id", organization_id)
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const logoSrc = logoResult.data?.["src"]
    ? new URL(logoResult.data["src"], process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString()
    : null;

  return (
    <GeneralSettings
      organizationId={organization_id}
      organizationName={organization["organizationName"]}
      slug={tenant_slug}
      logoSrc={logoSrc}
    />
  );
}

const LOCALE_ES = { page_title: "Organización" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Organization" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Organização" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
