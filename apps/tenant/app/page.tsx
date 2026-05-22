import { createServerClient } from "@packages/supabase/client.server";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui-common/shadcn/components/ui/card";
import { Logo } from "@packages/ui-common/logo";
import { headers } from "next/headers";

type OrganizationClaim = { id: number; role: string };

export default async function TenantHomePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headerList = await headers();

  const tenantSlug = headerList.get("x-tenant-slug") ?? "";
  const tenantId = Number(headerList.get("x-tenant-id") ?? "0");

  const allOrgClaims = (user?.app_metadata?.organizations ?? []) as OrganizationClaim[];

  // Look up which of the user's orgs belong to this tenant.
  // biome-ignore lint/suspicious/noExplicitAny: TS6 + supabase-js inference loses Row type on chained select
  const orgsInTenantRaw = await (supabase.from("organizations") as any)
    .select("organization_id, organization_slug, organization_name")
    .eq("tenant_id", tenantId)
    .in(
      "organization_id",
      allOrgClaims.map((o) => o.id),
    );
  const orgsInTenant = (orgsInTenantRaw.data ?? []) as Array<{
    organization_id: number;
    organization_slug: string;
    organization_name: string;
  }>;

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Tú";
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:7000";

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
              Hola <strong>{fullName}</strong>.
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
