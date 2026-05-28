"use client";

import { Check, Star, X } from "lucide-react";
import Link from "next/link";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { METHOD_ORDER, type OnboardingMethodId, type OnboardingState } from "../state";
import { METHOD_CATALOG } from "./method-catalog";

export function ObChips({ methods, current }: { methods: OnboardingState["methods"]; current?: OnboardingMethodId }) {
  const locale = useLocaleParam();

  return (
    <div className="ob-chips">
      {METHOD_ORDER.map((id) => {
        const status = methods[id];
        const meta = METHOD_CATALOG[id];
        const isRecommended = id === AUTH_TWEAKS.OB_RECOMMENDED && status === "pending";
        return (
          <Link
            key={id}
            href={`/${locale}/auth/onboarding/${id}`}
            className="ob-chip"
            data-status={status}
            data-current={id === current ? "true" : "false"}
            data-recommended={isRecommended ? "true" : "false"}
            aria-current={id === current ? "step" : undefined}
          >
            <span className="ob-chip-marker">
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
            <span>{meta.label}</span>
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
  const total = METHOD_ORDER.length;
  const done = METHOD_ORDER.filter((id) => methods[id] === "done").length;
  const skipped = METHOD_ORDER.filter((id) => methods[id] === "skipped").length;
  const pending = total - done - skipped;
  return (
    <div className="ob-summary" data-dense={dense ? "true" : "false"}>
      {showMeter && (
        <div className="ob-summary-meter" aria-hidden="true">
          {METHOD_ORDER.map((id) => (
            <span key={id} className="ob-summary-seg" data-status={methods[id]} />
          ))}
        </div>
      )}
      <div className="ob-summary-text">
        <strong>
          {done} de {total}
        </strong>
        <span className="ob-summary-sep">·</span>
        {pending > 0 ? <span>{pending === 1 ? "1 pendiente" : `${pending} pendientes`}</span> : <span>completo</span>}
        {skipped > 0 && (
          <>
            <span className="ob-summary-sep">·</span>
            <span>
              {skipped} saltado{skipped === 1 ? "" : "s"}
            </span>
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
}: {
  methods: OnboardingState["methods"];
  current?: OnboardingMethodId;
  dense?: boolean;
}) {
  if (AUTH_TWEAKS.OB_PROGRESS === "chips") {
    return (
      <>
        <ObChips methods={methods} current={current} />
        <ObSummary methods={methods} dense={dense} showMeter={false} />
      </>
    );
  }
  return <ObSummary methods={methods} dense={dense} showMeter />;
}
