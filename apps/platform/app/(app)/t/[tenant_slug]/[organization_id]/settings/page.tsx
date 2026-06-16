import { redirect } from "next/navigation";
import { getServerLocale } from "~/lib/i18n.server";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

export default async function SettingsIndexPage(props: PageProps<"/t/[tenant_slug]/[organization_id]/settings">) {
  const { tenant_slug, organization_id } = await props.params;
  const locale = await getServerLocale();
  redirect(
    ROUTE_HREF(
      ROUTE("/t/[tenant_slug]/[organization_id]/settings/general", {
        tenant_slug,
        organization_id,
      }),
    ),
  );
}
