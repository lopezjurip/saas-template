"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/hooks/use-rosetta";
import { ROUTE, UNSAFE_ROUTE } from "~/lib/route";
import type { OnboardingMethodId, OnboardingState } from "../state";
import { ObProgress } from "./ob-progress";

export function StepShell({
  methods,
  current,
  title,
  subtitle,
  children,
  skipHref,
}: {
  methods: OnboardingState["methods"];
  current: OnboardingMethodId;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  skipHref?: string;
}) {
  const { t } = useRosetta(LOCALES);
  const locale = useLocaleParam();
  const hubHref = ROUTE("/[locale]/auth/onboarding", { locale });

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex items-center justify-between -mb-1">
        <Link
          href={hubHref}
          className="inline-flex items-center gap-1.5 self-start -ml-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft size={14} /> {t("back")}
        </Link>
      </div>

      <ObProgress methods={methods} current={current} dense />

      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-xl/normal font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {subtitle && <p className="m-0 text-sm leading-normal text-muted-foreground text-pretty">{subtitle}</p>}
      </div>

      {children}

      <Button
        asChild
        variant="outline"
        className="mt-1 h-[44px] w-full text-[13.5px] text-muted-foreground hover:text-foreground"
      >
        <Link href={skipHref ? UNSAFE_ROUTE(skipHref) : hubHref}>
          <span>{t("skip")}</span>
        </Link>
      </Button>
    </div>
  );
}

const LOCALE_ES = {
  back: "Volver al inicio",
  skip: "Saltar por ahora — lo configuro después",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    back: "Back to overview",
    skip: "Skip for now — I'll set it up later",
  } satisfies typeof LOCALE_ES,
  pt: {
    back: "Voltar ao início",
    skip: "Pular por agora — configuro depois",
  } satisfies typeof LOCALE_ES,
};
