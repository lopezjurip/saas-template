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
import { notFound, redirect } from "next/navigation";
import { getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tenant_slug: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { locale, tenant_slug } = await params;
  const { redirect: redirectParam } = await searchParams;

  const { data: tenantData } = await getViewerTenantBySlug(tenant_slug);
  const tenant = tenantData?.["tenant"];
  if (!tenant) notFound();
  const tenant_id = tenant["tenant_id"];

  const { data: orgsData } = await getViewerOrganizations({ filter: { tenant_id: { eq: tenant_id } } });
  const orgs = orgsData?.["organizations"]?.["edges"]?.map((e) => e["node"]) ?? [];

  if (orgs.length === 0) {
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

  if (redirectParam !== "false" && orgs.length === 1) {
    const only = orgs[0]!;
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
          {orgs.map((organization) => (
            <Button asChild key={organization["organization_id"]} variant="outline" className="w-full justify-between">
              <Link href={`/${locale}/t/${tenant_slug}/${organization["organization_id"]}`}>
                <span>{organization["organization_name"]}</span>
                <span className="text-xs text-muted-foreground">{organization["organization_slug"]}</span>
              </Link>
            </Button>
          ))}
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
