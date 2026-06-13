import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { EmailForm } from "./email-form";

export default async function OnboardingEmailPage(props: PageProps<"/[locale]/auth/onboarding/email">) {
  const { locale } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="email" title={t("title")} subtitle={t("subtitle")}>
          <EmailForm defaultEmail={state.email ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title: "Confirma tu correo",
  subtitle:
    "Te enviaremos un código de 6 dígitos para verificarlo. Sirve para recuperar tu cuenta si pierdes los otros métodos.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Confirm your email",
    subtitle:
      "We'll send you a 6-digit code to verify it. It's used to recover your account if you lose the other methods.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Confirme seu e-mail",
    subtitle:
      "Enviaremos um código de 6 dígitos para verificá-lo. Serve para recuperar sua conta se você perder os outros métodos.",
  } satisfies typeof LOCALE_ES,
};
