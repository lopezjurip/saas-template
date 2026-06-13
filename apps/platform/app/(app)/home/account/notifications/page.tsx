import { getRosetta } from "~/lib/i18n.server";
import { ContactsManage } from "./contacts-manage";
import { NotificationsMatrix } from "./notifications-matrix";
import { PushPermission } from "./push-permission";

export default async function NotificationsPage() {
  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>
      <NotificationsMatrix />
      <ContactsManage />
      <PushPermission />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Preferencias · Notificaciones",
  heading: "Notificaciones",
  description:
    "Las alertas de seguridad llegan siempre. Todo lo demás lo decides tú. Estas preferencias aplican a tu cuenta personal — cada organización tiene las suyas.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Preferences · Notifications",
  heading: "Notifications",
  description:
    "Security alerts always come through. Everything else is up to you. These preferences apply to your personal account — each organization has its own.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Preferências · Notificações",
  heading: "Notificações",
  description:
    "Os alertas de segurança chegam sempre. Todo o resto você decide. Estas preferências se aplicam à sua conta pessoal — cada organização tem as suas.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
