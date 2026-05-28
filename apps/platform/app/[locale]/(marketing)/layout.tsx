import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import Link from "next/link";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
import { ROSETTA } from "~/lib/i18n";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const user = await getSupabaseServerUser();
  const year = new Date().getFullYear().toString();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
          <Link href={`/${locale}`} aria-label="Humane" className="inline-block transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/${locale}/pricing`} className="text-muted-foreground hover:text-foreground">
              {t("nav.pricing")}
            </Link>
            <Link href={`/${locale}/faq`} className="text-muted-foreground hover:text-foreground">
              {t("nav.faq")}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
            <Button asChild size="sm" className="cursor-pointer">
              <a href={user ? `/${locale}/home` : `/${locale}/auth`}>{user ? t("cta.dashboard") : t("cta.signin")}</a>
            </Button>
          </div>
        </div>
        <Separator />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t("footer.copyright", { year })}</p>
          <nav className="flex items-center gap-4">
            <Link href={`/${locale}/legal/terms`} className="hover:text-foreground">
              {t("footer.terms")}
            </Link>
            <Link href={`/${locale}/legal/privacy`} className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link href={`/${locale}/legal/cookies`} className="hover:text-foreground">
              {t("footer.cookies")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const LOCALE_ES = {
  "nav.pricing": "Precios",
  "nav.faq": "Preguntas frecuentes",
  "cta.signin": "Ingresar",
  "cta.dashboard": "Ir al panel",
  "footer.copyright": "© {{year}} Humane. Todos los derechos reservados.",
  "footer.terms": "Términos",
  "footer.privacy": "Privacidad",
  "footer.cookies": "Cookies",
};

const LOCALE_EN: typeof LOCALE_ES = {
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "cta.signin": "Sign in",
  "cta.dashboard": "Go to dashboard",
  "footer.copyright": "© {{year}} Humane. All rights reserved.",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.cookies": "Cookies",
};

const LOCALE_PT: typeof LOCALE_ES = {
  "nav.pricing": "Preços",
  "nav.faq": "Perguntas frequentes",
  "cta.signin": "Entrar",
  "cta.dashboard": "Ir para o painel",
  "footer.copyright": "© {{year}} Humane. Todos os direitos reservados.",
  "footer.terms": "Termos",
  "footer.privacy": "Privacidade",
  "footer.cookies": "Cookies",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
