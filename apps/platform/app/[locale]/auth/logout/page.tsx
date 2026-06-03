import { createServerClient } from "@packages/supabase/client.server";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../_components/auth-card";
import { signOutForm } from "./actions";

export default async function AuthLogoutPage(props: PageProps<"/[locale]/auth/logout">) {
  const { locale } = await props.params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Nobody to sign out — send them to the entry.
  if (!user) {
    redirect("/[locale]/auth");
  }

  const fullName = (user.user_metadata?.["full_name"] as string | undefined)?.trim();
  const email = user.email ?? "";
  const initials = (fullName || email)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <AuthCard className="max-w-104">
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut size={22} />
          </span>
          <div>
            <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-foreground">¿Cerrar sesión?</h1>
            <p className="mt-1.5 mb-0 text-[13px] leading-normal text-muted-foreground text-pretty">
              Tendrás que volver a identificarte para entrar a tus organizaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border bg-muted/45 px-3 py-2.5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-medium text-background">
            {initials || "?"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            {fullName && <div className="truncate text-sm font-medium text-foreground">{fullName}</div>}
            <div className="truncate text-[11.5px] text-muted-foreground">{email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <form action={signOutForm}>
            <Button type="submit" variant="destructive" className="h-10 w-full">
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </Button>
          </form>
          <Button asChild variant="ghost" className="h-10 w-full text-muted-foreground">
            <Link href={`/${locale}/home`}>Cancelar</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
