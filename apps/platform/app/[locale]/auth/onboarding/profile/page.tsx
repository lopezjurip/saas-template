import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { ProfileForm } from "./profile-form";

export default async function OnboardingProfilePage(_props: PageProps<"/[locale]/auth/onboarding/profile">) {
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell
          methods={state.methods}
          current="profile"
          title="Tu perfil"
          subtitle="Tus compañeros de equipo te verán así. Puedes cambiarlo cuando quieras desde Ajustes."
        >
          <ProfileForm
            profile_id={state.profile_id}
            defaultName={state.profile_name_full}
            identityValue={state.email ?? state.phone ?? ""}
          />
        </StepShell>
      </div>
    </AuthCard>
  );
}
