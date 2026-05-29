import type { Metadata } from "next";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";
import { PricingClient, type PricingDictionary } from "./pricing-client";

export async function generateMetadata(props: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${base}/${safeLocale}/pricing`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/pricing`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/pricing`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/pricing`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title: t("title"),
      siteName: "Humane",
    },
  };
}

export default async function PricingPage(props: PageProps<"/[locale]/pricing">) {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);

  const dict: PricingDictionary = {
    tag: t("tag"),
    title: t("title"),
    subtitle: t("subtitle"),
    billing: { monthly: t("billing.monthly"), yearly: t("billing.yearly"), save: t("billing.save") },
    popular: t("popular"),
    perSeat: t("perSeat"),
    perSeatYearly: t("perSeatYearly"),
    customPrice: t("customPrice"),
    fineprint: t("fineprint"),
    compareTitle: t("compareTitle"),
    compareSubtitle: t("compareSubtitle"),
    featureColumn: t("featureColumn"),
    faqTitle: t("faqTitle"),
    faqSubtitle: t("faqSubtitle"),
    tiers: t("tiers"),
    compare: t("compare"),
    faq: t("faq"),
  };

  return <PricingClient dict={dict} />;
}

const LOCALE_ES = {
  tag: "Planes",
  title: "Precios simples para cada etapa de tu equipo",
  subtitle: "Lorem ipsum dolor sit amet. Empieza gratis y crece cuando lo necesites.",
  billing: { monthly: "Mensual", yearly: "Anual", save: "-20%" },
  popular: "Más elegido",
  perSeat: "/ usuario / mes",
  perSeatYearly: "/ usuario / mes · facturado anual",
  customPrice: "A medida",
  fineprint: "Precios de referencia en CLP. Impuestos según corresponda. Sin permanencia mínima.",
  compareTitle: "Compara los planes en detalle",
  compareSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  featureColumn: "Característica",
  faqTitle: "Preguntas sobre el cobro",
  faqSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  tiers: [
    {
      id: "inicial",
      name: "Inicial",
      description: "Lorem ipsum para equipos que recién comienzan.",
      priceMonthly: 0,
      priceYearly: 0,
      unit: "Gratis para siempre",
      unitFootnote: "Sin tarjeta",
      cta: "Empezar gratis",
      highlighted: false,
      featuresLabel: "Incluye",
      features: [
        "Lorem ipsum hasta 5 usuarios",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Soporte por comunidad",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Lorem ipsum para equipos en pleno crecimiento.",
      priceMonthly: 29000,
      priceYearly: 23000,
      unit: "/ usuario / mes",
      unitFootnote: "Mínimo 3 usuarios",
      cta: "Probar Pro",
      highlighted: true,
      featuresLabel: "Todo lo de Inicial, más",
      features: [
        "Lorem ipsum usuarios ilimitados",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Roles y permisos avanzados",
        "Soporte en horario hábil",
      ],
    },
    {
      id: "empresa",
      name: "Empresa",
      description: "Lorem ipsum para equipos con necesidades de compliance.",
      priceMonthly: -1,
      priceYearly: -1,
      unit: "A medida",
      unitFootnote: "Plan anual",
      cta: "Hablar con ventas",
      highlighted: false,
      featuresLabel: "Todo lo de Pro, más",
      features: [
        "Lorem ipsum despliegue dedicado",
        "SSO y auditoría completa",
        "Lorem ipsum dolor sit amet",
        "SLA con créditos",
        "Soporte 24/7 dedicado",
      ],
    },
  ],
  compare: [
    {
      title: "Plataforma",
      rows: [
        { feature: "Usuarios por workspace", starter: "5", pro: "Ilimitado", empresa: "Ilimitado" },
        { feature: "Proyectos activos", starter: "3", pro: "Ilimitado", empresa: "Ilimitado" },
        { feature: "Historial de cambios", starter: true, pro: true, empresa: true },
        { feature: "Lorem ipsum dolor", starter: false, pro: true, empresa: true },
      ],
    },
    {
      title: "Seguridad y compliance",
      rows: [
        { feature: "Inicio de sesión seguro", starter: true, pro: true, empresa: true },
        { feature: "SSO (SAML, OIDC)", starter: false, pro: "Add-on", empresa: true },
        { feature: "Registros de auditoría", starter: "30 días", pro: "12 meses", empresa: "Configurable" },
        { feature: "Residencia de datos", starter: false, pro: "EU / US", empresa: "Cualquier región" },
      ],
    },
    {
      title: "Soporte",
      rows: [
        { feature: "Canal de soporte", starter: "Comunidad", pro: "Horario hábil", empresa: "24/7 dedicado" },
        { feature: "SLA", starter: "Best effort", pro: "99,9%", empresa: "99,99% con créditos" },
        { feature: "Gerente de cuenta", starter: false, pro: false, empresa: true },
      ],
    },
  ],
  faq: [
    {
      question: "¿Puedo cambiar de plan cuando quiera?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. El cambio aplica de inmediato.",
    },
    {
      question: "¿Necesito tarjeta para empezar?",
      answer: "Lorem ipsum dolor sit amet. El plan Inicial es gratis y no requiere tarjeta.",
    },
    {
      question: "¿Tienen descuentos por pago anual?",
      answer: "Lorem ipsum dolor sit amet. El plan anual incluye un 20% de descuento.",
    },
    {
      question: "¿Cómo se factura el plan Empresa?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Se cotiza según tus necesidades.",
    },
  ],
};

const LOCALE_EN: typeof LOCALE_ES = {
  tag: "Plans",
  title: "Simple pricing for every stage of your team",
  subtitle: "Lorem ipsum dolor sit amet. Start free and grow when you need it.",
  billing: { monthly: "Monthly", yearly: "Yearly", save: "-20%" },
  popular: "Most picked",
  perSeat: "/ user / month",
  perSeatYearly: "/ user / month · billed yearly",
  customPrice: "Custom",
  fineprint: "Reference prices in CLP. Taxes apply as required. No minimum commitment.",
  compareTitle: "Compare plans in detail",
  compareSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  featureColumn: "Feature",
  faqTitle: "Billing questions",
  faqSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  tiers: [
    {
      id: "inicial",
      name: "Inicial",
      description: "Lorem ipsum for teams just getting started.",
      priceMonthly: 0,
      priceYearly: 0,
      unit: "Free forever",
      unitFootnote: "No card",
      cta: "Get started free",
      highlighted: false,
      featuresLabel: "Includes",
      features: [
        "Lorem ipsum up to 5 users",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Community support",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Lorem ipsum for teams in full growth.",
      priceMonthly: 29000,
      priceYearly: 23000,
      unit: "/ user / month",
      unitFootnote: "Min 3 users",
      cta: "Try Pro",
      highlighted: true,
      featuresLabel: "Everything in Inicial, plus",
      features: [
        "Lorem ipsum unlimited users",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Advanced roles and permissions",
        "Business-hours support",
      ],
    },
    {
      id: "empresa",
      name: "Empresa",
      description: "Lorem ipsum for teams with compliance needs.",
      priceMonthly: -1,
      priceYearly: -1,
      unit: "Custom",
      unitFootnote: "Annual plan",
      cta: "Talk to sales",
      highlighted: false,
      featuresLabel: "Everything in Pro, plus",
      features: [
        "Lorem ipsum dedicated deployment",
        "SSO and full audit logs",
        "Lorem ipsum dolor sit amet",
        "SLA with credits",
        "24/7 dedicated support",
      ],
    },
  ],
  compare: [
    {
      title: "Platform",
      rows: [
        { feature: "Users per workspace", starter: "5", pro: "Unlimited", empresa: "Unlimited" },
        { feature: "Active projects", starter: "3", pro: "Unlimited", empresa: "Unlimited" },
        { feature: "Change history", starter: true, pro: true, empresa: true },
        { feature: "Lorem ipsum dolor", starter: false, pro: true, empresa: true },
      ],
    },
    {
      title: "Security and compliance",
      rows: [
        { feature: "Secure sign-in", starter: true, pro: true, empresa: true },
        { feature: "SSO (SAML, OIDC)", starter: false, pro: "Add-on", empresa: true },
        { feature: "Audit logs", starter: "30 days", pro: "12 months", empresa: "Configurable" },
        { feature: "Data residency", starter: false, pro: "EU / US", empresa: "Any region" },
      ],
    },
    {
      title: "Support",
      rows: [
        { feature: "Support channel", starter: "Community", pro: "Business hours", empresa: "24/7 dedicated" },
        { feature: "SLA", starter: "Best effort", pro: "99.9%", empresa: "99.99% with credits" },
        { feature: "Account manager", starter: false, pro: false, empresa: true },
      ],
    },
  ],
  faq: [
    {
      question: "Can I switch plans anytime?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Changes apply immediately.",
    },
    {
      question: "Do I need a card to start?",
      answer: "Lorem ipsum dolor sit amet. The Inicial plan is free and needs no card.",
    },
    {
      question: "Are there discounts for annual billing?",
      answer: "Lorem ipsum dolor sit amet. The annual plan includes a 20% discount.",
    },
    {
      question: "How is the Empresa plan billed?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. It is quoted to your needs.",
    },
  ],
};

const LOCALE_PT: typeof LOCALE_ES = {
  tag: "Planos",
  title: "Preços simples para cada etapa do seu time",
  subtitle: "Lorem ipsum dolor sit amet. Comece grátis e cresça quando precisar.",
  billing: { monthly: "Mensal", yearly: "Anual", save: "-20%" },
  popular: "Mais escolhido",
  perSeat: "/ usuário / mês",
  perSeatYearly: "/ usuário / mês · faturado anual",
  customPrice: "Sob medida",
  fineprint: "Preços de referência em CLP. Impostos conforme aplicável. Sem permanência mínima.",
  compareTitle: "Compare os planos em detalhe",
  compareSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  featureColumn: "Recurso",
  faqTitle: "Dúvidas sobre cobrança",
  faqSubtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  tiers: [
    {
      id: "inicial",
      name: "Inicial",
      description: "Lorem ipsum para times que estão começando.",
      priceMonthly: 0,
      priceYearly: 0,
      unit: "Grátis para sempre",
      unitFootnote: "Sem cartão",
      cta: "Começar grátis",
      highlighted: false,
      featuresLabel: "Inclui",
      features: [
        "Lorem ipsum até 5 usuários",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Suporte pela comunidade",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Lorem ipsum para times em pleno crescimento.",
      priceMonthly: 29000,
      priceYearly: 23000,
      unit: "/ usuário / mês",
      unitFootnote: "Mínimo 3 usuários",
      cta: "Testar Pro",
      highlighted: true,
      featuresLabel: "Tudo do Inicial, mais",
      features: [
        "Lorem ipsum usuários ilimitados",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Papéis e permissões avançados",
        "Suporte em horário comercial",
      ],
    },
    {
      id: "empresa",
      name: "Empresa",
      description: "Lorem ipsum para times com necessidades de compliance.",
      priceMonthly: -1,
      priceYearly: -1,
      unit: "Sob medida",
      unitFootnote: "Plano anual",
      cta: "Falar com vendas",
      highlighted: false,
      featuresLabel: "Tudo do Pro, mais",
      features: [
        "Lorem ipsum deploy dedicado",
        "SSO e auditoria completa",
        "Lorem ipsum dolor sit amet",
        "SLA com créditos",
        "Suporte 24/7 dedicado",
      ],
    },
  ],
  compare: [
    {
      title: "Plataforma",
      rows: [
        { feature: "Usuários por workspace", starter: "5", pro: "Ilimitado", empresa: "Ilimitado" },
        { feature: "Projetos ativos", starter: "3", pro: "Ilimitado", empresa: "Ilimitado" },
        { feature: "Histórico de alterações", starter: true, pro: true, empresa: true },
        { feature: "Lorem ipsum dolor", starter: false, pro: true, empresa: true },
      ],
    },
    {
      title: "Segurança e compliance",
      rows: [
        { feature: "Login seguro", starter: true, pro: true, empresa: true },
        { feature: "SSO (SAML, OIDC)", starter: false, pro: "Add-on", empresa: true },
        { feature: "Logs de auditoria", starter: "30 dias", pro: "12 meses", empresa: "Configurável" },
        { feature: "Residência de dados", starter: false, pro: "EU / US", empresa: "Qualquer região" },
      ],
    },
    {
      title: "Suporte",
      rows: [
        { feature: "Canal de suporte", starter: "Comunidade", pro: "Horário comercial", empresa: "24/7 dedicado" },
        { feature: "SLA", starter: "Best effort", pro: "99,9%", empresa: "99,99% com créditos" },
        { feature: "Gerente de conta", starter: false, pro: false, empresa: true },
      ],
    },
  ],
  faq: [
    {
      question: "Posso trocar de plano quando quiser?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. A troca aplica imediatamente.",
    },
    {
      question: "Preciso de cartão para começar?",
      answer: "Lorem ipsum dolor sit amet. O plano Inicial é grátis e não exige cartão.",
    },
    {
      question: "Há desconto no pagamento anual?",
      answer: "Lorem ipsum dolor sit amet. O plano anual inclui 20% de desconto.",
    },
    {
      question: "Como é cobrado o plano Empresa?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. É cotado conforme suas necessidades.",
    },
  ],
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
