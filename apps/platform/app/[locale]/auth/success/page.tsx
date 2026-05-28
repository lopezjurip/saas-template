import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "../_components/auth-card";
import { COUNT_DONE, METHOD_ORDER } from "../onboarding/state";
import { getViewerOnboardingState } from "../onboarding/state.server";

// /auth/success is what the magic-link / OAuth callback can land users on for a moment
// of celebration before throwing them at /home. The page is read-only; it doesn't write
// `profile_onboarded_at` (the hub's "continuar" button does that).

export default async function AuthSuccessPage(props: PageProps<"/[locale]/auth/success">) {
  const { locale } = await props.params;
  const state = await getViewerOnboardingState();
  const firstName = state.profile_name_full?.trim().split(/\s+/)[0] ?? "";
  const done = COUNT_DONE(state.methods);
  const total = METHOD_ORDER.length;

  return (
    <AuthCard className="max-w-[460px]">
      <div className="sx-wrap">
        <div className="sx-mark">
          <Check size={36} strokeWidth={2.6} />
        </div>
        <h1 className="sx-title">{firstName ? `¡Listo, ${firstName}!` : "¡Listo!"}</h1>
        <p className="sx-sub">
          Tu cuenta quedó configurada. Ya puedes entrar a tus organizaciones o crear una nueva desde Inicio.
        </p>
        <div className="sx-cta">
          <Link href={`/${locale}/home`} className="sc-btn sc-btn-primary sc-btn-block">
            <span>Ir a Inicio</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href={`/${locale}/home/account/profile`}
            className="sc-btn sc-btn-ghost sc-btn-block"
            style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}
          >
            Revisar mi cuenta primero
          </Link>
        </div>
        <div className="sx-meta">
          <Sparkles size={12} />
          <span>
            {done}/{total} métodos configurados
          </span>
        </div>
      </div>
    </AuthCard>
  );
}
