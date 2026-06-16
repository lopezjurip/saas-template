import { Logo } from "@packages/ui-common/logo";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";

/**
 * Brand header for the auth card. `full` (default) shows brand + welcome title + tagline
 * for the /auth entry; `small` shows just the brand mark, for pages with their own heading.
 */
export async function AuthHeader({ small = false }: { small?: boolean }) {
  const { t } = await getRosetta(LOCALES);

  if (small) {
    return (
      <div className="flex justify-center">
        <Link href={ROUTE("/")} aria-label={t("home_label")}>
          <Logo />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Link href={ROUTE("/", { locale: "_" })} aria-label={t("home_label")}>
        <Logo className="text-lg" />
      </Link>
      <div>
        <h1 className={cn("m-0 text-2xl font-semibold tracking-tight")}>{t("welcome")}</h1>
        <p className="mt-1 mb-0 text-sm/normal text-muted-foreground">{t("tagline")}</p>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  home_label: "Inicio",
  welcome: "Bienvenido a SaaS Template",
  tagline: "La forma simple de gestionar a tu equipo",
};

const LOCALE_EN: typeof LOCALE_ES = {
  home_label: "Home",
  welcome: "Welcome to SaaS Template",
  tagline: "The simple way to manage your team",
};

const LOCALE_PT: typeof LOCALE_ES = {
  home_label: "Início",
  welcome: "Bem-vindo ao SaaS Template",
  tagline: "A forma simples de gerir a sua equipa",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
