import type { Metadata } from "next";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import type { SsoProvider } from "./sso-settings";
import { SsoSettings } from "./sso-settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

const TenantSsoPageQuery = gql(`
  query TenantSsoPageQuery($tenantId: BigInt!) {
    tenantSsoProvidersCollection(
      filter: { tenantId: { eq: $tenantId } }
      orderBy: [{ ssoProviderCreatedAt: AscNullsLast }]
    ) {
      edges {
        node {
          ssoProviderId
          ssoProviderLabel
          ssoProviderDomains
          ssoProviderEnabled
        }
      }
    }
  }
`);

export default async function TenantSsoPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/tenant/sso">,
) {
  const { tenant_slug } = await props.params;

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({
    query: TenantSsoPageQuery,
    variables: { tenantId: String(tenant["tenantId"]) },
  });

  const SsoProviderSchema = z.object({
    ssoProviderId: z.string(),
    ssoProviderLabel: z.string(),
    ssoProviderDomains: z.array(z.string()),
    ssoProviderEnabled: z.boolean(),
  });

  const providers: SsoProvider[] = (data?.["tenantSsoProvidersCollection"]?.["edges"] ?? []).map((e) => {
    const n = SsoProviderSchema.parse(e["node"]);
    return {
      sso_provider_id: n["ssoProviderId"],
      sso_provider_label: n["ssoProviderLabel"],
      sso_provider_domains: n["ssoProviderDomains"],
      sso_provider_enabled: n["ssoProviderEnabled"],
    };
  });

  return <SsoSettings tenantId={tenant["tenantId"]} tenantName={tenant["tenantName"]} providers={providers} />;
}

const LOCALES = {
  es: { page_title: "SSO" },
  en: { page_title: "SSO" },
  pt: { page_title: "SSO" },
};
