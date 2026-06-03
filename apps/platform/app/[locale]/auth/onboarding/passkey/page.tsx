import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasskeyForm } from "./passkey-form";

export default async function OnboardingPasskeyPage(_props: PageProps<"/[locale]/auth/onboarding/passkey">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="passkey"
          title="Crea tu passkey"
          subtitle="Tu dispositivo te pedirá Face ID, Touch ID o tu PIN para guardarla. Después de esto, podrás entrar sin escribir contraseña."
        >
          <PasskeyForm email={state.email ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}
