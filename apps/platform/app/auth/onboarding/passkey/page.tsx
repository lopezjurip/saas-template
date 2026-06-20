import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasskeyForm } from "./passkey-form";

export default async function OnboardingPasskeyPage() {
  const { t } = await getRosetta(LOCALES);
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="passkey" title={t("title")} subtitle={t("subtitle")}>
          <PasskeyForm email={state.email ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title: "Crea tu passkey",
  subtitle:
    "Tu dispositivo te pedirá Face ID, Touch ID o tu PIN para guardarla. Después de esto, podrás entrar sin escribir contraseña.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Create your passkey",
    subtitle:
      "Your device will ask for Face ID, Touch ID or your PIN to save it. After this, you'll be able to sign in without typing a password.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Crie seu passkey",
    subtitle:
      "Seu dispositivo pedirá Face ID, Touch ID ou seu PIN para salvá-lo. Depois disso, você poderá entrar sem digitar uma senha.",
  } satisfies typeof LOCALE_ES,
};
