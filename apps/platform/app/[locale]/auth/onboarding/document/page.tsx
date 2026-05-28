import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { DocumentLink } from "./document-link";

export default async function OnboardingDocumentPage(_props: PageProps<"/[locale]/auth/onboarding/document">) {
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
          <div className="acc-todo">
            <strong className="block text-foreground mb-1">Próximamente</strong>
            Esta sección se conecta con el flujo de KYC del backend. Por ahora puedes saltarla y volver cuando quieras.
          </div>

          <DocumentLink />
        </StepShell>
      </div>
    </AuthCard>
  );
}
