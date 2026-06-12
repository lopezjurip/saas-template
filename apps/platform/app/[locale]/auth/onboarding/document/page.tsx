import { getCountries } from "~/hooks/get-countries";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { DocumentForm } from "./document-form";

export default async function OnboardingDocumentPage() {
  const [state, countriesResult] = await Promise.all([getViewerOnboardingState(), getCountries()]);
  const countries = countriesResult.data?.["addresses_level0"]?.["edges"]?.map((entry) => entry["node"]) ?? [];

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="document"
          title="Agrega tu documento"
          subtitle="Necesitamos el país para adaptar el tipo, formato y validación del documento. No se publica en tu perfil."
        >
          <DocumentForm countries={countries} />
        </StepShell>
      </div>
    </AuthCard>
  );
}
