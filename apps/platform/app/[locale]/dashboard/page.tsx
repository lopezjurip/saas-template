import { getSupabaseServerUser } from "@packages/supabase/client.server";
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
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

const DashboardPageQuery = gql(`
  query DashboardPageQuery {
    viewer_organizations(
      filter: { organization_disabled_at: { is: NULL } }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          organization_id
          organization_name
          organization_slug
          tenants {
            tenant_id
            tenant_slug
            tenant_name
          }
        }
      }
    }
  }
`);

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { locale } = await params;
  const { redirect: redirectParam } = await searchParams;
  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/${locale}/auth`);
  }

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: DashboardPageQuery });
  const edges = data?.["viewer_organizations"]?.["edges"] ?? [];

  if (redirectParam !== "false" && edges.length === 1) {
    const only = edges[0]!["node"];
    const tenant_slug = only["tenants"]?.["tenant_slug"];
    const organization_id = only["organization_id"];
    if (tenant_slug && organization_id) {
      redirect(`/${locale}/${tenant_slug}/${organization_id}`);
    }
  }

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Humane</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm font-medium">Tus organizaciones</p>
          {edges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no perteneces a ninguna organización.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {edges.map((edge) => {
                const organization = edge["node"];
                const tenant = organization["tenants"];
                const tenant_slug = tenant?.["tenant_slug"];
                return (
                  <Button
                    key={organization["organization_id"]}
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!tenant_slug}
                  >
                    <Link href={tenant_slug ? `/${locale}/${tenant_slug}` : "#"}>
                      <span className="flex flex-col items-start">
                        <span>{organization["organization_name"]}</span>
                        {tenant?.["tenant_name"] ? (
                          <span className="text-xs text-muted-foreground">{tenant["tenant_name"]}</span>
                        ) : null}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/${locale}/tenants/create`}>Crear empresa</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/dashboard/account`}>Administrar cuenta</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/auth/logout`}>Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
