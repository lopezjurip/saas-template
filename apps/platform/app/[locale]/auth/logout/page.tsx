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
          <button type="submit" className="sc-btn sc-btn-primary sc-btn-block">
            Cerrar sesión
          </button>
          <Link href={`/${locale}/home`} className="sc-btn sc-btn-outline sc-btn-block">
            Cancelar
          </Link>
        </form>
      </div>
    </AuthCard>
  );
}
