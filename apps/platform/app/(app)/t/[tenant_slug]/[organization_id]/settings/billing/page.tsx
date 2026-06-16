import { redirect } from "next/navigation";
import { ROUTE } from "~/lib/route";

/**
 * Billing moved under the company (tenant) settings group. Keep this path as a permanent
 * redirect so existing links/bookmarks to `/settings/billing` keep working.
 */
export default async function BillingRedirectPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/billing">,
) {
  const { tenant_slug, organization_id } = await props.params;
  redirect(ROUTE("/t/[tenant_slug]/[organization_id]/settings/tenant/billing", { tenant_slug, organization_id }));
}
