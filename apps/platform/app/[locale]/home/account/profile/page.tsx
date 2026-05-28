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

export default async function AccountProfilePage(props: PageProps<"/[locale]/home/account/profile">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth`);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: ProfileSectionPageQuery });
  const name = data?.["profile"]?.["profile_name_full"] ?? "";

  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Cuenta · Perfil</span>
        <h1 className="acc-section-title">Tu perfil</h1>
        <p className="acc-section-sub">
          Esto es lo que verán tus compañeros dentro de las organizaciones. Puedes cambiarlo cuando quieras.
        </p>
      </header>

      <div className="acc-form">
        <div className="ob-avatar-row">
          <div className="ob-avatar-slot" data-empty={name.trim().length === 0 ? "true" : "false"}>
            {INITIALS_OF(name)}
          </div>
          <div className="ob-avatar-actions">
            <button type="button" disabled>
              Subir foto
            </button>
            <button type="button" className="ghost" disabled>
              Quitar
            </button>
          </div>
        </div>
        <p className="ob-avatar-hint">Próximamente — por ahora usamos tus iniciales como avatar.</p>

        <ProfileForm profile_id={user.id} defaultValue={name} />
      </div>
    </div>
  );
}
