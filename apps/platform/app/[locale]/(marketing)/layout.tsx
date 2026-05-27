import { RosettaImpl } from "@packages/rosetta/rosetta";
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

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

const LOCALES = {
  es: LOCALE_ES,
  en: {
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "cta.signin": "Sign in",
    "cta.dashboard": "Go to dashboard",
    "footer.copyright": "© {{year}} Humane. All rights reserved.",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.cookies": "Cookies",
  } satisfies typeof LOCALE_ES,
  pt: {
    "nav.pricing": "Preços",
    "nav.faq": "Perguntas frequentes",
    "cta.signin": "Entrar",
    "cta.dashboard": "Ir para o painel",
    "footer.copyright": "© {{year}} Humane. Todos os direitos reservados.",
    "footer.terms": "Termos",
    "footer.privacy": "Privacidade",
    "footer.cookies": "Cookies",
  } satisfies typeof LOCALE_ES,
};

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
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
          <div className="ml-auto flex items-center pr-28">
            <Button asChild size="sm">
              <Link href={user ? `/${locale}/dashboard` : `/${locale}/auth`}>
                {user ? t("cta.dashboard") : t("cta.signin")}
              </Link>
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
