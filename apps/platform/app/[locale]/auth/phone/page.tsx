import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
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

  const { t } = await getRosetta(LOCALES);

  const { title, subtitle } =
    exists === true
      ? { title: t("title_exists"), subtitle: t("subtitle_exists", { phone }) }
      : exists === false
        ? { title: t("title_new"), subtitle: t("subtitle_new", { phone }) }
        : { title: t("title_unknown"), subtitle: t("subtitle_unknown", { phone }) };

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl/normal font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{subtitle}</p>
          </div>
          <PhoneStepForm phone={phone} next={next} channels={channels.length > 0 ? channels : ["sms"]} />
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title_exists: "Inicia sesión",
  subtitle_exists: "Te enviaremos un código a {{phone}}.",
  title_new: "Crea tu cuenta",
  subtitle_new: "Verifica {{phone}} con un código y listo.",
  title_unknown: "Verifica tu teléfono",
  subtitle_unknown: "Te enviaremos un código a {{phone}}.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title_exists: "Sign in",
  subtitle_exists: "We'll send a code to {{phone}}.",
  title_new: "Create your account",
  subtitle_new: "Verify {{phone}} with a code and you're done.",
  title_unknown: "Verify your phone",
  subtitle_unknown: "We'll send a code to {{phone}}.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title_exists: "Iniciar sessão",
  subtitle_exists: "Enviaremos um código para {{phone}}.",
  title_new: "Crie a sua conta",
  subtitle_new: "Verifique {{phone}} com um código e pronto.",
  title_unknown: "Verifique o seu telefone",
  subtitle_unknown: "Enviaremos um código para {{phone}}.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
