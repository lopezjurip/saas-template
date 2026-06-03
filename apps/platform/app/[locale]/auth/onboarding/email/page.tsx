import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { EmailForm } from "./email-form";

export default async function OnboardingEmailPage(_props: PageProps<"/[locale]/auth/onboarding/email">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="email"
          title="Confirma tu correo"
          subtitle="Te enviaremos un código de 6 dígitos para verificarlo. Sirve para recuperar tu cuenta si pierdes los otros métodos."
        >
          <EmailForm defaultEmail={state.email ?? ""} />
        </StepShell>
      </div>
    </AuthCard>
  );
}
