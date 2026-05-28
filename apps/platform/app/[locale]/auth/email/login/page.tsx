import { SINGLE } from "@packages/utils/array";
import { IdentityChip } from "~/components/identity/chips";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepHeader } from "../../_components/step2-shell";
import { LoginForm } from "./login-form";

export default async function EmailLoginPage(props: PageProps<"/[locale]/auth/email/login">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const email = SINGLE(sp["email"]) ?? "";
  const hasPasskey = SINGLE(sp["has_passkey"]) === "1";
  const next = SINGLE(sp["next"]) ?? "/";
  const changeHref = `/${locale}/auth/email${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepHeader backHref={`/${locale}/auth`} title="Iniciar sesión" subtitle="Elige cómo quieres continuar" />
        <IdentityChip kind="email" value={email} href={changeHref} />
        <LoginForm defaultEmail={email} hasPasskey={hasPasskey} />
      </div>
    </AuthCard>
  );
}
