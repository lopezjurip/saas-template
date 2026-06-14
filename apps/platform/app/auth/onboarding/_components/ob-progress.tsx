"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Check, Star, X } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { METHOD_ORDER, ONBOARDING_METHOD_PATH, type OnboardingMethodId, type OnboardingState } from "../state";
import { METHOD_CATALOG } from "./method-catalog";

export function ObChips({ methods, current }: { methods: OnboardingState["methods"]; current?: OnboardingMethodId }) {
  const { t } = useRosetta(LOCALES);
  const methodLabels = t("methods") as typeof LOCALE_ES.methods;

  return (
    <div className="flex flex-wrap gap-1.5" data-component="ObChips">
      {METHOD_ORDER.map((id) => {
        const status = methods[id];
        const meta = METHOD_CATALOG[id];
        const isRecommended = id === AUTH_TWEAKS.OB_RECOMMENDED && status === "pending";
        const isCurrent = id === current;
        return (
          <Link
            key={id}
            href={ROUTE(ONBOARDING_METHOD_PATH(id))}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border bg-background pl-1.5 pr-2.5 text-xs font-medium text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground",
              status === "done" &&
                "border-border bg-muted/35 text-muted-foreground hover:bg-muted/55 hover:text-foreground",
              status === "skipped" && "border-dashed",
              isRecommended && "border-foreground/55 text-foreground",
              isCurrent && "border-ring ring-[3px] ring-ring/20",
              isCurrent && status !== "done" && "text-foreground",
            )}
            data-id={id}
            data-status={status}
            data-current={isCurrent ? "true" : "false"}
            data-recommended={isRecommended ? "true" : "false"}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
                status === "done" && "bg-background text-muted-foreground ring-1 ring-border",
                status === "skipped" && "bg-transparent",
                isRecommended && "bg-foreground text-background",
              )}
            >
              {status === "done" ? (
                <Check size={11} />
              ) : status === "skipped" ? (
                <X size={11} />
              ) : isRecommended ? (
                <Star size={11} />
              ) : (
                <meta.Icon size={11} />
              )}
            </span>
            <span>{methodLabels[id].label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function ObSummary({
  methods,
  dense = false,
  showMeter = false,
}: {
  methods: OnboardingState["methods"];
  dense?: boolean;
  showMeter?: boolean;
}) {
  const { t } = useRosetta(LOCALES);
  const total = METHOD_ORDER.length;
  const done = METHOD_ORDER.filter((id) => methods[id] === "done").length;
  const skipped = METHOD_ORDER.filter((id) => methods[id] === "skipped").length;
  const pending = total - done - skipped;
  return (
    <div className={cn("flex flex-col gap-1.5", dense && "gap-1")}>
      {showMeter && (
        <div className="grid h-1 w-full grid-flow-col auto-cols-fr gap-1" aria-hidden="true">
          {METHOD_ORDER.map((id) => (
            <span
              key={id}
              data-id={id}
              data-status={methods[id]}
              className={cn(
                "h-full rounded-sm bg-muted",
                methods[id] === "done" && "bg-foreground",
                methods[id] === "skipped" && "box-border border border-dashed border-border bg-muted",
              )}
            />
          ))}
        </div>
      )}
      <div className="inline-flex flex-wrap items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
        <strong className="font-semibold text-foreground">{t("summary_done_of", { done, total })}</strong>
        <span className="opacity-50">·</span>
        {pending > 0 ? (
          <span>{pending === 1 ? t("summary_pending_one") : t("summary_pending_many", { count: pending })}</span>
        ) : (
          <span>{t("summary_complete")}</span>
        )}
        {skipped > 0 && (
          <>
            <span className="opacity-50">·</span>
            <span>{skipped === 1 ? t("summary_skipped_one") : t("summary_skipped_many", { count: skipped })}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function ObProgress({
  methods,
  current,
  dense = false,
  meter = false,
}: {
  methods: OnboardingState["methods"];
  current?: OnboardingMethodId;
  dense?: boolean;
  meter?: boolean;
}) {
  if (AUTH_TWEAKS.OB_PROGRESS === "chips") {
    return (
      <>
        <ObChips methods={methods} current={current} />
        <ObSummary methods={methods} dense={dense} showMeter={meter} />
      </>
    );
  }
  return <ObSummary methods={methods} dense={dense} showMeter />;
}

const LOCALE_ES = {
  methods: {
    passkey: { label: "Passkey" },
    password: { label: "Contraseña" },
    phone: { label: "Teléfono" },
    email: { label: "Correo" },
    document: { label: "Documento" },
    profile: { label: "Perfil" },
  },
  summary_done_of: "{{done}} de {{total}}",
  summary_pending_one: "1 pendiente",
  summary_pending_many: "{{count}} pendientes",
  summary_complete: "completo",
  summary_skipped_one: "1 saltado",
  summary_skipped_many: "{{count}} saltados",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    methods: {
      passkey: { label: "Passkey" },
      password: { label: "Password" },
      phone: { label: "Phone" },
      email: { label: "Email" },
      document: { label: "Document" },
      profile: { label: "Profile" },
    },
    summary_done_of: "{{done}} of {{total}}",
    summary_pending_one: "1 pending",
    summary_pending_many: "{{count}} pending",
    summary_complete: "complete",
    summary_skipped_one: "1 skipped",
    summary_skipped_many: "{{count}} skipped",
  } satisfies typeof LOCALE_ES,
  pt: {
    methods: {
      passkey: { label: "Passkey" },
      password: { label: "Senha" },
      phone: { label: "Telefone" },
      email: { label: "E-mail" },
      document: { label: "Documento" },
      profile: { label: "Perfil" },
    },
    summary_done_of: "{{done}} de {{total}}",
    summary_pending_one: "1 pendente",
    summary_pending_many: "{{count}} pendentes",
    summary_complete: "completo",
    summary_skipped_one: "1 pulado",
    summary_skipped_many: "{{count}} pulados",
  } satisfies typeof LOCALE_ES,
};
