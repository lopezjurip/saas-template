import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { LocaleToggle } from "~/components/locale-toggle";
import { StatusBadge } from "~/components/status-badge";
import { ThemeToggle } from "~/components/theme-toggle";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";

export default async function MarketingLayout(props: LayoutProps<"/">) {
  const { t, locale } = await getRosetta(LOCALES);
  const user = await getSupabaseServerUser();
  const year = new Date().getFullYear().toString();

  const footerColumns = [
    {
      title: t("footer.product.title"),
      links: [
        { label: t("footer.product.a"), href: ROUTE("/") },
        { label: t("footer.product.b"), href: ROUTE("/", {}, "product") },
        { label: t("footer.product.c"), href: ROUTE("/pricing") },
        { label: t("footer.product.d"), href: ROUTE("/", {}, "customers") },
      ],
    },
    {
      title: t("footer.resources.title"),
      links: [
        { label: t("footer.resources.a"), href: ROUTE("/", {}, "faq") },
        { label: t("footer.resources.b"), href: ROUTE("/", {}, "contact") },
        { label: t("footer.resources.c"), href: ROUTE("/mcp") },
        { label: t("footer.resources.d"), href: ROUTE("/") },
      ],
    },
    {
      title: t("footer.company.title"),
      links: [
        { label: t("footer.company.a"), href: ROUTE("/") },
        { label: t("footer.company.b"), href: ROUTE("/", {}, "customers") },
        { label: t("footer.company.c"), href: ROUTE("/", {}, "contact") },
        { label: t("footer.company.d"), href: ROUTE("/") },
      ],
    },
    {
      title: t("footer.legal.title"),
      links: [
        { label: t("footer.terms"), href: ROUTE("/legal/terms") },
        { label: t("footer.privacy"), href: ROUTE("/legal/privacy") },
        { label: t("footer.cookies"), href: ROUTE("/legal/cookies") },
      ],
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <div className="w-full bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-6 py-1.5 text-center text-xs font-medium">
          <Sparkles aria-hidden="true" className="hidden h-3 w-3 shrink-0 opacity-70 sm:inline-block" />
          <span className="truncate">{t("announce.message")}</span>
          <span aria-hidden="true" className="hidden opacity-40 sm:inline">
            ·
          </span>
          <Link
            href={ROUTE("/", {}, "contact")}
            className="hidden shrink-0 items-center gap-1 underline-offset-2 hover:underline sm:inline-flex"
          >
            {t("announce.cta")}
            <ArrowRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6">
          <Link
            href={ROUTE("/")}
            aria-label="SaaS Template"
            className="inline-block shrink-0 transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm lg:flex">
            <Link
              href={ROUTE("/", {}, "product")}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.product")}
            </Link>
            <Link
              href={ROUTE("/pricing")}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              href={ROUTE("/", {}, "customers")}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.customers")}
            </Link>
            <Link
              href={ROUTE("/", {}, "faq")}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.faq")}
            </Link>
            <Link
              href={ROUTE("/mcp")}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("nav.mcp")}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LocaleToggle className="hidden min-[380px]:inline-flex" />
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button asChild size="sm" className="cursor-pointer">
              <Link href={user ? ROUTE("/home") : ROUTE("/auth")}>{user ? t("cta.dashboard") : t("cta.signin")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{props.children}</div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-5">
          <div className="col-span-2 flex max-w-xs flex-col gap-3 lg:col-span-1">
            <Link
              href={ROUTE("/")}
              aria-label="SaaS Template"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Logo />
            </Link>
            <p className="text-sm/normal leading-relaxed text-muted-foreground text-pretty">{t("footer.tagline")}</p>
            <StatusBadge />
          </div>
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex min-w-0 flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{col.title}</span>
              <ul className="flex flex-col gap-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link["href"]} className="text-sm/normal text-muted-foreground hover:text-foreground">
                      {link["label"]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:gap-x-3 sm:gap-y-1.5">
            <span className="text-center sm:text-left">{t("footer.copyright", { year })}</span>
            <span aria-hidden="true" className="hidden opacity-50 sm:inline">
              ·
            </span>
            <span className="font-mono">{t("footer.compliance")}</span>
            <div className="flex items-center gap-2 sm:ml-auto">
              <LocaleToggle />
              <ThemeToggle />
            </div>
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
  "nav.mcp": "MCP",
  "cta.signin": "Ingresar",
  "cta.dashboard": "Ir al panel",
  "footer.tagline": "La plataforma SaaS lista para producción para equipos que avanzan.",
  "footer.product.title": "Producto",
  "footer.product.a": "Inicio",
  "footer.product.b": "Características",
  "footer.product.c": "Precios",
  "footer.product.d": "Clientes",
  "footer.resources.title": "Recursos",
  "footer.resources.a": "Preguntas frecuentes",
  "footer.resources.b": "Contacto",
  "footer.resources.c": "MCP para agentes",
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
  "nav.mcp": "MCP",
  "cta.signin": "Sign in",
  "cta.dashboard": "Go to dashboard",
  "footer.tagline": "The production-ready SaaS platform for teams that keep moving.",
  "footer.product.title": "Product",
  "footer.product.a": "Home",
  "footer.product.b": "Features",
  "footer.product.c": "Pricing",
  "footer.product.d": "Customers",
  "footer.resources.title": "Resources",
  "footer.resources.a": "FAQ",
  "footer.resources.b": "Contact",
  "footer.resources.c": "MCP for agents",
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
  "nav.mcp": "MCP",
  "cta.signin": "Entrar",
  "cta.dashboard": "Ir para o painel",
  "footer.tagline": "A plataforma SaaS pronta para produção para times que avançam.",
  "footer.product.title": "Produto",
  "footer.product.a": "Início",
  "footer.product.b": "Recursos",
  "footer.product.c": "Preços",
  "footer.product.d": "Clientes",
  "footer.resources.title": "Recursos",
  "footer.resources.a": "Perguntas frequentes",
  "footer.resources.b": "Contato",
  "footer.resources.c": "MCP para agentes",
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
