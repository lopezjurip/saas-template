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
import Link from "next/link";
import { notFound } from "next/navigation";
import { gql } from "~/generated/graphql";
import { createGraphy } from "~/lib/graphy/graphy.browser";

const TenantHomeQuery = gql(`
  query TenantHomeQuery($tenant_id: Int!) {
    profile: viewer_profile {
      profile_name_full
    }
    tenant: viewer_tenant_by_id(target_tenant_id: $tenant_id) {
      tenant_id
      tenant_name
      tenant_slug
      organizationsCollection(
        filter: { organization_disabled_at: { is: NULL } }
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
  }
`);

export default async function TenantHomePage({ params }: { params: Promise<{ tenant_slug: string }> }) {
  const routeParams = await params;
  const tenant_slug = routeParams["tenant_slug"];

  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const metadata = await getSupabaseUserMetadata();
  const allTenantClaims = metadata?.["tenants"] ?? [];
  const allOrgClaims = metadata?.["organizations"] ?? [];

  const tenant_id = allTenantClaims.find((t) => t["slug"] === tenant_slug)?.["id"];
  if (!tenant_id) {
    notFound();
  }

  const graphy = createGraphy(session);
  const { data } = await graphy.query({ query: TenantHomeQuery, variables: { tenant_id } });

  const tenant = data?.["tenant"];
  if (!tenant) {
    notFound();
  }
  const edges = tenant["organizationsCollection"]?.["edges"] ?? [];
  const profile_name_full = data?.["profile"]?.["profile_name_full"] ?? null;
  const tenant_name = tenant["tenant_name"];

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tenant_name}</CardTitle>
          <CardDescription>{tenant_slug}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {profile_name_full ? <p className="text-sm">Hola, {profile_name_full}.</p> : null}
          <p className="text-sm font-medium">Tus organizaciones aquí</p>
          {edges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes organizaciones en esta empresa.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {edges.map((edge) => {
                const organization = edge["node"];
                const organization_id = organization["organization_id"];
                const role = allOrgClaims.find((c) => c["id"] === organization_id)?.["role"] ?? "—";
                return (
                  <div
                    key={organization_id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{organization["organization_name"]}</span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/logout">Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
