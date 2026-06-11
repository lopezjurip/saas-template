import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
import { getRosetta } from "~/hooks/get-rosetta";

export default async function MarketingLayout(props: LayoutProps<"/[locale]">) {
  const { t, locale } = await getRosetta(LOCALES);
  const user = await getSupabaseServerUser();
  const year = new Date().getFullYear().toString();

  const footerColumns = [
    {
      title: t("footer.product.title"),
      links: [
        { label: t("footer.product.a"), href: `/${locale}` },
        { label: t("footer.product.b"), href: `/${locale}#product` },
        { label: t("footer.product.c"), href: `/${locale}/pricing` },
        { label: t("footer.product.d"), href: `/${locale}#customers` },
      ],
    },
    {
      title: t("footer.resources.title"),
      links: [
        { label: t("footer.resources.a"), href: `/${locale}#faq` },
        { label: t("footer.resources.b"), href: `/${locale}#contact` },
        { label: t("footer.resources.c"), href: `/${locale}` },
        { label: t("footer.resources.d"), href: `/${locale}` },
      ],
    },
    {
      title: t("footer.company.title"),
      links: [
        { label: t("footer.company.a"), href: `/${locale}` },
        { label: t("footer.company.b"), href: `/${locale}#customers` },
        { label: t("footer.company.c"), href: `/${locale}#contact` },
        { label: t("footer.company.d"), href: `/${locale}` },
      ],
    },
    {
      title: t("footer.legal.title"),
      links: [
        { label: t("footer.terms"), href: `/${locale}/legal/terms` },
        { label: t("footer.privacy"), href: `/${locale}/legal/privacy` },
        { label: t("footer.cookies"), href: `/${locale}/legal/cookies` },
      ],
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <div className="w-full bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-6 py-1.5 text-center text-[11.5px] font-medium tracking-[0.01em]">
          <Sparkles aria-hidden="true" className="hidden h-3 w-3 shrink-0 opacity-70 sm:inline-block" />
          <span className="truncate">{t("announce.message")}</span>
          <span aria-hidden="true" className="hidden opacity-40 sm:inline">
            ·
          </span>
          <Link
            href={`/${locale}#contact`}
            className="hidden shrink-0 items-center gap-1 underline-offset-2 hover:underline sm:inline-flex"
          >
            {t("announce.cta")}
            <ArrowRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3">
          <Link
            href={`/${locale}`}
            aria-label="SaaS Template"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href={`/${locale}#product`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.product")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              href={`/${locale}#customers`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.customers")}
            </Link>
            <Link
              href={`/${locale}#faq`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.faq")}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <LocaleToggle />
            </div>
            <ThemeToggle />
            <Button asChild size="sm" className="cursor-pointer">
              <a href={user ? `/${locale}/home` : `/${locale}/auth`}>{user ? t("cta.dashboard") : t("cta.signin")}</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{props.children}</div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex max-w-xs flex-col gap-3 lg:col-span-1">
            <Link
              href={`/${locale}`}
              aria-label="SaaS Template"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Logo />
            </Link>
            <p className="text-[13px] leading-relaxed text-muted-foreground text-pretty">{t("footer.tagline")}</p>
            <Badge variant="outline" className="mt-1 w-fit gap-1.5 rounded-full font-normal text-muted-foreground">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("footer.status")}
            </Badge>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex min-w-0 flex-col gap-2.5">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-foreground">
                {col.title}
              </span>
              <ul className="flex flex-col gap-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href as Route} className="text-[13px] text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-1.5 px-6 py-4 text-[11.5px] text-muted-foreground">
            <span>{t("footer.copyright", { year })}</span>
            <span aria-hidden="true" className="hidden opacity-50 sm:inline">
              ·
            </span>
            <span className="font-mono">{t("footer.compliance")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const LOCALE_ES = {
  "announce.message": "SaaS Template 2.0 ya está disponible para nuevos equipos",
  "announce.cta": "Conócelo",
  "nav.product": "Producto",
  "nav.pricing": "Precios",
  "nav.customers": "Clientes",
  "nav.faq": "Preguntas frecuentes",
  "cta.signin": "Ingresar",
  "cta.dashboard": "Ir al panel",
  "footer.tagline": "La plataforma SaaS lista para producción para equipos que avanzan.",
  "footer.status": "Todo operativo",
  "footer.product.title": "Producto",
  "footer.product.a": "Inicio",
  "footer.product.b": "Características",
  "footer.product.c": "Precios",
  "footer.product.d": "Clientes",
  "footer.resources.title": "Recursos",
  "footer.resources.a": "Preguntas frecuentes",
  "footer.resources.b": "Contacto",
  "footer.resources.c": "Guías",
  "footer.resources.d": "Estado",
  "footer.company.title": "Empresa",
  "footer.company.a": "Sobre nosotros",
  "footer.company.b": "Clientes",
  "footer.company.c": "Contacto",
  "footer.company.d": "Prensa",
  "footer.legal.title": "Legal",
  "footer.terms": "Términos",
  "footer.privacy": "Privacidad",
  "footer.cookies": "Cookies",
  "footer.copyright": "© {{year}} SaaS Template. Todos los derechos reservados.",
  "footer.compliance": "SOC 2 · GDPR · ISO 27001",
};

const LOCALE_EN: typeof LOCALE_ES = {
  "announce.message": "SaaS Template 2.0 is now available for new teams",
  "announce.cta": "Discover it",
  "nav.product": "Product",
  "nav.pricing": "Pricing",
  "nav.customers": "Customers",
  "nav.faq": "FAQ",
  "cta.signin": "Sign in",
  "cta.dashboard": "Go to dashboard",
  "footer.tagline": "The production-ready SaaS platform for teams that keep moving.",
  "footer.status": "All systems normal",
  "footer.product.title": "Product",
  "footer.product.a": "Home",
  "footer.product.b": "Features",
  "footer.product.c": "Pricing",
  "footer.product.d": "Customers",
  "footer.resources.title": "Resources",
  "footer.resources.a": "FAQ",
  "footer.resources.b": "Contact",
  "footer.resources.c": "Guides",
  "footer.resources.d": "Status",
  "footer.company.title": "Company",
  "footer.company.a": "About",
  "footer.company.b": "Customers",
  "footer.company.c": "Contact",
  "footer.company.d": "Press",
  "footer.legal.title": "Legal",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.cookies": "Cookies",
  "footer.copyright": "© {{year}} SaaS Template. All rights reserved.",
  "footer.compliance": "SOC 2 · GDPR · ISO 27001",
};

const LOCALE_PT: typeof LOCALE_ES = {
  "announce.message": "O SaaS Template 2.0 já está disponível para novos times",
  "announce.cta": "Conheça",
  "nav.product": "Produto",
  "nav.pricing": "Preços",
  "nav.customers": "Clientes",
  "nav.faq": "Perguntas frequentes",
  "cta.signin": "Entrar",
  "cta.dashboard": "Ir para o painel",
  "footer.tagline": "A plataforma SaaS pronta para produção para times que avançam.",
  "footer.status": "Tudo operacional",
  "footer.product.title": "Produto",
  "footer.product.a": "Início",
  "footer.product.b": "Recursos",
  "footer.product.c": "Preços",
  "footer.product.d": "Clientes",
  "footer.resources.title": "Recursos",
  "footer.resources.a": "Perguntas frequentes",
  "footer.resources.b": "Contato",
  "footer.resources.c": "Guias",
  "footer.resources.d": "Status",
  "footer.company.title": "Empresa",
  "footer.company.a": "Sobre nós",
  "footer.company.b": "Clientes",
  "footer.company.c": "Contato",
  "footer.company.d": "Imprensa",
  "footer.legal.title": "Legal",
  "footer.terms": "Termos",
  "footer.privacy": "Privacidade",
  "footer.cookies": "Cookies",
  "footer.copyright": "© {{year}} SaaS Template. Todos os direitos reservados.",
  "footer.compliance": "SOC 2 · GDPR · ISO 27001",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
