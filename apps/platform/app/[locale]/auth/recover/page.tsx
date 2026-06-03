import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";

/**
 * Minimal recovery: the universal way back in is a magic link to the email/phone on the
 * account, which the /auth entry already does. Backup codes / assisted recovery need
 * backend that isn't wired yet, so we point at support instead of faking it.
 */
export default async function AuthRecoverPage(props: PageProps<"/[locale]/auth/recover">) {
  const { locale } = await props.params;

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-[10px] bg-muted text-foreground">
            <KeyRound size={20} />
          </span>
          <div>
            <h1 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-foreground">¿Perdiste el acceso?</h1>
            <p className="mt-1 mb-0 text-[13px] leading-normal text-muted-foreground text-pretty">
              Te enviamos un enlace mágico al correo o teléfono de tu cuenta para que vuelvas a entrar. No necesitas
              recordar ninguna contraseña.
            </p>
          </div>
        </div>

        <Button asChild className="h-10 w-full">
          <Link href={`/${locale}/auth`}>
            <Mail size={16} />
            <span>Recibir un enlace para entrar</span>
          </Link>
        </Button>

        <div className="flex flex-col items-center gap-3">
          <p className="m-0 text-center text-[12px] leading-normal text-muted-foreground text-pretty">
            ¿No tienes acceso a tu correo ni teléfono? Escríbenos a{" "}
            <a
              className="underline decoration-border underline-offset-2 hover:decoration-foreground"
              href="mailto:soporte@humane.cl"
            >
              soporte@humane.cl
            </a>{" "}
            y verificamos tu identidad.
          </p>
          <AuthBackLink>Volver a iniciar sesión</AuthBackLink>
        </div>
      </div>
    </AuthCard>
  );
}
