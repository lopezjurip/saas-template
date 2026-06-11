import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { PhoneStepForm } from "./phone-step-form";

type Channel = "sms" | "whatsapp";

export default async function AuthPhonePage(props: PageProps<"/[locale]/auth/phone">) {
  const sp = await props.searchParams;
  const phone = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  const errorCode = SINGLE(sp["error"]);

  if (errorCode === "invalid_phone" || !phone) {
    redirect(`/[locale]/auth?error=invalid_phone&next=${encodeURIComponent(next)}`);
  }

  const channels = (SINGLE(sp["channels"]) ?? "sms,whatsapp")
    .split(",")
    .filter((c: string): c is Channel => c === "sms" || c === "whatsapp");
  const existsParam = SINGLE(sp["exists"]);
  const exists = existsParam === "1" ? true : existsParam === "0" ? false : null;

  const { title, subtitle } =
    exists === true
      ? { title: "Inicia sesión", subtitle: <>Te enviaremos un código a {phone}.</> }
      : exists === false
        ? { title: "Crea tu cuenta", subtitle: <>Verifica {phone} con un código y listo.</> }
        : { title: "Verifica tu teléfono", subtitle: <>Te enviaremos un código a {phone}.</> };

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
          <PhoneStepForm phone={phone} next={next} channels={channels.length > 0 ? channels : ["sms"]} />
        </div>
      </div>
    </AuthCard>
  );
}
