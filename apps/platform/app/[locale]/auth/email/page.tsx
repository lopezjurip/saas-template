import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { EmailStepForm } from "./email-step-form";

export default async function AuthEmailPage(props: PageProps<"/[locale]/auth/email">) {
  const sp = await props.searchParams;
  const email = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  const errorCode = SINGLE(sp["error"]);

  // Invalid/empty value or arriving without a value → bounce to the entry.
  if (errorCode === "invalid_email" || !email) {
    redirect(`/[locale]/auth?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  const existsParam = SINGLE(sp["exists"]);
  const exists = existsParam === "1" ? true : existsParam === "0" ? false : null;
  const hasPasskey = SINGLE(sp["has_passkey"]) === "1";
  const hasPassword = SINGLE(sp["has_password"]) === "1";

  const { title, subtitle } =
    exists === true
      ? { title: "Inicia sesión", subtitle: <>Continúa con tu cuenta de {email}.</> }
      : exists === false
        ? { title: "Crea tu cuenta", subtitle: <>No encontramos una cuenta con {email}. Te la creamos en un paso.</> }
        : { title: "Continúa con tu correo", subtitle: <>Usaremos {email} para identificarte.</> };

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl/normal font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
            <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{subtitle}</p>
          </div>
          <EmailStepForm email={email} next={next} exists={exists} hasPasskey={hasPasskey} hasPassword={hasPassword} />
        </div>
      </div>
    </AuthCard>
  );
}
