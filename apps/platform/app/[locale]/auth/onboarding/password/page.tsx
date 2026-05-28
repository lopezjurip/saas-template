import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasswordEmailChip } from "./password-email-chip";
import { PasswordForm } from "./password-form";

export default async function OnboardingPasswordPage(_props: PageProps<"/[locale]/auth/onboarding/password">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-[460px]">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="password"
          title="Crea una contraseña"
          subtitle="La usarás solo cuando no puedas usar passkey o un código por correo. Mínimo 8 caracteres."
        >
          {state.email && <PasswordEmailChip email={state.email} />}
          <PasswordForm />
        </StepShell>
      </div>
    </AuthCard>
  );
}
