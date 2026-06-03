import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { AuthBackLink } from "../../_components/auth-back-link";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { AcceptSignupForm } from "./accept-signup-form";

export default async function AuthDocumentAcceptPage(props: PageProps<"/[locale]/auth/document/accept">) {
  const sp = await props.searchParams;
  const token = SINGLE(sp["token"]) ?? "";

  if (!token) {
    redirect("/[locale]/auth");
  }

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-foreground">Tienes una invitación</h1>
            <p className="m-0 text-[13px] leading-normal text-muted-foreground text-pretty">
              Completa tus datos para crear tu cuenta y unirte. Verificamos con un código de un solo uso.
            </p>
          </div>
          <AcceptSignupForm token={token} />
        </div>
      </div>
    </AuthCard>
  );
}
