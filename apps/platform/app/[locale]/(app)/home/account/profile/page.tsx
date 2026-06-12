import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { ProfileForm } from "./profile-form";

export default async function AccountProfilePage(props: PageProps<"/[locale]/home/account/profile">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/[locale]/auth");

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

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase">
          Cuenta · Perfil
        </span>
        <h1 className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">Tu perfil</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">
          Esto es lo que verán tus compañeros dentro de las organizaciones. Puedes cambiarlo cuando quieras.
        </p>
      </header>

      <div className="flex flex-col gap-3.5">
        <ProfileAvatarControls profileId={user.id} name={name} avatarSrc={avatarSrc} />

        <ProfileForm profile_id={user.id} defaultValue={name} />
      </div>
    </div>
  );
}
