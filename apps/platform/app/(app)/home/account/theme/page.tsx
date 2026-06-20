import { ThemeToggle } from "~/components/theme-toggle";
import { getRosetta } from "~/lib/i18n.server";

export default async function AccountThemePage(props: PageProps<"/home/account/theme">) {
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

      <ThemeToggle />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Preferencias · Tema",
  heading: "Tema",
  description: "Claro, oscuro o según tu sistema. El cambio se aplica al instante.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Preferences · Theme",
  heading: "Theme",
  description: "Light, dark, or follow your system. The change applies instantly.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Preferências · Tema",
  heading: "Tema",
  description: "Claro, escuro ou conforme o seu sistema. A mudança é aplicada na hora.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
