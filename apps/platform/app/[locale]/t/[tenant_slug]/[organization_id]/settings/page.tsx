import { redirect } from "next/navigation";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

export default async function SettingsIndexPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings">,
) {
  const { locale, tenant_slug, organization_id } = await props.params;
  redirect(
    ROUTE_HREF(
      ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings/general", {
        locale,
        tenant_slug,
        organization_id,
      }),
    ),
  );
}
