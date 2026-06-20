import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { PhoneForm } from "../phone-form";

export default async function SecurityPhonePage(props: PageProps<"/home/account/security/phone">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-widest uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <PhoneForm currentPhone={user["phone"] ? `+${user["phone"]}` : null} />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Seguridad · Teléfono",
  heading: "Teléfono",
  description: "Verifica tu teléfono para recibir códigos por SMS y recuperar tu cuenta.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Security · Phone",
  heading: "Phone",
  description: "Verify your phone to receive SMS codes and recover your account.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Segurança · Telefone",
  heading: "Telefone",
  description: "Verifique seu telefone para receber códigos por SMS e recuperar sua conta.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
