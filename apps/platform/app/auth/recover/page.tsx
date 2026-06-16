import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";

/**
 * Minimal recovery: the universal way back in is a magic link to the email/phone on the
 * account, which the /auth entry already does. Backup codes / assisted recovery need
 * backend that isn't wired yet, so we point at support instead of faking it.
 */
export default async function AuthRecoverPage() {
  const locale = await getServerLocale();

  const { t } = await getRosetta(LOCALES, locale);

  return (
    <AuthCard>
      <div className="flex flex-col gap-5.5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
            <KeyRound size={20} />
          </span>
          <div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
            <p className="mt-1 mb-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{t("body")}</p>
          </div>
        </div>

        <Button asChild className="h-10 w-full">
          <Link href={ROUTE("/auth")}>
            <Mail size={16} />
            <span>{t("cta")}</span>
          </Link>
        </Button>

        <div className="flex flex-col items-center gap-3">
          <p className="m-0 text-center text-xs leading-normal text-muted-foreground text-pretty">
            {t("no_access_prefix")}{" "}
            <a
              className="underline decoration-border underline-offset-2 hover:decoration-foreground"
              href="mailto:soporte@example.com"
            >
              soporte@example.com
            </a>{" "}
            {t("no_access_suffix")}
          </p>
          <AuthBackLink>{t("back")}</AuthBackLink>
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading: "¿Perdiste el acceso?",
  body: "Te enviamos un enlace mágico al correo o teléfono de tu cuenta para que vuelvas a entrar. No necesitas recordar ninguna contraseña.",
  cta: "Recibir un enlace para entrar",
  no_access_prefix: "¿No tienes acceso a tu correo ni teléfono? Escríbenos a",
  no_access_suffix: "y verificamos tu identidad.",
  back: "Volver a iniciar sesión",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Lost access?",
  body: "We'll send a magic link to the email or phone on your account so you can sign back in. No password needed.",
  cta: "Receive a sign-in link",
  no_access_prefix: "No access to your email or phone? Write to us at",
  no_access_suffix: "and we'll verify your identity.",
  back: "Back to sign in",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Perdeu o acesso?",
  body: "Enviaremos um link mágico para o e-mail ou telefone da sua conta para que possa entrar novamente. Não precisa de se lembrar de nenhuma senha.",
  cta: "Receber um link para entrar",
  no_access_prefix: "Sem acesso ao e-mail ou telefone? Escreva-nos para",
  no_access_suffix: "e verificamos a sua identidade.",
  back: "Voltar ao início de sessão",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
