import { SINGLE } from "@packages/utils/array";
import { getRosetta } from "~/hooks/get-rosetta";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { DocumentStepForm } from "./document-step-form";

export default async function AuthDocumentPage(props: PageProps<"/[locale]/auth/document">) {
  const sp = await props.searchParams;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";

  const { t } = await getRosetta(LOCALES);

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl/normal font-semibold tracking-[-0.02em] text-foreground">{t("heading")}</h1>
            <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{t("body")}</p>
          </div>
          <DocumentStepForm value={value} next={next} />
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading: "Identifícate",
  body: "Usaremos tu documento para encontrar tu cuenta o invitación. Te enviaremos un código a tu canal de contacto.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Identify yourself",
  body: "We'll use your document to find your account or invitation. We'll send a code to your contact channel.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Identifique-se",
  body: "Usaremos o seu documento para encontrar a sua conta ou convite. Enviaremos um código para o seu canal de contacto.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
