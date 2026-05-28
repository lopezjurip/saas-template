import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { COUNT_DONE, METHOD_ORDER } from "../auth/onboarding/state";
import { getViewerOnboardingState } from "../auth/onboarding/state.server";
import { UserMenu } from "./_components/user-menu";

const HomePickerPageQuery = gql(`
  query HomePickerPageQuery {
    viewer_organizations(
      filter: { organization_disabled_at: { is: NULL } }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          organization_id
          organization_name
          organization_slug
          tenants {
            tenant_id
            tenant_slug
            tenant_name
          }
        }
      }
    }
  }
`);

// /home is always the picker now (no single-org auto-redirect). The picker shows
// every membership as a big tile plus a "nueva organización" tile pointing at
// /tenants/create. A banner nudges back to onboarding if any method is pending.
export default async function HomePage(props: PageProps<"/[locale]/home">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(`/${locale}/home`)}`);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: HomePickerPageQuery });
  const edges = data?.["viewer_organizations"]?.["edges"] ?? [];

  const state = await getViewerOnboardingState();
  const obDone = COUNT_DONE(state.methods);
  const obTotal = METHOD_ORDER.length;
  const obIncomplete = obDone < obTotal;
  const firstName = state.profile_name_full?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName
    ? `¿Con qué organización entramos hoy, ${firstName}?`
    : "¿Con qué organización entramos hoy?";

  return (
    <div className="home-shell" data-variant="picker">
      <div className="home-main" data-variant="picker">
        <div className="home-stack" data-variant="picker">
          <div className="home-header">
            <span className="eyebrow">Inicio</span>
            <h1>{greeting}</h1>
            <p>Elige una para empezar. También puedes crear una nueva organización.</p>
          </div>

          {obIncomplete && (
            <div className="home-banner" style={{ maxWidth: 520, width: "100%" }}>
              <span className="home-banner-dot">
                <Sparkles size={13} />
              </span>
              <span className="home-banner-body">
                <span className="home-banner-title">Termina tu onboarding</span>
                <span className="home-banner-sub">
                  {obDone} de {obTotal} métodos listos
                </span>
              </span>
              <Link href={`/${locale}/auth/onboarding`}>
                Continuar
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          <div className="home-picker-grid">
            {edges.map((edge) => {
              const organization = edge["node"];
              const tenant = organization["tenants"];
              const tenant_slug = tenant?.["tenant_slug"];
              if (!tenant_slug) return null;
              const name = organization["organization_name"];
              const hue = Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
              const initials =
                name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase() || "·";
              return (
                <Link key={organization["organization_id"]} href={`/${locale}/${tenant_slug}`} className="org-tile">
                  <span
                    className="org-tile-mark"
                    style={{
                      background: `hsl(${hue} 60% 92%)`,
                      color: `hsl(${hue} 55% 28%)`,
                      borderColor: `hsl(${hue} 30% 80%)`,
                    }}
                  >
                    {initials}
                  </span>
                  <span className="org-tile-name">{name}</span>
                  <span className="org-tile-meta">{tenant?.["tenant_name"] ?? "—"}</span>
                </Link>
              );
            })}
            <Link href={`/${locale}/tenants/create`} className="org-tile add">
              <span className="org-tile-mark">
                <Plus size={36} />
              </span>
              <span className="org-tile-name">Nueva organización</span>
              <span className="org-tile-meta">Empieza desde cero</span>
            </Link>
          </div>
        </div>
      </div>

      <UserMenu locale={locale} name={state.profile_name_full} email={state.email ?? user["email"] ?? ""} />
    </div>
  );
}
