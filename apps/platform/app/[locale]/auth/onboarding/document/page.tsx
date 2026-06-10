import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { DocumentForm } from "./document-form";

export default async function OnboardingDocumentPage(props: PageProps<"/[locale]/auth/onboarding/document">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="document"
          title="Agrega tu documento"
          subtitle="Lo pediremos cuando lo necesites — para firmar contratos o pasar verificación KYC. No se publica en tu perfil."
        >
          <DocumentForm />
        </StepShell>
      </div>
    </AuthCard>
  );
}
