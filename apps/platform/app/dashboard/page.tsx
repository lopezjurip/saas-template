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
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  const metadata = await getSupabaseUserMetadata();
  const tenants = metadata?.tenants ?? [];

  const apexHost = process.env.NEXT_PUBLIC_APEX_HOST ?? "lvh.me:7003";

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Humane</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm font-medium">Tus empresas</p>
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no perteneces a ninguna empresa.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tenants.map((t) => (
                <Button key={t.id} asChild variant="outline" className="w-full justify-start">
                  <a href={`https://${t.slug}.${apexHost}`}>{t.slug}</a>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/tenants/create">Crear empresa</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/logout">Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
