import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { getRosetta } from "~/hooks/get-rosetta";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { ProfileForm } from "./profile-form";

export default async function OnboardingProfilePage(props: PageProps<"/[locale]/auth/onboarding/profile">) {
  const { locale } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const state = await getViewerOnboardingState();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <StepShell methods={state.methods} current="profile" title={t("title")} subtitle={t("subtitle")}>
          <ProfileAvatarControls
            profileId={state.profile_id}
            name={state.profile_name_full}
            avatarSrc={state.profile_avatar_src}
          />
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

const LOCALE_ES = {
  title: "Tu perfil",
  subtitle: "Tus compañeros de equipo te verán así. Puedes cambiarlo cuando quieras desde Ajustes.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Your profile",
    subtitle: "Your teammates will see you like this. You can change it at any time from Settings.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Seu perfil",
    subtitle: "Seus colegas de equipe vão te ver assim. Você pode alterar a qualquer momento nas Configurações.",
  } satisfies typeof LOCALE_ES,
};
