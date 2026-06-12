import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
import { METHOD_CATALOG } from "./_components/method-catalog";
import { actionFinishOnboarding } from "./actions";
import {
  COUNT_DONE,
  METHOD_ORDER,
  ONBOARDING_METHOD_PATH,
  type OnboardingMethodId,
  type OnboardingMethodStatus,
} from "./state";
import { getViewerOnboardingState } from "./state.server";

/**
 * Hub sort: recommended-pending → pending → skipped → done. Done sinks to the bottom.
 */
const STATUS_ORDER: Record<OnboardingMethodStatus, number> = {
  pending: 1,
  skipped: 2,
  done: 3,
};

export default async function OnboardingHubPage(props: PageProps<"/[locale]/auth/onboarding">) {
  const { locale } = await props.params;
  const state = await getViewerOnboardingState();
  const firstName = state.profile_name_full?.trim().split(/\s+/)[0] || "";
  const done = COUNT_DONE(state.methods);
  const remaining = METHOD_ORDER.length - done;

  // TODO: overkill, AUTH_TWEAKS.OB_RECOMMENDED is always passkey. could be constant.
  const sorted: OnboardingMethodId[] = [...METHOD_ORDER].sort((a, b) => {
    const recA =
      a === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[a] === "pending" ? 0 : STATUS_ORDER[state.methods[a]];
    const recB =
      b === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[b] === "pending" ? 0 : STATUS_ORDER[state.methods[b]];
    return recA - recB;
  });

  return (
    <AuthCard className="max-w-120">
      <div
        className={cn(
          "flex flex-col",
          AUTH_TWEAKS.DENSITY === "compact" ? "gap-3.5" : AUTH_TWEAKS.DENSITY === "comfy" ? "gap-6" : "gap-4",
        )}
        data-density={AUTH_TWEAKS.DENSITY}
      >
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Onboarding · paso opcional
          </div>
          <h1 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-foreground">
            {firstName ? `Asegura tu cuenta, ${firstName}` : "Asegura tu cuenta"}
          </h1>
          <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">
            {remaining === 0
              ? "Todo listo. Igual puedes editar cualquiera de tus métodos."
              : "Agrega más formas de iniciar sesión. Puedes hacerlas en cualquier orden o saltártelas — se quedan disponibles en tu cuenta."}
          </p>
        </div>

        {/* <ObProgress methods={state.methods} meter /> */}

        <div className="flex flex-col gap-2">
          {sorted.map((id) => {
            const meta = METHOD_CATALOG[id];
            const status = state.methods[id];
            const isRecommended = id === AUTH_TWEAKS.OB_RECOMMENDED && status === "pending";
            const isDone = status === "done";
            const isSkipped = status === "skipped";
            return (
              <Link
                key={id}
                href={ROUTE(ONBOARDING_METHOD_PATH(id), { locale })}
                className={cn(
                  "grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border bg-background px-3.5 py-3 text-left text-foreground no-underline transition-colors hover:bg-accent",
                  isRecommended && "border-foreground/50",
                  isDone && "border-solid bg-muted/35",
                  isSkipped && "border-dashed",
                )}
                data-status={status}
                data-recommended={isRecommended ? "true" : "false"}
              >
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-[9px] bg-muted text-foreground",
                    (isDone || isRecommended) && "bg-foreground text-background",
                  )}
                >
                  <meta.Icon size={16} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm font-medium text-foreground", isDone && "text-muted-foreground")}>
                      {meta.label}
                    </span>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-[5px] py-px text-tiny font-semibold uppercase tracking-[0.02em] text-background">
                        <Star size={9} /> Recomendado
                      </span>
                    )}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full border px-[5px] py-px text-tiny font-semibold uppercase tracking-[0.02em] text-muted-foreground">
                        <Check size={10} /> Listo
                      </span>
                    )}
                    {isSkipped && <span className="text-xs text-muted-foreground">Saltado · puedes volver</span>}
                  </span>
                  <span className="text-[12.5px] leading-[1.45] text-muted-foreground text-pretty">{meta.desc}</span>
                </span>
                <span className="inline-flex items-center justify-end self-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-muted px-2.5 py-1.5 text-[12.5px] font-medium text-foreground",
                      isDone && "bg-transparent text-muted-foreground",
                    )}
                  >
                    {isDone ? "Editar" : isSkipped ? "Hacer ahora" : "Agregar"}
                    {!isDone && <ArrowRight size={13} />}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <form action={actionFinishOnboarding} className="mt-1 flex flex-col border-t pt-3">
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full text-[13.5px] text-muted-foreground hover:text-foreground"
          >
            <span>{done > 0 ? "Continuar a la app" : "Saltar todo — lo configuro después"}</span>
            <ArrowRight size={15} />
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
