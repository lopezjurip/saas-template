import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LocaleToggle } from "~/components/locale-toggle";
import { COLOR_HSL_FROM_NAME } from "~/components/shell/atoms";
import { ThemeToggle } from "~/components/theme-toggle";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
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

  const { t } = await getRosetta(LOCALES);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: HomePickerPageQuery });
  const edges = data?.["viewer_organizations"]?.["edges"] ?? [];

  const state = await getViewerOnboardingState();
  const obDone = COUNT_DONE(state.methods);
  const obTotal = METHOD_ORDER.length;
  const obIncomplete = obDone < obTotal;
  const firstName = state.profile_name_full?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? t("greetingWithName", { name: firstName }) : t("greeting");

  return (
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden bg-background">
      {/* Fixed top bar: logo left, locale+theme right — avoids overlap on mobile */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3">
        <Link
          href={ROUTE("/[locale]", { locale })}
          aria-label="SaaS Template"
          className="pointer-events-auto inline-block shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pt-16 pb-24">
        <div className="flex w-full max-w-260 flex-col items-center gap-7 text-center">
          <div className="flex flex-col gap-1.5 text-center">
            <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t("badge")}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{greeting}</h1>
            <p className="text-sm leading-normal text-muted-foreground text-pretty">{t("subtitle")}</p>
          </div>

          {obIncomplete && (
            <Link
              href={ROUTE("/[locale]/auth/onboarding", { locale })}
              className="flex w-full max-w-130 flex-col gap-3 rounded-md border border-dashed bg-muted/35 px-3.5 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                  <Sparkles size={13} />
                </span>
                <span className="flex min-w-0 flex-col gap-px text-left">
                  <span className="text-sm font-medium text-foreground">{t("onboardingTitle")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("onboardingProgress", { done: obDone, total: obTotal })}
                  </span>
                </span>
              </div>
              <span className="inline-flex h-8 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border bg-background px-3 text-xs font-medium text-foreground">
                {t("onboardingCta")}
                <ArrowRight size={13} />
              </span>
            </Link>
          )}

          <div className="flex flex-wrap justify-center gap-[22px]">
            {edges.map((edge) => {
              const organization = edge["node"];
              const tenant = organization["tenants"];
              const tenant_slug = tenant?.["tenant_slug"];
              if (!tenant_slug) return null;
              const name = organization["organization_name"];
              const initials = INITIALS_OF(name) || "·";
              const colorStyle = COLOR_HSL_FROM_NAME(name);
              return (
                <Link
                  key={organization["organization_id"]}
                  href={ROUTE("/[locale]/t/[tenant_slug]", { locale, tenant_slug })}
                  className="group flex w-35 flex-col items-center gap-2.5 rounded-2xl px-1 py-2 text-foreground transition-transform duration-150 hover:translate-y-[-3px] hover:bg-muted/50"
                >
                  <span
                    className="inline-flex size-28 items-center justify-center rounded-2xl border text-4xl font-semibold tracking-tight transition-shadow duration-150 group-hover:shadow-float"
                    style={{
                      backgroundColor: colorStyle.background,
                      color: colorStyle.color,
                      borderColor: colorStyle.borderColor,
                    }}
                  >
                    {initials}
                  </span>
                  <span className="text-center text-sm font-medium text-balance">{name}</span>
                  <span className="-mt-1 text-xs text-muted-foreground">{tenant?.["tenant_name"] ?? "—"}</span>
                </Link>
              );
            })}
            <Link
              href={ROUTE("/[locale]/tenants/create", { locale })}
              className="group flex w-35 flex-col items-center gap-2.5 rounded-2xl px-1 py-2 text-foreground transition-transform duration-150 hover:translate-y-[-3px] hover:bg-muted/50"
            >
              <span className="inline-flex size-28 items-center justify-center rounded-2xl border border-dashed bg-background text-muted-foreground transition-colors duration-150 group-hover:bg-muted/40 group-hover:text-foreground">
                <Plus size={36} />
              </span>
              <span className="text-center text-sm font-medium text-balance">{t("newOrg")}</span>
              <span className="-mt-1 text-xs text-muted-foreground">{t("newOrgSub")}</span>
            </Link>
          </div>
        </div>
      </div>

      <UserMenu locale={locale} name={state.profile_name_full} email={state.email ?? user["email"] ?? ""} />
    </div>
  );
}

const LOCALE_ES = {
  badge: "Inicio",
  greeting: "¿Con qué organización entramos hoy?",
  greetingWithName: "¿Con qué organización entramos hoy, {{name}}?",
  subtitle: "Elige una para empezar. También puedes crear una nueva organización.",
  onboardingTitle: "Termina tu onboarding",
  onboardingProgress: "{{done}} de {{total}} métodos listos",
  onboardingCta: "Continuar",
  newOrg: "Nueva organización",
  newOrgSub: "Empieza desde cero",
};

const LOCALE_EN: typeof LOCALE_ES = {
  badge: "Home",
  greeting: "Which organization are we jumping into today?",
  greetingWithName: "Which organization are we jumping into today, {{name}}?",
  subtitle: "Pick one to get started. You can also create a new organization.",
  onboardingTitle: "Finish your onboarding",
  onboardingProgress: "{{done}} of {{total}} methods ready",
  onboardingCta: "Continue",
  newOrg: "New organization",
  newOrgSub: "Start from scratch",
};

const LOCALE_PT: typeof LOCALE_ES = {
  badge: "Início",
  greeting: "Com qual organização vamos entrar hoje?",
  greetingWithName: "Com qual organização vamos entrar hoje, {{name}}?",
  subtitle: "Escolha uma para começar. Você também pode criar uma nova organização.",
  onboardingTitle: "Conclua seu onboarding",
  onboardingProgress: "{{done}} de {{total}} métodos prontos",
  onboardingCta: "Continuar",
  newOrg: "Nova organização",
  newOrgSub: "Comece do zero",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
