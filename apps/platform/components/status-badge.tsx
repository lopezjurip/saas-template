"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import useSWR from "swr";
import { useRosetta } from "~/lib/i18n.client";

/**
 * Fetches /health and returns whether the platform reports itself healthy.
 * Relative URL resolves against the current origin in the browser — no proto/host juggling.
 */
async function FETCH_HEALTH(url: string): Promise<boolean> {
  const res = await fetch(url);
  const json = (await res.json()) as { ok: boolean };
  return json["ok"] === true;
}

/**
 * Footer status pill reflecting the live /health state. Client component so it can
 * poll and revalidate without a full page reload.
 * @example <StatusBadge />
 */
export function StatusBadge() {
  const { t } = useRosetta(LOCALES);
  const { data: ok } = useSWR("/health", FETCH_HEALTH, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    fallbackData: false,
  });

  return (
    <Badge variant="outline" className="mt-1 w-fit gap-1.5 rounded-full font-normal text-muted-foreground">
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")} />
      {ok ? t("ok") : t("down")}
    </Badge>
  );
}

const LOCALE_ES = {
  ok: "Todo operativo",
  down: "Interrupción del servicio",
};

const LOCALES = {
  es: LOCALE_ES,
  en: { ok: "All systems normal", down: "Service disruption" } satisfies typeof LOCALE_ES,
  pt: { ok: "Tudo operacional", down: "Interrupção do serviço" } satisfies typeof LOCALE_ES,
};
