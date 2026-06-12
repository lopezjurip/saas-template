import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FloatingChrome } from "~/components/floating-chrome";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROUTE } from "~/lib/route";
import { COUNT_DONE, METHOD_ORDER } from "../../auth/onboarding/state";
import { getViewerOnboardingState } from "../../auth/onboarding/state.server";
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

/**
 * /home is always the picker now (no single-org auto-redirect). The picker shows
 * every organization_membership as a big tile plus a "nueva organización" tile pointing at
 * /tenants/create. A banner nudges back to onboarding if any method is pending.
 */
export default async function HomePage(props: PageProps<"/[locale]/home">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/[locale]/auth?next=${encodeURIComponent("/[locale]/home")}`);

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
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden bg-background">
      <Link
        href={ROUTE("/[locale]", { locale })}
        aria-label="SaaS Template"
        className="absolute top-4 left-4 z-10 inline-block transition-opacity hover:opacity-80"
      >
        <Logo />
      </Link>
      <div className="flex flex-1 items-center justify-center px-6 pt-6 pb-24">
        <div className="flex w-full max-w-[1040px] flex-col items-center gap-7 text-center">
          <div className="flex flex-col gap-1.5 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Inicio</span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-foreground">{greeting}</h1>
            <p className="text-[13.5px] leading-normal text-muted-foreground text-pretty">
              Elige una para empezar. También puedes crear una nueva organización.
            </p>
          </div>

          {obIncomplete && (
            <div className="grid w-full max-w-[520px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-dashed bg-muted/35 px-3.5 py-3">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles size={13} />
              </span>
              <span className="flex min-w-0 flex-col gap-px text-left">
                <span className="text-[13.5px] font-medium text-foreground">Termina tu onboarding</span>
                <span className="text-xs text-muted-foreground">
                  {obDone} de {obTotal} métodos listos
                </span>
              </span>
              <Link
                href={ROUTE("/[locale]/auth/onboarding", { locale })}
                className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md border bg-background px-3 text-[12.5px] font-medium text-foreground hover:bg-accent"
              >
                Continuar
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-[22px]">
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
                <Link
                  key={organization["organization_id"]}
                  href={ROUTE("/[locale]/t/[tenant_slug]", { locale, tenant_slug })}
                  className="group flex w-[140px] flex-col items-center gap-2.5 rounded-[14px] px-1 py-2 text-foreground transition-transform duration-150 hover:translate-y-[-3px] hover:bg-muted/50"
                >
                  <span
                    className="inline-flex size-28 items-center justify-center rounded-[18px] border text-4xl font-semibold tracking-[-0.02em] transition-shadow duration-150 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                    style={{
                      background: `hsl(${hue} 60% 92%)`,
                      color: `hsl(${hue} 55% 28%)`,
                      borderColor: `hsl(${hue} 30% 80%)`,
                    }}
                  >
                    {initials}
                  </span>
                  <span className="text-center text-[13.5px] font-medium text-balance">{name}</span>
                  <span className="-mt-1 text-xs text-muted-foreground">{tenant?.["tenant_name"] ?? "—"}</span>
                </Link>
              );
            })}
            <Link
              href={ROUTE("/[locale]/tenants/create", { locale })}
              className="group flex w-[140px] flex-col items-center gap-2.5 rounded-[14px] px-1 py-2 text-foreground transition-transform duration-150 hover:translate-y-[-3px] hover:bg-muted/50"
            >
              <span className="inline-flex size-28 items-center justify-center rounded-[18px] border border-dashed bg-background text-muted-foreground transition-colors duration-150 group-hover:bg-muted/40 group-hover:text-foreground">
                <Plus size={36} />
              </span>
              <span className="text-center text-[13.5px] font-medium text-balance">Nueva organización</span>
              <span className="-mt-1 text-xs text-muted-foreground">Empieza desde cero</span>
            </Link>
          </div>
        </div>
      </div>

      <FloatingChrome />
      <UserMenu locale={locale} name={state.profile_name_full} email={state.email ?? user["email"] ?? ""} />
    </div>
  );
}
