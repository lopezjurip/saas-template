import { SINGLE } from "@packages/utils/array";
import { getRosetta } from "~/hooks/get-rosetta";
import { AuthCard } from "./_components/auth-card";
import { AuthDivider } from "./_components/auth-divider";
import { AuthEntryForm } from "./_components/auth-entry-form";
import { AuthHeader } from "./_components/auth-header";
import { OAuthSection } from "./_components/oauth-section";

export default async function AuthPage(props: PageProps<"/[locale]/auth">) {
  const sp = await props.searchParams;
  const next = SINGLE(sp["next"]) ?? "/";
  const errorCode = SINGLE(sp["error"]);

  const { t } = await getRosetta(LOCALES);

  const error = errorCode
    ? errorCode === "empty"
      ? t("errors.empty")
      : errorCode === "invalid_email"
        ? t("errors.invalid_email")
        : errorCode === "invalid_phone"
          ? t("errors.invalid_phone")
          : errorCode === "invalid_document"
            ? t("errors.invalid_document")
            : t("errors.unknown")
    : null;

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <OAuthSection next={next} />
          <AuthDivider>{t("divider")}</AuthDivider>
          <AuthEntryForm next={next} error={error} />
        </div>
        <p className="m-0 text-center text-tiny leading-relaxed text-muted-foreground">
          {t("legal_prefix")}{" "}
          <a className="underline decoration-border underline-offset-2 hover:decoration-foreground" href="/legal/terms">
            {t("terms")}
          </a>{" "}
          {t("legal_middle")}{" "}
          <a
            className="underline decoration-border underline-offset-2 hover:decoration-foreground"
            href="/legal/privacy"
          >
            {t("privacy")}
          </a>
          .
        </p>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  errors: {
    empty: "Escribe tu correo, teléfono o RUT para continuar.",
    invalid_email: "Ese correo no parece válido. Revisa el formato.",
    invalid_phone: "Ese teléfono no parece válido. Usa formato internacional, e.g. +56 9 1234 5678.",
    invalid_document: "Ese documento no parece válido. Revisa el formato.",
    unknown: "No pudimos continuar. Intenta de nuevo.",
  },
  divider: "o usa tu cuenta",
  legal_prefix: "Al continuar aceptas nuestros",
  terms: "Términos",
  legal_middle: "y la",
  privacy: "Política de privacidad",
};

const LOCALE_EN: typeof LOCALE_ES = {
  errors: {
    empty: "Enter your email, phone or ID to continue.",
    invalid_email: "That email doesn't look valid. Check the format.",
    invalid_phone: "That phone doesn't look valid. Use international format, e.g. +56 9 1234 5678.",
    invalid_document: "That document doesn't look valid. Check the format.",
    unknown: "We couldn't continue. Please try again.",
  },
  divider: "or use your account",
  legal_prefix: "By continuing you accept our",
  terms: "Terms",
  legal_middle: "and our",
  privacy: "Privacy policy",
};

const LOCALE_PT: typeof LOCALE_ES = {
  errors: {
    empty: "Escreva o seu e-mail, telefone ou documento para continuar.",
    invalid_email: "Esse e-mail não parece válido. Verifique o formato.",
    invalid_phone: "Esse telefone não parece válido. Use o formato internacional, ex. +56 9 1234 5678.",
    invalid_document: "Esse documento não parece válido. Verifique o formato.",
    unknown: "Não conseguimos continuar. Tente novamente.",
  },
  divider: "ou use a sua conta",
  legal_prefix: "Ao continuar, aceita os nossos",
  terms: "Termos",
  legal_middle: "e a nossa",
  privacy: "Política de privacidade",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
