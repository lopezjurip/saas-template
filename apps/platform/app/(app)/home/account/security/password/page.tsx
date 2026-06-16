import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { PasswordForm } from "../password-form";

export default async function SecurityPasswordPage(props: PageProps<"/home/account/security/password">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-[0.08em] uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">
          {hasPassword ? t("description_set") : t("description_none")}
        </p>
      </header>

      <PasswordForm hasPassword={hasPassword} />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Seguridad · Contraseña",
  heading: "Contraseña",
  description_set: "Cambia tu contraseña cuando quieras. Úsala como respaldo de tus passkeys.",
  description_none: "Crea una contraseña para tener un método de respaldo además de tus passkeys.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Security · Password",
  heading: "Password",
  description_set: "Change your password whenever you want. Use it as a backup to your passkeys.",
  description_none: "Create a password to have a backup method alongside your passkeys.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Segurança · Senha",
  heading: "Senha",
  description_set: "Altere sua senha quando quiser. Use-a como backup das suas passkeys.",
  description_none: "Crie uma senha para ter um método de backup além das suas passkeys.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
