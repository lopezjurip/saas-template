"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { useTheme } from "next-themes";
import { useRosetta } from "~/lib/i18n.client";

export default function AccountThemePage() {
  const { t } = useRosetta(LOCALES);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-widest uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <Select value={theme ?? "system"} onValueChange={setTheme}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{t("light")}</SelectItem>
          <SelectItem value="system">{t("system")}</SelectItem>
          <SelectItem value="dark">{t("dark")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Preferencias · Tema",
  heading: "Tema",
  description: "Claro, oscuro o según tu sistema. El cambio se aplica al instante.",
  light: "Claro",
  system: "Sistema",
  dark: "Oscuro",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    breadcrumb: "Preferences · Theme",
    heading: "Theme",
    description: "Light, dark, or follow your system. The change applies instantly.",
    light: "Light",
    system: "System",
    dark: "Dark",
  } satisfies typeof LOCALE_ES,
  pt: {
    breadcrumb: "Preferências · Tema",
    heading: "Tema",
    description: "Claro, escuro ou conforme o seu sistema. A mudança é aplicada na hora.",
    light: "Claro",
    system: "Sistema",
    dark: "Escuro",
  } satisfies typeof LOCALE_ES,
};
