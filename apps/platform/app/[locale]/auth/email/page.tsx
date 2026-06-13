import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
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

  const { t } = await getRosetta(LOCALES);

  const { title, subtitle } =
    exists === true
      ? { title: t("title_exists"), subtitle: t("subtitle_exists", { email }) }
      : exists === false
        ? { title: t("title_new"), subtitle: t("subtitle_new", { email }) }
        : { title: t("title_unknown"), subtitle: t("subtitle_unknown", { email }) };

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
          <EmailStepForm email={email} next={next} exists={exists} hasPasskey={hasPasskey} hasPassword={hasPassword} />
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  title_exists: "Inicia sesión",
  subtitle_exists: "Continúa con tu cuenta de {{email}}.",
  title_new: "Crea tu cuenta",
  subtitle_new: "No encontramos una cuenta con {{email}}. Te la creamos en un paso.",
  title_unknown: "Continúa con tu correo",
  subtitle_unknown: "Usaremos {{email}} para identificarte.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title_exists: "Sign in",
  subtitle_exists: "Continue with your account for {{email}}.",
  title_new: "Create your account",
  subtitle_new: "We didn't find an account for {{email}}. We'll create one in a single step.",
  title_unknown: "Continue with your email",
  subtitle_unknown: "We'll use {{email}} to identify you.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title_exists: "Iniciar sessão",
  subtitle_exists: "Continue com a sua conta de {{email}}.",
  title_new: "Crie a sua conta",
  subtitle_new: "Não encontramos uma conta com {{email}}. Criamo-la num passo.",
  title_unknown: "Continue com o seu e-mail",
  subtitle_unknown: "Usaremos {{email}} para o identificar.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
