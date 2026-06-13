import { IdentityChip } from "~/components/identity/chips";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasswordForm } from "./password-form";

export default async function OnboardingPasswordPage(props: PageProps<"/[locale]/auth/onboarding/password">) {
  const { locale } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="password" title={t("title")} subtitle={t("subtitle")}>
          {state.email && <IdentityChip kind="email" value={state.email} />}
          <PasswordForm />
        </StepShell>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title: "Crea una contraseña",
  subtitle: "La usarás solo cuando no puedas usar passkey o un código por correo. Mínimo 8 caracteres.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Create a password",
    subtitle: "You'll use it only when you can't use a passkey or an email code. Minimum 8 characters.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Crie uma senha",
    subtitle: "Você a usará apenas quando não puder usar passkey ou um código por e-mail. Mínimo 8 caracteres.",
  } satisfies typeof LOCALE_ES,
};
