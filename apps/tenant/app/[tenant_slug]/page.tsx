import type { ResultOf } from "@graphql-typed-document-node/core";
import { createServerClient, getSupabaseUserMetadata } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { notFound } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getViewerProfile } from "~/hooks/use-viewer-profile";
import { createGraphy } from "~/lib/graphy/graphy.browser";

const TenantOrganizationsQuery = gql(`
  query TenantOrganizationsQuery($tenantId: Int!) {
    organizationsCollection(
      filter: {
        organization_disabled_at: { is: NULL }
        tenant_id: { eq: $tenantId }
      }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          organization_id
          organization_name
          organization_slug
        }
      }
    }
  }
`);

type TenantOrganizationsQueryType = ResultOf<typeof TenantOrganizationsQuery>;
type TenantOrganization = NonNullable<
  NonNullable<TenantOrganizationsQueryType["organizationsCollection"]>["edges"][number]["node"]
>;

export default async function TenantHomePage({ params }: { params: Promise<{ tenant_slug: string }> }) {
  const { tenant_slug: tenantSlug } = await params;

  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const metadata = await getSupabaseUserMetadata();
  const allTenantClaims = metadata?.tenants ?? [];
  const allOrgClaims = metadata?.organizations ?? [];

  // Proxy already validated membership; derive tenant_id from the JWT mapping.
  const tenantId = allTenantClaims.find((t) => t.slug === tenantSlug)?.id;
  if (!tenantId) {
    notFound();
  }

  const graphy = createGraphy(session);
  const { data } = await graphy.query({ query: TenantOrganizationsQuery, variables: { tenantId: tenantId! } });

  const orgsInTenant: TenantOrganization[] =
    data?.organizationsCollection?.edges?.map((e) => e.node).filter((n): n is TenantOrganization => n != null) ?? [];

  const { data: { profile } = { ["profile"]: null } } = await getViewerProfile();
  const profile_name_full = profile?.["profile_name_full"];

  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://platform.lvh.me:7003";

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>{tenantSlug}.humane.cl</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-sm">
            <p>
              Hola <strong>{profile_name_full}</strong>.
            </p>
            <p className="text-muted-foreground">Tenant ID: {tenantId}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Tus organizaciones aquí</h2>
            {orgsInTenant.length === 0 ? (
              <p className="text-muted-foreground mt-1 text-xs">No tienes organizaciones en esta empresa.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {orgsInTenant.map((o) => {
                  const role = allOrgClaims.find((c) => c.id === o.organization_id)?.role ?? "—";
                  return (
                    <li
                      key={o.organization_id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{o.organization_name}</span>
                      <span className="text-muted-foreground text-xs uppercase">{role}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Button asChild variant="outline" className="w-full">
            <a href={`${platformUrl}/auth/logout`}>Cerrar sesión</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
