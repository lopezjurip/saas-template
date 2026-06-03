import { redirect } from "next/navigation";

export default async function SettingsIndexPage(
  props: PageProps<"/[locale]/[tenant_slug]/[organization_id]/settings">,
) {
  const { locale, tenant_slug, organization_id } = await props.params;
  redirect(`/${locale}/${tenant_slug}/${organization_id}/settings/general`);
}
