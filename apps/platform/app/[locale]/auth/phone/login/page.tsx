import { SINGLE } from "@packages/utils/array";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { StepHeader } from "~/app/[locale]/auth/_components/step2-shell";
import { IdentityChip } from "~/components/identity/chips";
import { LoginForm } from "./login-form";

export default async function PhoneLoginPage(props: PageProps<"/[locale]/auth/phone/login">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const phone = SINGLE(sp["phone"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepHeader backHref={`/${locale}/auth`} title="Iniciar sesión" subtitle="Elige cómo quieres continuar" />
        {phone && (
          <IdentityChip kind="phone" value={phone} href={`/${locale}/auth/phone?next=${encodeURIComponent(next)}`} />
        )}
        <LoginForm defaultPhone={phone} />
        <BackToAuthLink locale={locale} />
      </div>
    </AuthCard>
  );
}
