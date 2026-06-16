"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import useSWR from "swr";
import { useRosetta } from "~/lib/i18n.client";

async function HEALTH_FETCHER(url: string): Promise<boolean> {
  const res = await fetch(url);
  const json = (await res.json()) as { ok: boolean };
  return json["ok"] === true;
}

/**
 * Client badge that polls `/health` and reflects the real service state live.
 *
 * Owns its own rosetta dictionary — render it without passing any labels.
 *
 * @example
 * <StatusBadge />
 */
export function StatusBadge() {
  const { t } = useRosetta(LOCALES);
  const { data: ok } = useSWR("/health", HEALTH_FETCHER, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    fallbackData: false,
  });

  return (
    <Badge variant="outline" className="mt-1 w-fit gap-1.5 rounded-full font-normal text-muted-foreground">
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")} />
      {ok ? t("status") : t("status_down")}
    </Badge>
  );
}

const LOCALE_ES = {
  status: "Todo operativo",
  status_down: "Interrupción del servicio",
};

const LOCALE_EN: typeof LOCALE_ES = {
  status: "All systems normal",
  status_down: "Service disruption",
};

const LOCALE_PT: typeof LOCALE_ES = {
  status: "Tudo operacional",
  status_down: "Interrupção do serviço",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
