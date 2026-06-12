import { PwaInstallBanner } from "~/components/pwa-install-banner";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";

export default async function TenantSlugLayout(props: LayoutProps<"/[locale]/t/[tenant_slug]">) {
  const { tenant_slug } = await props.params;
  await getViewerTenantBySlugAssert(tenant_slug);
  return (
    <>
      {props.children}
      <PwaInstallBanner />
    </>
  );
}
