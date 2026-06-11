import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { SINGLE } from "@packages/utils/array";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";

export default async function TenantHomePage(props: PageProps<"/[locale]/t/[tenant_slug]">) {
  const { locale, tenant_slug } = await props.params;
  const { redirect: redirectParams } = await props.searchParams;
  const redirectParam = SINGLE(redirectParams);

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);
  const tenant_id = tenant["tenant_id"];

  const { data } = await getViewerOrganizations({
    filter: { tenant_id: { eq: tenant_id } },
  });
  const organizations = data?.["organizations"]?.["edges"] || [];

  if (organizations.length === 0) {
    return (
      <main className="bg-muted flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{tenant["tenant_name"]}</CardTitle>
            <CardDescription>{tenant_slug}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No tienes organizaciones activas en esta empresa.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href={`/${locale}/auth/logout`}>Cerrar sesión</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (redirectParam !== "false" && organizations.length === 1) {
    const only = organizations[0]!["node"];
    redirect(`/[locale]/t/${tenant_slug}/${only["organization_id"]}`);
  }

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tenant["tenant_name"]}</CardTitle>
          <CardDescription>Elige una organización para continuar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {organizations.map(({ ["node"]: organization }) => {
            return (
              <Button
                asChild
                key={organization["organization_id"]}
                data-organization_id={organization["organization_id"]}
                variant="outline"
                className="w-full justify-between"
              >
                <Link href={`/${locale}/t/${tenant_slug}/${organization["organization_id"]}`}>
                  <span>{organization["organization_name"]}</span>
                  <span className="text-xs text-muted-foreground">{organization["organization_slug"]}</span>
                </Link>
              </Button>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/auth/logout`}>Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
