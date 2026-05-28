import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { METHOD_CATALOG } from "./_components/method-catalog";
import { ObProgress } from "./_components/ob-progress";
import { actionFinishOnboarding } from "./actions";
import { COUNT_DONE, METHOD_ORDER, type OnboardingMethodId, type OnboardingMethodStatus } from "./state";
import { getViewerOnboardingState } from "./state.server";

// Hub sort: recommended-pending → pending → skipped → done. Done sinks to the bottom.
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

  // TODO: overkill, AUTH_TWEAKS recomed is always passkey. you can make it a constant in this file.
  const sorted: OnboardingMethodId[] = [...METHOD_ORDER].sort((a, b) => {
    const recA =
      a === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[a] === "pending" ? 0 : STATUS_ORDER[state.methods[a]];
    const recB =
      b === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[b] === "pending" ? 0 : STATUS_ORDER[state.methods[b]];
    return recA - recB;
  });

  return (
    <div className="sc-step" data-density={AUTH_TWEAKS.DENSITY}>
      <div className="ob-header">
        <div className="ob-eyebrow">Onboarding · paso opcional</div>
        <h1 className="ob-title">{firstName ? `Asegura tu cuenta, ${firstName}` : "Asegura tu cuenta"}</h1>
        <p className="ob-subtitle">
          {remaining === 0
            ? "Todo listo. Igual puedes editar cualquiera de tus métodos."
            : "Agrega más formas de iniciar sesión. Puedes hacerlas en cualquier orden o saltártelas — se quedan disponibles en tu cuenta."}
        </p>
      </div>

      <ObProgress methods={state.methods} />

      <div className="ob-list">
        {sorted.map((id) => {
          const meta = METHOD_CATALOG[id];
          const status = state.methods[id];
          const isRecommended = id === AUTH_TWEAKS.OB_RECOMMENDED && status === "pending";
          const isDone = status === "done";
          const isSkipped = status === "skipped";
          return (
            <Link
              key={id}
              href={`/${locale}/auth/onboarding/${id}`}
              className="ob-card"
              data-status={status}
              data-recommended={isRecommended ? "true" : "false"}
            >
              <span className="ob-card-icon">
                <meta.Icon size={16} />
              </span>
              <span className="ob-card-body">
                <span className="ob-card-row">
                  <span className="ob-card-title">{meta.label}</span>
                  {isRecommended && (
                    <span className="ob-card-badge ob-card-badge-recommended">
                      <Star size={10} /> Recomendado
                    </span>
                  )}
                  {isDone && (
                    <span className="ob-card-badge ob-card-badge-done">
                      <Check size={10} /> Listo
                    </span>
                  )}
                  {isSkipped && <span className="ob-card-badge ob-card-badge-skipped">Saltado · puedes volver</span>}
                </span>
                <span className="ob-card-desc">{meta.desc}</span>
              </span>
              <span className="ob-card-arrow">
                <span className="ob-card-cta">
                  {isDone ? "Editar" : isSkipped ? "Hacer ahora" : "Agregar"}
                  {!isDone && <ArrowRight size={13} />}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <form action={actionFinishOnboarding} className="ob-footer">
        <button type="submit" className="sc-btn sc-btn-outline sc-btn-block ob-skip-cta">
          <span>{done > 0 ? "Continuar a la app" : "Saltar todo — lo configuro después"}</span>
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
