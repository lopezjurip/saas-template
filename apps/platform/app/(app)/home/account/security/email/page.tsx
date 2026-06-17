import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { EmailForm } from "../email-form";

export default async function SecurityEmailPage(props: PageProps<"/home/account/security/email">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-[0.08em] uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <EmailForm currentEmail={user["email"] ?? null} />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Seguridad · Correo",
  heading: "Correo",
  description: "Tu correo verificado sirve para recuperar tu cuenta y recibir códigos de seguridad.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Security · Email",
  heading: "Email",
  description: "Your verified email is used to recover your account and receive security codes.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Segurança · E-mail",
  heading: "E-mail",
  description: "Seu e-mail verificado serve para recuperar sua conta e receber códigos de segurança.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
