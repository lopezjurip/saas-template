import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";

export default async function AuthErrorPage(props: PageProps<"/auth/error">) {
  const locale = await getServerLocale();
  const sp = await props.searchParams;
  const reason = SINGLE(sp["reason"]);

  const { t } = await getRosetta(LOCALES, locale);

  const message =
    reason === "missing_code"
      ? t("reasons.missing_code")
      : reason === "invalid_confirmation_link"
        ? t("reasons.invalid_confirmation_link")
        : reason === "oauth_init_failed"
          ? t("reasons.oauth_init_failed")
          : reason === "unknown_provider"
            ? t("reasons.unknown_provider")
            : t("reasons.unknown");

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert size={22} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-xl/normal font-semibold tracking-tight text-foreground">{t("heading")}</h1>
          <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{message}</p>
        </div>
        <Button asChild className="h-10 w-full">
          <Link href={ROUTE("/auth")}>{t("back")}</Link>
        </Button>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading: "No pudimos continuar",
  reasons: {
    missing_code: "El enlace de acceso venía incompleto. Vuelve a intentarlo.",
    invalid_confirmation_link: "Este enlace de confirmación no es válido o ya caducó.",
    oauth_init_failed: "No pudimos iniciar el acceso con ese proveedor. Intenta de nuevo.",
    unknown_provider: "Ese proveedor de acceso no está disponible.",
    unknown: "Algo salió mal al iniciar sesión. Vuelve a intentarlo.",
  },
  back: "Volver a iniciar sesión",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "We couldn't continue",
  reasons: {
    missing_code: "The access link was incomplete. Please try again.",
    invalid_confirmation_link: "This confirmation link is invalid or has expired.",
    oauth_init_failed: "We couldn't start sign-in with that provider. Please try again.",
    unknown_provider: "That sign-in provider is not available.",
    unknown: "Something went wrong signing in. Please try again.",
  },
  back: "Back to sign in",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Não conseguimos continuar",
  reasons: {
    missing_code: "O link de acesso estava incompleto. Tente novamente.",
    invalid_confirmation_link: "Este link de confirmação não é válido ou já expirou.",
    oauth_init_failed: "Não conseguimos iniciar o acesso com esse fornecedor. Tente novamente.",
    unknown_provider: "Esse fornecedor de acesso não está disponível.",
    unknown: "Algo correu mal ao iniciar sessão. Tente novamente.",
  },
  back: "Voltar ao início de sessão",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
