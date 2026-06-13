import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { getRosetta } from "~/lib/i18n.server";
import { ProfileForm } from "./profile-form";

export default async function AccountProfilePage(props: PageProps<"/home/account/profile">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const supabase = await createServerClient();
  const [profileResult, avatarResult] = await Promise.all([
    supabase.from("profiles").select("profile_name_full").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("storage_profiles")
      .select("src")
      .eq("profile_id", user.id)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const name = profileResult.data?.["profile_name_full"] ?? "";
  const avatarSrc = avatarResult.data?.["src"]
    ? new URL(avatarResult.data["src"], process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString()
    : null;

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-[0.08em] uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <div className="flex flex-col gap-3.5">
        <ProfileAvatarControls profileId={user.id} name={name} avatarSrc={avatarSrc} />

        <ProfileForm profile_id={user.id} defaultValue={name} />
      </div>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Cuenta · Perfil",
  heading: "Tu perfil",
  description: "Esto es lo que verán tus compañeros dentro de las organizaciones. Puedes cambiarlo cuando quieras.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Account · Profile",
  heading: "Your profile",
  description: "This is what your teammates will see across organizations. You can change it at any time.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Conta · Perfil",
  heading: "Seu perfil",
  description: "É o que seus colegas verão dentro das organizações. Você pode alterar quando quiser.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
