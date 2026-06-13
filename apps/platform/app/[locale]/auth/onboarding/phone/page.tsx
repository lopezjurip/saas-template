import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PhoneForm } from "./phone-form";

export default async function OnboardingPhonePage(props: PageProps<"/[locale]/auth/onboarding/phone">) {
  const { locale } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="phone" title={t("title")} subtitle={t("subtitle")}>
          <PhoneForm defaultPhone={state.phone ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title: "Agrega tu teléfono",
  subtitle:
    "Te enviaremos un código para verificarlo. Después podrás recibir códigos por SMS o WhatsApp al iniciar sesión.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Add your phone",
    subtitle:
      "We'll send you a code to verify it. You'll then be able to receive codes by SMS or WhatsApp when signing in.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Adicione seu telefone",
    subtitle:
      "Enviaremos um código para verificá-lo. Depois você poderá receber códigos por SMS ou WhatsApp ao entrar.",
  } satisfies typeof LOCALE_ES,
};
