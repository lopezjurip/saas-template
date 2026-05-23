import type { ResultOf } from "@graphql-typed-document-node/core";
import { createServerClient, getSupabaseUserMetadata } from "@packages/supabase/client.server";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { notFound } from "next/navigation";
import { gql } from "~/generated/graphql";
import { createGraphy } from "~/lib/graphy/graphy.browser";

const TenantHomeQuery = gql(`
  query TenantHomeQuery($tenantId: Int!) {
    profile: viewer_profile {
      profile_name_full
    }
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

type TenantHomeQueryType = ResultOf<typeof TenantHomeQuery>;
type TenantOrganization = NonNullable<
  NonNullable<TenantHomeQueryType["organizationsCollection"]>["edges"][number]["node"]
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

  const tenantId = allTenantClaims.find((t) => t.slug === tenantSlug)?.id;
  if (!tenantId) {
    notFound();
  }

  const graphy = createGraphy(session);
  const { data } = await graphy.query({ query: TenantHomeQuery, variables: { tenantId } });

  const orgs: TenantOrganization[] =
    data?.organizationsCollection?.edges?.map((e) => e.node).filter((n): n is TenantOrganization => n != null) ?? [];

  const profileName = data?.profile?.profile_name_full ?? null;
  const apexHost = process.env.NEXT_PUBLIC_APEX_HOST ?? "lvh.me:7003";

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tenantSlug}</CardTitle>
          <CardDescription>
            {tenantSlug}.{apexHost}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {profileName ? <p className="text-sm">Hola, {profileName}.</p> : null}
          <p className="text-sm font-medium">Tus organizaciones aquí</p>
          {orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes organizaciones en esta empresa.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orgs.map((o) => {
                const role = allOrgClaims.find((c) => c.id === o.organization_id)?.role ?? "—";
                return (
                  <div
                    key={o.organization_id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{o.organization_name}</span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <a href="/auth/logout">Cerrar sesión</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
