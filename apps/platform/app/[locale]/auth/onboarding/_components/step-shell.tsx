"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocaleParam } from "~/hooks/use-locale-param";
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
  const locale = useLocaleParam();
  const hubHref = `/${locale}/auth/onboarding`;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between -mb-1">
        <Link href={hubHref} className="sc-back">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>

      <ObProgress methods={methods} current={current} dense />

      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {subtitle && <p className="m-0 text-[13px] leading-[1.5] text-muted-foreground text-pretty">{subtitle}</p>}
      </div>

      {children}

      <Link
        href={skipHref ?? hubHref}
        className="sc-btn sc-btn-outline sc-btn-block mt-1 h-[44px] text-[13.5px] text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <span>Saltar por ahora — lo configuro después</span>
      </Link>
    </div>
  );
}
