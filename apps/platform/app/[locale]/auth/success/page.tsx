import { Button } from "@packages/ui-common/shadcn/components/ui/button";
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
      <div className="relative flex flex-col items-center justify-center gap-[18px] px-2 pt-7 pb-2 text-center">
        <div className="inline-flex size-[76px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_8px] shadow-primary/[0.08]">
          <Check size={36} strokeWidth={2.6} />
        </div>
        <h1 className="m-0 text-[28px] font-semibold tracking-tight">
          {firstName ? `¡Listo, ${firstName}!` : "¡Listo!"}
        </h1>
        <p className="m-0 max-w-[360px] text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]">
          Tu cuenta quedó configurada. Ya puedes entrar a tus organizaciones o crear una nueva desde Inicio.
        </p>
        <div className="mt-2 flex w-full max-w-[280px] flex-col gap-2.5">
          <Button asChild className="h-10 w-full">
            <Link href={`/${locale}/home`}>
              <span>Ir a Inicio</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 w-full text-[12.5px] text-muted-foreground">
            <Link href={`/${locale}/home/account/profile`}>Revisar mi cuenta primero</Link>
          </Button>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles size={12} />
          <span>
            {done}/{total} métodos configurados
          </span>
        </div>
      </div>
    </AuthCard>
  );
}
