import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PhoneForm } from "./phone-form";

export default async function OnboardingPhonePage(_props: PageProps<"/[locale]/auth/onboarding/phone">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="phone"
          title="Agrega tu teléfono"
          subtitle="Te enviaremos un código para verificarlo. Después podrás recibir códigos por SMS o WhatsApp al iniciar sesión."
        >
          <PhoneForm defaultPhone={state.phone ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}
