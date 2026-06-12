"use client";

import { useRosetta } from "@packages/rosetta/use-rosetta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui-common/shadcn/components/ui/accordion";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui-common/shadcn/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Minus, Star } from "lucide-react";
import { useState } from "react";

type BillingPeriod = "monthly" | "yearly";

type PricingTier = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  unit: string;
  unitFootnote: string;
  cta: string;
  highlighted: boolean;
  featuresLabel: string;
  features: string[];
};

type CompareCell = string | boolean;

type CompareGroup = {
  title: string;
  rows: { feature: string; starter: CompareCell; pro: CompareCell; empresa: CompareCell }[];
};

type FaqEntry = { question: string; answer: string };

function FORMAT_PRICE(value: number): string {
  return `$${value}`;
}

export function PricingClient() {
  const { t } = useRosetta(LOCALES);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const tiers = t("tiers") as PricingTier[];
  const compare = t("compare") as CompareGroup[];
  const faq = t("faq") as FaqEntry[];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 lg:px-8">
      <section className="flex flex-col items-center gap-5 text-center">
        <Badge variant="secondary" className="uppercase tracking-wide">
          {t("tag")}
        </Badge>
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="max-w-2xl text-pretty text-base text-muted-foreground">{t("subtitle")}</p>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as BillingPeriod)}>
          <TabsList>
            <TabsTrigger value="monthly">{t("billing.monthly")}</TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2">
              {t("billing.yearly")}
              <Badge variant="secondary" className="h-4 px-1.5 text-tiny">
                {t("billing.save")}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <section className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn("relative flex flex-col gap-6", tier.highlighted && "border-foreground shadow-lg")}
          >
            {tier.highlighted ? (
              <Badge className="absolute -top-3 left-6 gap-1">
                <Star className="size-3" />
                {t("popular")}
              </Badge>
            ) : null}
            <CardHeader className="gap-2">
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <CardDescription className="text-pretty">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 border-t pt-6">
              <PriceDisplay tier={tier} period={period} />
            </CardContent>
            <CardContent>
              <Button asChild variant={tier.highlighted ? "default" : "outline"} className="w-full cursor-pointer">
                <a href="#">
                  {tier.cta}
                  {tier.id !== "empresa" ? <ArrowRight className="size-4" /> : null}
                </a>
              </Button>
            </CardContent>
            <CardContent className="flex flex-1 flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tier.featuresLabel}
              </span>
              <ul className="flex flex-col gap-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-pretty">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t("fineprint")}</p>

      <section className="mt-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">{t("compareTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("compareSubtitle")}</p>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[40%]">{t("featureColumn")}</TableHead>
                {tiers.map((tier) => (
                  <TableHead key={tier.id} className="text-center">
                    {tier.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {compare.map((group) => (
                <CompareGroupRows key={group.title} group={group} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="flex flex-col gap-2">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t("faqTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("faqSubtitle")}</p>
        </div>
        <Accordion type="single" collapsible defaultValue="faq-0" className="rounded-xl border bg-card px-5">
          {faq.map((entry, index) => (
            <AccordionItem key={entry.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-base">{entry.question}</AccordionTrigger>
              <AccordionContent className="text-pretty text-muted-foreground">{entry.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}

function PriceDisplay({ tier, period }: { tier: PricingTier; period: BillingPeriod }) {
  const { t } = useRosetta(LOCALES);

  if (tier.priceMonthly < 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-semibold tracking-tight">{t("customPrice")}</span>
        <span className="text-xs text-muted-foreground">{tier.unitFootnote}</span>
      </div>
    );
  }

  if (tier.priceMonthly === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{FORMAT_PRICE(0)}</span>
        <span className="text-xs text-muted-foreground">{tier.unit}</span>
      </div>
    );
  }

  const amount = period === "monthly" ? tier.priceMonthly : tier.priceYearly;
  const unit = period === "monthly" ? t("perSeat") : t("perSeatYearly");
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{FORMAT_PRICE(amount)}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <span className="text-xs text-muted-foreground">{tier.unitFootnote}</span>
    </div>
  );
}

function CompareGroupRows({ group }: { group: CompareGroup }) {
  return (
    <>
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={4} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {group.title}
        </TableCell>
      </TableRow>
      {group.rows.map((row) => (
        <TableRow key={row.feature}>
          <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
          <TableCell className="text-center">
            <CompareValue value={row.starter} />
          </TableCell>
          <TableCell className="text-center">
            <CompareValue value={row.pro} />
          </TableCell>
          <TableCell className="text-center">
            <CompareValue value={row.empresa} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function CompareValue({ value }: { value: CompareCell }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center" aria-label="Incluido">
        <Check className="size-4 text-foreground" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-muted-foreground/50" aria-label="No incluido">
        <Minus className="size-4" />
      </span>
    );
  }
  return <span className="text-sm text-foreground">{value}</span>;
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
  ] as PricingTier[],
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
  ] as CompareGroup[],
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
  ] as FaqEntry[],
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
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
    ] as PricingTier[],
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
    ] as CompareGroup[],
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
    ] as FaqEntry[],
  } satisfies typeof LOCALE_ES,
  pt: {
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
    ] as PricingTier[],
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
    ] as CompareGroup[],
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
    ] as FaqEntry[],
  } satisfies typeof LOCALE_ES,
};
