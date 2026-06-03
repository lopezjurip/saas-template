import { SINGLE } from "@packages/utils/array";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { DocumentStepForm } from "./document-step-form";

export default async function AuthDocumentPage(props: PageProps<"/[locale]/auth/document">) {
  const sp = await props.searchParams;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-foreground">Identifícate</h1>
            <p className="m-0 text-[13px] leading-normal text-muted-foreground text-pretty">
              Usaremos tu documento para encontrar tu cuenta o invitación. Te enviaremos un código a tu canal de
              contacto.
            </p>
          </div>
          <DocumentStepForm value={value} next={next} />
        </div>
      </div>
    </AuthCard>
  );
}
