import { getSupabaseServerUser } from "@packages/supabase/client.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui-common/shadcn/components/ui/accordion";
import { Avatar, AvatarFallback } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { INITIALS_OF } from "@packages/utils/string";
import { URL_NEW } from "@packages/utils/url";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Organization, WebSite, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/lib/i18n";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { ContactBooking } from "./contact-booking";

export async function generateMetadata(props: PageProps<"/[locale]">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: URL_NEW("/[locale]", APP_URL, { replace: { locale } }).href,
      languages: {
        ...Object.fromEntries(
          SUPPORTED_LOCALES.map((l) => [l, URL_NEW("/[locale]", APP_URL, { replace: { locale: l } }).href]),
        ),
        "x-default": URL_NEW("/[locale]", APP_URL, { replace: { locale: DEFAULT_LOCALE } }).href,
      },
    },
    openGraph: {
      type: "website",
      url: URL_NEW("/[locale]", APP_URL, { replace: { locale } }).href,
      locale: locale,
      title: t("title"),
      description: t("description"),
      siteName: "SaaS Template",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

const LOGOS = ["Northwind", "Helia", "Vega Labs", "Quanta", "Lumens", "Brightside"];

export default async function HomePage(props: PageProps<"/[locale]">) {
  const { t, locale } = await getRosetta(LOCALES);

  const user = await getSupabaseServerUser();

  const ctaHref = user ? ROUTE("/[locale]/home", { locale }) : ROUTE("/[locale]/auth", { locale });
  const ctaLabel = user ? t("cta.dashboard") : t("cta.signin");

  const mockSteps = [t("mock.step.1"), t("mock.step.2"), t("mock.step.3"), t("mock.step.4")];

  const stats = [
    { kpi: t("stats.a.kpi"), unit: t("stats.a.unit"), label: t("stats.a.label"), foot: t("stats.a.foot") },
    { kpi: t("stats.b.kpi"), unit: t("stats.b.unit"), label: t("stats.b.label"), foot: t("stats.b.foot") },
    { kpi: t("stats.c.kpi"), unit: t("stats.c.unit"), label: t("stats.c.label"), foot: t("stats.c.foot") },
    { kpi: t("stats.d.kpi"), unit: t("stats.d.unit"), label: t("stats.d.label"), foot: t("stats.d.foot") },
  ];

  const testimonials = [
    { quote: t("testimonials.a.quote"), name: t("testimonials.a.name"), role: t("testimonials.a.role") },
    { quote: t("testimonials.b.quote"), name: t("testimonials.b.name"), role: t("testimonials.b.role") },
    { quote: t("testimonials.c.quote"), name: t("testimonials.c.name"), role: t("testimonials.c.role") },
  ];

  const faqs = [
    { value: "a", q: t("faq.a.q"), a: t("faq.a.a") },
    { value: "b", q: t("faq.b.q"), a: t("faq.b.a") },
    { value: "c", q: t("faq.c.q"), a: t("faq.c.a") },
    { value: "d", q: t("faq.d.q"), a: t("faq.d.a") },
    { value: "e", q: t("faq.e.q"), a: t("faq.e.a") },
  ];

  const contactBullets = [t("contact.bullet.a"), t("contact.bullet.b"), t("contact.bullet.c")];

  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": URL_NEW("/[locale]#website", APP_URL, { replace: { locale } }).href,
    url: URL_NEW("/[locale]", APP_URL, { replace: { locale } }).href,
    inLanguage: locale,
  };

  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${APP_URL.origin}#organization`,
    url: APP_URL.origin,
    name: "SaaS Template",
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <main className="flex-1">
        <section id="product" className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--muted),transparent_70%)]"
          />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-16 pt-12 text-center sm:gap-7 sm:pb-20 sm:pt-16">
            <Badge variant="outline" className="gap-1.5 rounded-full bg-background/80 py-1 font-normal">
              <Sparkles aria-hidden="true" className="h-3 w-3" />
              {t("hero.tag")}
            </Badge>
            <h1 className="max-w-[18ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title1")} <span className="text-muted-foreground">{t("hero.title2")}</span>
            </h1>
            <p className="max-w-[58ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="flex w-full max-w-xs flex-col items-stretch justify-center gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="cursor-pointer">
                <Link href={ROUTE("/[locale]", { locale }, "contact")}>{t("hero.secondary")}</Link>
              </Button>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{t("hero.trust")}</p>

            <div className="mt-4 w-full sm:mt-8">
              <Card className="mx-auto max-w-4xl overflow-hidden text-left shadow-lg">
                <CardContent className="grid gap-3 p-4 md:grid-cols-[1.15fr_1fr]">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <span className="truncate text-xs font-medium">{t("mock.agent")}</span>
                      </span>
                      <span className="hidden font-mono text-tiny text-muted-foreground sm:inline">
                        saas-template/app
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2.5">
                      <span className="text-tiny font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {t("mock.taskLabel")}
                      </span>
                      <span className="text-sm/normal leading-snug">{t("mock.task")}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-tiny font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {t("mock.stepsLabel")}
                      </span>
                      <ol className="flex flex-col gap-1.5">
                        {mockSteps.map((step, index) => (
                          <li key={step} className="flex items-center gap-2 text-xs">
                            <span
                              className={
                                index < 3
                                  ? "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                                  : "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"
                              }
                            >
                              {index < 3 ? (
                                <Check aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={3} />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                                />
                              )}
                            </span>
                            <span className={index === 3 ? "text-muted-foreground" : undefined}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-md border border-border bg-background">
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <span className="text-xs font-medium">{t("mock.replyLabel")}</span>
                      <span className="font-mono text-tiny text-muted-foreground">draft · v2</span>
                    </div>
                    <p className="flex-1 px-3 py-2.5 text-xs leading-relaxed">{t("mock.reply")}</p>
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/30 px-3 py-2">
                      <Button size="sm" className="h-7 cursor-pointer px-2.5 text-xs">
                        <Check aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
                        {t("mock.send")}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 cursor-pointer px-2.5 text-xs">
                        {t("mock.edit")}
                      </Button>
                      <span className="ml-auto font-mono text-tiny text-muted-foreground">320 ms · $0.0021</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="customers" className="border-y border-border bg-muted/25">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:py-12">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t("social.title")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
              {LOGOS.map((name) => (
                <span key={name} className="inline-flex items-center gap-2 px-2 text-muted-foreground/85">
                  <span aria-hidden="true" className="h-4 w-4 rounded-sm border-[1.5px] border-current opacity-70" />
                  <span className="text-sm font-semibold tracking-tight">{name}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div className="flex max-w-[44ch] flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("stats.caption")}
              </span>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t("stats.title")}</h2>
              <p className="text-pretty text-sm text-muted-foreground">{t("stats.subtitle")}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs text-muted-foreground">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 bg-background px-5 py-6">
                <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl">
                  {stat.kpi}
                  <span className="text-muted-foreground">{stat.unit}</span>
                </span>
                <span className="text-pretty text-sm">{stat.label}</span>
                <span className="mt-1 font-mono text-xs text-muted-foreground">{stat.foot}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="mb-8 flex max-w-[44ch] flex-col gap-2 sm:mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t("testimonials.tag")}
            </span>
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="h-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <blockquote className="text-pretty text-sm leading-snug">{`"${item.quote}"`}</blockquote>
                  <figcaption className="mt-auto flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm/normal font-semibold">{INITIALS_OF(item.name)}</AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.role}</span>
                    </span>
                  </figcaption>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.4fr] lg:gap-10">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("faq.tag")}
              </span>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t("faq.title")}</h2>
              <p className="max-w-[40ch] text-pretty text-sm text-muted-foreground">{t("faq.subtitle")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 sm:px-5">
              <Accordion type="single" collapsible defaultValue="a">
                {faqs.map((faq) => {
                  return (
                    <AccordionItem key={faq.value} value={faq.value}>
                      <AccordionTrigger className="text-sm">{faq.q}</AccordionTrigger>
                      <AccordionContent className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <Card>
            <CardContent className="grid items-start gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.05fr] md:gap-10 lg:p-10">
              <div className="flex min-w-0 flex-col gap-5">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t("contact.tag")}
                </span>
                <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t("contact.title")}</h2>
                <p className="max-w-[44ch] text-pretty leading-relaxed text-muted-foreground">
                  {t("contact.subtitle")}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {contactBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                        <Check aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-pretty">{bullet}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-xs text-muted-foreground">{t("contact.nospam")}</p>
              </div>
              <ContactBooking
                locale={locale}
                labels={{
                  week: t("contact.week"),
                  timezone: t("contact.timezone"),
                  book: t("contact.book"),
                  write: t("contact.write"),
                }}
                days={[
                  t("contact.day.mon"),
                  t("contact.day.tue"),
                  t("contact.day.wed"),
                  t("contact.day.thu"),
                  t("contact.day.fri"),
                ]}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

const LOCALE_ES = {
  title: "SaaS Template",
  description: "Plantilla SaaS lista para producción",
  "cta.signin": "Ingresar",
  "cta.dashboard": "Ir al panel",
  "hero.tag": "Plataforma SaaS multi-tenant",
  "hero.title1": "Lorem ipsum dolor sit amet,",
  "hero.title2": "consectetur adipiscing elit sed do.",
  "hero.subtitle":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "hero.secondary": "Agendar demo",
  "hero.trust": "Sin tarjeta · 14 días de prueba",
  "mock.agent": "Asistente · SaaS Template",
  "mock.taskLabel": "Tarea actual",
  "mock.task": "Lorem ipsum dolor sit amet consectetur.",
  "mock.stepsLabel": "Pasos",
  "mock.step.1": "Lorem ipsum dolor sit",
  "mock.step.2": "Consectetur adipiscing elit",
  "mock.step.3": "Sed do eiusmod tempor",
  "mock.step.4": "Incididunt ut labore",
  "mock.replyLabel": "Respuesta lista",
  "mock.reply":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.",
  "mock.send": "Enviar",
  "mock.edit": "Editar",
  "social.title": "Equipos en crecimiento confían en SaaS Template",
  "stats.caption": "Actualizado hace 2 min",
  "stats.title": "Lorem ipsum dolor sit amet",
  "stats.subtitle": "Lorem ipsum dolor sit amet consectetur.",
  "stats.a.kpi": "12.400",
  "stats.a.unit": "+",
  "stats.a.label": "equipos activos",
  "stats.a.foot": "+38 % anual",
  "stats.b.kpi": "1,2",
  "stats.b.unit": "M",
  "stats.b.label": "liquidaciones / mes",
  "stats.b.foot": "p99 320 ms",
  "stats.c.kpi": "99,99",
  "stats.c.unit": "%",
  "stats.c.label": "SLA en producción",
  "stats.c.foot": "12 meses",
  "stats.d.kpi": "27",
  "stats.d.unit": "",
  "stats.d.label": "integraciones",
  "stats.d.foot": "y creciendo",
  "testimonials.tag": "Clientes",
  "testimonials.title": "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  "testimonials.a.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.a.name": "María Salinas",
  "testimonials.a.role": "Gerenta de Operaciones · Northwind",
  "testimonials.b.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.b.name": "Diego Araya",
  "testimonials.b.role": "Jefe de Plataforma · Helia",
  "testimonials.c.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.c.name": "Camila Souza",
  "testimonials.c.role": "Contadora · Quanta",
  "faq.tag": "Preguntas frecuentes",
  "faq.title": "Preguntas que casi todos nos hacen.",
  "faq.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "faq.a.q": "Lorem ipsum dolor sit amet?",
  "faq.a.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.b.q": "Consectetur adipiscing elit?",
  "faq.b.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.c.q": "Sed do eiusmod tempor?",
  "faq.c.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.d.q": "Incididunt ut labore et dolore?",
  "faq.d.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.e.q": "Magna aliqua ut enim?",
  "faq.e.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "contact.tag": "Hablemos",
  "contact.title": "Una llamada de 25 minutos.",
  "contact.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
  "contact.bullet.a": "Lorem ipsum dolor sit amet",
  "contact.bullet.b": "Consectetur adipiscing elit",
  "contact.bullet.c": "Sed do eiusmod tempor",
  "contact.nospam": "Sin pitch comercial, sin spam.",
  "contact.week": "Esta semana",
  "contact.timezone": "America/Santiago",
  "contact.book": "Reservar 25 min",
  "contact.write": "O escríbenos",
  "contact.day.mon": "Lun",
  "contact.day.tue": "Mar",
  "contact.day.wed": "Mié",
  "contact.day.thu": "Jue",
  "contact.day.fri": "Vie",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "SaaS Template",
  description: "Production-ready SaaS template",
  "cta.signin": "Sign in",
  "cta.dashboard": "Go to dashboard",
  "hero.tag": "Multi-tenant SaaS platform",
  "hero.title1": "Lorem ipsum dolor sit amet,",
  "hero.title2": "consectetur adipiscing elit sed do.",
  "hero.subtitle":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "hero.secondary": "Book a demo",
  "hero.trust": "No card · 14-day trial",
  "mock.agent": "Assistant · SaaS Template",
  "mock.taskLabel": "Current task",
  "mock.task": "Lorem ipsum dolor sit amet consectetur.",
  "mock.stepsLabel": "Steps",
  "mock.step.1": "Lorem ipsum dolor sit",
  "mock.step.2": "Consectetur adipiscing elit",
  "mock.step.3": "Sed do eiusmod tempor",
  "mock.step.4": "Incididunt ut labore",
  "mock.replyLabel": "Reply ready",
  "mock.reply":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.",
  "mock.send": "Send",
  "mock.edit": "Edit",
  "social.title": "Growing teams trust SaaS Template",
  "stats.caption": "Updated 2 min ago",
  "stats.title": "Lorem ipsum dolor sit amet",
  "stats.subtitle": "Lorem ipsum dolor sit amet consectetur.",
  "stats.a.kpi": "12,400",
  "stats.a.unit": "+",
  "stats.a.label": "active teams",
  "stats.a.foot": "+38% YoY",
  "stats.b.kpi": "1.2",
  "stats.b.unit": "M",
  "stats.b.label": "payslips / month",
  "stats.b.foot": "p99 320 ms",
  "stats.c.kpi": "99.99",
  "stats.c.unit": "%",
  "stats.c.label": "production SLA",
  "stats.c.foot": "12 months",
  "stats.d.kpi": "27",
  "stats.d.unit": "",
  "stats.d.label": "integrations",
  "stats.d.foot": "and growing",
  "testimonials.tag": "Customers",
  "testimonials.title": "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  "testimonials.a.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.a.name": "María Salinas",
  "testimonials.a.role": "VP Operations · Northwind",
  "testimonials.b.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.b.name": "Diego Araya",
  "testimonials.b.role": "Head of Platform · Helia",
  "testimonials.c.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.c.name": "Camila Souza",
  "testimonials.c.role": "Accountant · Quanta",
  "faq.tag": "FAQ",
  "faq.title": "Things almost everyone asks.",
  "faq.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "faq.a.q": "Lorem ipsum dolor sit amet?",
  "faq.a.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.b.q": "Consectetur adipiscing elit?",
  "faq.b.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.c.q": "Sed do eiusmod tempor?",
  "faq.c.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.d.q": "Incididunt ut labore et dolore?",
  "faq.d.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.e.q": "Magna aliqua ut enim?",
  "faq.e.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "contact.tag": "Talk to us",
  "contact.title": "A focused 25-minute call.",
  "contact.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
  "contact.bullet.a": "Lorem ipsum dolor sit amet",
  "contact.bullet.b": "Consectetur adipiscing elit",
  "contact.bullet.c": "Sed do eiusmod tempor",
  "contact.nospam": "No sales pitch, no spam.",
  "contact.week": "This week",
  "contact.timezone": "America/Santiago",
  "contact.book": "Book 25 min",
  "contact.write": "Or write to us",
  "contact.day.mon": "Mon",
  "contact.day.tue": "Tue",
  "contact.day.wed": "Wed",
  "contact.day.thu": "Thu",
  "contact.day.fri": "Fri",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "SaaS Template",
  description: "Template SaaS pronto para produção",
  "cta.signin": "Entrar",
  "cta.dashboard": "Ir para o painel",
  "hero.tag": "Plataforma SaaS multi-tenant",
  "hero.title1": "Lorem ipsum dolor sit amet,",
  "hero.title2": "consectetur adipiscing elit sed do.",
  "hero.subtitle":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "hero.secondary": "Agendar demo",
  "hero.trust": "Sem cartão · 14 dias de teste",
  "mock.agent": "Assistente · SaaS Template",
  "mock.taskLabel": "Tarefa atual",
  "mock.task": "Lorem ipsum dolor sit amet consectetur.",
  "mock.stepsLabel": "Passos",
  "mock.step.1": "Lorem ipsum dolor sit",
  "mock.step.2": "Consectetur adipiscing elit",
  "mock.step.3": "Sed do eiusmod tempor",
  "mock.step.4": "Incididunt ut labore",
  "mock.replyLabel": "Resposta pronta",
  "mock.reply":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.",
  "mock.send": "Enviar",
  "mock.edit": "Editar",
  "social.title": "Times em crescimento confiam na SaaS Template",
  "stats.caption": "Atualizado há 2 min",
  "stats.title": "Lorem ipsum dolor sit amet",
  "stats.subtitle": "Lorem ipsum dolor sit amet consectetur.",
  "stats.a.kpi": "12.400",
  "stats.a.unit": "+",
  "stats.a.label": "times ativos",
  "stats.a.foot": "+38 % a/a",
  "stats.b.kpi": "1,2",
  "stats.b.unit": "M",
  "stats.b.label": "holerites / mês",
  "stats.b.foot": "p99 320 ms",
  "stats.c.kpi": "99,99",
  "stats.c.unit": "%",
  "stats.c.label": "SLA em produção",
  "stats.c.foot": "12 meses",
  "stats.d.kpi": "27",
  "stats.d.unit": "",
  "stats.d.label": "integrações",
  "stats.d.foot": "e crescendo",
  "testimonials.tag": "Clientes",
  "testimonials.title": "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  "testimonials.a.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.a.name": "María Salinas",
  "testimonials.a.role": "Gerente de Operações · Northwind",
  "testimonials.b.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.b.name": "Diego Araya",
  "testimonials.b.role": "Líder de Plataforma · Helia",
  "testimonials.c.quote":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "testimonials.c.name": "Camila Souza",
  "testimonials.c.role": "Contadora · Quanta",
  "faq.tag": "Perguntas frequentes",
  "faq.title": "O que quase todo mundo pergunta.",
  "faq.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "faq.a.q": "Lorem ipsum dolor sit amet?",
  "faq.a.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.b.q": "Consectetur adipiscing elit?",
  "faq.b.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.c.q": "Sed do eiusmod tempor?",
  "faq.c.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.d.q": "Incididunt ut labore et dolore?",
  "faq.d.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "faq.e.q": "Magna aliqua ut enim?",
  "faq.e.a": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  "contact.tag": "Vamos conversar",
  "contact.title": "Uma chamada de 25 minutos.",
  "contact.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
  "contact.bullet.a": "Lorem ipsum dolor sit amet",
  "contact.bullet.b": "Consectetur adipiscing elit",
  "contact.bullet.c": "Sed do eiusmod tempor",
  "contact.nospam": "Sem pitch comercial, sem spam.",
  "contact.week": "Esta semana",
  "contact.timezone": "America/Sao_Paulo",
  "contact.book": "Reservar 25 min",
  "contact.write": "Ou escreva pra gente",
  "contact.day.mon": "Seg",
  "contact.day.tue": "Ter",
  "contact.day.wed": "Qua",
  "contact.day.thu": "Qui",
  "contact.day.fri": "Sex",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
