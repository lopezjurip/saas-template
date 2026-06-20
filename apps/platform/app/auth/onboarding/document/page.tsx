import { getCountries } from "~/hooks/get-countries";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { DocumentForm } from "./document-form";

export default async function OnboardingDocumentPage() {
  const { t } = await getRosetta(LOCALES);
  const [state, countriesResult] = await Promise.all([getViewerOnboardingState(), getCountries()]);
  const countries = countriesResult.data?.["addressesLevel0"]?.["edges"]?.map((entry) => entry["node"]) ?? [];

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="document" title={t("title")} subtitle={t("subtitle")}>
          <DocumentForm countries={countries} />
        </StepShell>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title: "Agrega tu documento",
  subtitle: "Necesitamos el país para adaptar el tipo, formato y validación del documento. No se publica en tu perfil.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Add your document",
    subtitle:
      "We need the country to adapt the document type, format and validation. It is not published on your profile.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Adicione seu documento",
    subtitle:
      "Precisamos do país para adaptar o tipo, formato e validação do documento. Não é publicado no seu perfil.",
  } satisfies typeof LOCALE_ES,
};
