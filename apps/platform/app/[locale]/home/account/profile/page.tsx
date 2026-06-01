import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ProfileForm } from "./profile-form";

const ProfileSectionPageQuery = gql(`
  query ProfileSectionPageQuery {
    profile: viewer_profile {
      profile_id
      profile_name_full
    }
  }
`);

function INITIALS_OF(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default async function AccountProfilePage(_props: PageProps<"/[locale]/home/account/profile">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/[locale]/auth");

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: ProfileSectionPageQuery });
  const name = data?.["profile"]?.["profile_name_full"] ?? "";

  return (
    <div className="flex max-w-[720px] flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase">
          Cuenta · Perfil
        </span>
        <h1 className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">Tu perfil</h1>
        <p className="text-muted-foreground text-[13px] leading-relaxed text-pretty">
          Esto es lo que verán tus compañeros dentro de las organizaciones. Puedes cambiarlo cuando quieras.
        </p>
      </header>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-4">
          <div className="bg-muted text-muted-foreground inline-flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border text-[30px] font-semibold tracking-[-0.02em]">
            {INITIALS_OF(name)}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              disabled
              className="bg-background text-foreground hover:bg-accent inline-flex h-[34px] items-center rounded-md border px-3 text-[13px] disabled:opacity-50"
            >
              Subir foto
            </button>
            <button
              type="button"
              disabled
              className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-7 items-center self-start rounded-md px-2 text-[12.5px] disabled:opacity-50"
            >
              Quitar
            </button>
          </div>
        </div>
        <p className="text-muted-foreground text-[11.5px] leading-snug">
          Próximamente — por ahora usamos tus iniciales como avatar.
        </p>

        <ProfileForm profile_id={user.id} defaultValue={name} />
      </div>
    </div>
  );
}
