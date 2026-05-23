import { createServerClient } from "@packages/supabase/client.server";
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

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Humane</CardTitle>
          <CardDescription>HR y Nómina para empresas chilenas</CardDescription>
        </CardHeader>
        {user ? (
          <CardContent>
            <p className="text-sm">
              Hola, <span className="font-medium">{user.email}</span>
            </p>
          </CardContent>
        ) : null}
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={user ? "/dashboard" : "/auth"}>{user ? "Ir al dashboard" : "Ir a la plataforma"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
