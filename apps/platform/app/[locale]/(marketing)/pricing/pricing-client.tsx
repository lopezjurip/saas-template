"use client";

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

export type PricingDictionary = {
  tag: string;
  title: string;
  subtitle: string;
  billing: { monthly: string; yearly: string; save: string };
  popular: string;
  perSeat: string;
  perSeatYearly: string;
  customPrice: string;
  fineprint: string;
  compareTitle: string;
  compareSubtitle: string;
  featureColumn: string;
  faqTitle: string;
  faqSubtitle: string;
  tiers: PricingTier[];
  compare: CompareGroup[];
  faq: FaqEntry[];
};

type PricingClientProps = { dict: PricingDictionary };

function FORMAT_PRICE(value: number): string {
  return `$${value}`;
}

export function PricingClient({ dict }: PricingClientProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 lg:px-8">
      <section className="flex flex-col items-center gap-5 text-center">
        <Badge variant="secondary" className="uppercase tracking-wide">
          {dict.tag}
        </Badge>
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{dict.title}</h1>
        <p className="max-w-2xl text-pretty text-base text-muted-foreground">{dict.subtitle}</p>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as BillingPeriod)}>
          <TabsList>
            <TabsTrigger value="monthly">{dict.billing.monthly}</TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2">
              {dict.billing.yearly}
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {dict.billing.save}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <section className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {dict.tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn("relative flex flex-col gap-6", tier.highlighted && "border-foreground shadow-lg")}
          >
            {tier.highlighted ? (
              <Badge className="absolute -top-3 left-6 gap-1">
                <Star className="size-3" />
                {dict.popular}
              </Badge>
            ) : null}
            <CardHeader className="gap-2">
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <CardDescription className="text-pretty">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 border-t pt-6">
              <PriceDisplay tier={tier} period={period} dict={dict} />
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

      <p className="mt-6 text-center text-xs text-muted-foreground">{dict.fineprint}</p>

      <section className="mt-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">{dict.compareTitle}</h2>
          <p className="text-sm text-muted-foreground">{dict.compareSubtitle}</p>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[40%]">{dict.featureColumn}</TableHead>
                {dict.tiers.map((tier) => (
                  <TableHead key={tier.id} className="text-center">
                    {tier.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dict.compare.map((group) => (
                <CompareGroupRows key={group.title} group={group} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="flex flex-col gap-2">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{dict.faqTitle}</h2>
          <p className="text-sm text-muted-foreground">{dict.faqSubtitle}</p>
        </div>
        <Accordion type="single" collapsible defaultValue="faq-0" className="rounded-xl border bg-card px-5">
          {dict.faq.map((entry, index) => (
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

function PriceDisplay({ tier, period, dict }: { tier: PricingTier; period: BillingPeriod; dict: PricingDictionary }) {
  if (tier.priceMonthly < 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-semibold tracking-tight">{dict.customPrice}</span>
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
  const unit = period === "monthly" ? dict.perSeat : dict.perSeatYearly;
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
