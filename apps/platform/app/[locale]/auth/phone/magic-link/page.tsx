import { SINGLE } from "@packages/utils/array";
import { IdentityChip } from "~/components/identity/chips";
import { AuthCard } from "../../_components/auth-card";
import { type OtpChannel, OtpEntry } from "../../_components/otp-entry";
import { StepHeader } from "../../_components/step2-shell";

export default async function PhoneMagicLinkPage(props: PageProps<"/[locale]/auth/phone/magic-link">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  const channel: OtpChannel = SINGLE(sp["channel"]) === "whatsapp" ? "whatsapp" : "sms";

  const changeHref = `/${locale}/auth/phone?next=${encodeURIComponent(next)}`;
  const title = channel === "whatsapp" ? "Revisa WhatsApp" : "Revisa tus mensajes";

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <StepHeader backHref={changeHref} title={title} subtitle="Ingresa el código que te enviamos para continuar." />
        <IdentityChip kind="phone" value={value} href={changeHref} />
        <OtpEntry channel={channel} destination={value} next={next} locale={locale} />
      </div>
    </AuthCard>
  );
}
