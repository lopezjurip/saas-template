import { createServerClient } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

type TenantClaim = { id: number; slug: string };
type OrganizationClaim = { id: number; role: string };

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const tenants = (user.app_metadata?.tenants ?? []) as TenantClaim[];
  const organizations = (user.app_metadata?.organizations ?? []) as OrganizationClaim[];

  const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST ?? "localhost:7002";
  const protocol = tenantHost.startsWith("localhost") || tenantHost.includes("127.0.0.1") ? "http" : "https";

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium">Tus empresas</h2>
            {tenants.length === 0 ? (
              <p className="text-muted-foreground mt-1 text-sm">Aún no perteneces a ninguna empresa.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {tenants.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`${protocol}://${t.slug}.${tenantHost}`}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-md border px-3 py-2 text-sm transition"
                    >
                      <span className="font-medium">{t.slug}</span>
                      <span className="text-muted-foreground text-xs">
                        {organizations.length} {organizations.length === 1 ? "organización" : "organizaciones"}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button asChild className="w-full">
            <Link href="/tenants/create">Crear empresa</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/logout">Cerrar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
