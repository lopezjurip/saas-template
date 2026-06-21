"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES, type SupportedLocale } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";

export default function AccountLanguagePage() {
  const { t } = useRosetta(LOCALES);
  const [current, setLocale] = useLocaleCookie();

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-widest uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <Select value={current} onValueChange={(v) => setLocale(v as SupportedLocale)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LOCALES.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {LOCALE_LABEL[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Preferencias · Idioma",
  heading: "Idioma",
  description: "Elige el idioma de la interfaz. Se aplica de inmediato en todos tus dispositivos.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    breadcrumb: "Preferences · Language",
    heading: "Language",
    description: "Choose the interface language. It applies right away across your devices.",
  } satisfies typeof LOCALE_ES,
  pt: {
    breadcrumb: "Preferências · Idioma",
    heading: "Idioma",
    description: "Escolha o idioma da interface. É aplicado imediatamente em todos os seus dispositivos.",
  } satisfies typeof LOCALE_ES,
};
