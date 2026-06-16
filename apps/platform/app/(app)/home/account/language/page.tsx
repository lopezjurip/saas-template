import { LocaleToggle } from "~/components/locale-toggle";
import { getRosetta } from "~/lib/i18n.server";

export default async function AccountLanguagePage(props: PageProps<"/home/account/language">) {
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

      <LocaleToggle />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Preferencias · Idioma",
  heading: "Idioma",
  description: "Elige el idioma de la interfaz. Se aplica de inmediato en todos tus dispositivos.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Preferences · Language",
  heading: "Language",
  description: "Choose the interface language. It applies right away across your devices.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Preferências · Idioma",
  heading: "Idioma",
  description: "Escolha o idioma da interface. É aplicado imediatamente em todos os seus dispositivos.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
