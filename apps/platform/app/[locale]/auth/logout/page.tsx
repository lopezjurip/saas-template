import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { signOutForm } from "./actions";

export default async function LogoutPage(props: PageProps<"/[locale]/auth/logout">) {
  const { locale } = await props.params;
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="text-center">
          <h2 className="text-sm font-medium">¿Cerrar sesión?</h2>
          <p className="text-muted-foreground mt-1 text-sm">Vas a salir de tu cuenta en este dispositivo.</p>
        </div>
        <form action={signOutForm} className="flex flex-col gap-2">
          <Button type="submit" className="h-10 w-full">
            Cerrar sesión
          </Button>
          <Button asChild variant="outline" className="h-10 w-full">
            <Link href={`/${locale}/home`}>Cancelar</Link>
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
