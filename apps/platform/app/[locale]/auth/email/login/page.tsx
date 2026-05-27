import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { ROSETTA } from "~/lib/i18n";
import { LoginForm } from "./login-form";

type SearchParams = Promise<{ email?: string; has_passkey?: string }>;
type Params = Promise<{ locale: string }>;

export default async function EmailLoginPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("heading")}</h2>
      <LoginForm defaultEmail={sp["email"] ?? ""} hasPasskey={sp["has_passkey"] === "1"} />
      <BackToAuthLink locale={locale} />
    </div>
  );
}

const LOCALE_ES = {
  heading: "Iniciar sesión",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Sign in",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Entrar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
