import { SINGLE } from "@packages/utils/array";
import { IdentityChip } from "~/components/identity/chips";
import { AuthCard } from "../../_components/auth-card";
import { OtpEntry } from "../../_components/otp-entry";
import { StepHeader } from "../../_components/step2-shell";

export default async function EmailMagicLinkPage(props: PageProps<"/[locale]/auth/email/magic-link">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";

  const changeHref = `/${locale}/auth/email?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <StepHeader
          backHref={changeHref}
          title="Revisa tu correo"
          subtitle="Ingresa el código que te enviamos para continuar."
        />
        <IdentityChip kind="email" value={value} href={changeHref} />
        <OtpEntry channel="email" destination={value} next={next} locale={locale} />
      </div>
    </AuthCard>
  );
}
