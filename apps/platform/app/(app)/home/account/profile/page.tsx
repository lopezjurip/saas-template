import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { ProfileForm } from "./profile-form";

/**
 * Viewer's display name plus latest avatar in one round-trip — the avatar nests through the
 * `storage_profiles` relationship on Profiles (RLS-scoped).
 */
const AccountProfilePageQuery = /*#__PURE__*/ gql(`
  query AccountProfilePageQuery {
    profile: viewerProfile {
      profileNameFull
      avatar: storage_profiles(
        filter: { folder: { eq: "avatar" } }
        orderBy: [{ createdAt: DescNullsLast }]
        first: 1
      ) {
        edges {
          node {
            src
          }
        }
      }
    }
  }
`);

export default async function AccountProfilePage(props: PageProps<"/home/account/profile">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: AccountProfilePageQuery });

  const profile = data?.["profile"] ?? null;
  const name = profile?.["profileNameFull"] ?? "";
  const avatarRaw = profile?.["avatar"]?.["edges"]?.[0]?.["node"]?.["src"] ?? null;
  const avatarSrc = avatarRaw ? new URL(avatarRaw, process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString() : null;

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-widest uppercase">
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
