import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Eye } from "lucide-react";
import type { Metadata } from "next";
import { gql } from "~/generated/graphql";
import { getViewerAgencyBySlug, getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";

const AgencyOverviewPageQuery = gql(`
  query AgencyOverviewPageQuery($agencyId: Int!) {
    activeMemberships: viewerAgencyMemberships(
      agencyId: $agencyId
      filter: {
        agencyMembershipAcceptedAt: { is: NOT_NULL }
        agencyMembershipRevokedAt: { is: NULL }
        agencyMembershipRejectedAt: { is: NULL }
      }
    ) {
      totalCount
    }
    pendingMemberships: viewerAgencyMemberships(
      agencyId: $agencyId
      filter: {
        agencyMembershipAcceptedAt: { is: NULL }
        agencyMembershipRevokedAt: { is: NULL }
        agencyMembershipRejectedAt: { is: NULL }
      }
    ) {
      totalCount
    }
    grants: agenciesOrganizationsGrantsCollection(
      filter: { agencyId: { eq: $agencyId } }
      first: 250
    ) {
      edges {
        node {
          organizationId
          permissionId
        }
      }
    }
  }
`);

export async function generateMetadata(props: PageProps<"/a/[agency_slug]">): Promise<Metadata> {
  const { agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);
  const { data } = await getViewerAgencyBySlug(agency_slug);
  return { title: data?.["agency"]?.["agencyName"] ?? t("page_title") };
}

export default async function AgencyOverviewPage(props: PageProps<"/a/[agency_slug]">) {
  const { agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);

  // Re-fetch the cached, RLS-scoped agency row (deduped with the layout's fetch).
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  const graphy = await getGraphySession();
  const { data: statsData } = await graphy.query({
    query: AgencyOverviewPageQuery,
    variables: { agencyId: agency["agencyId"] },
  });

  const active = statsData?.["activeMemberships"]?.["totalCount"] ?? 0;
  const pending = statsData?.["pendingMemberships"]?.["totalCount"] ?? 0;

  const grantEdges = statsData?.["grants"]?.["edges"] ?? [];
  const isGlobal = grantEdges.some((e) => e["node"]["organizationId"] === null && e["node"]["permissionId"] === "*");
  const count = grantEdges.filter((e) => e["node"]["organizationId"] !== null).length;

  const stats = [
    {
      label: t("stat_affiliates"),
      value: String(active),
      sub: pending > 0 ? t("stat_pending", { count: pending }) : t("stat_up_to_date"),
    },
    {
      label: t("stat_orgs"),
      value: isGlobal ? t("stat_all") : String(count),
      sub: isGlobal ? t("stat_global_scope") : t("stat_granted_you"),
    },
    { label: t("stat_access_level"), value: t("stat_read"), sub: t("stat_never_writes") },
  ];

  const rows = [
    { label: t("profile_name"), value: agency["agencyName"] },
    { label: t("profile_slug"), value: agency["agencySlug"], mono: true },
    {
      label: t("profile_status"),
      value: agency["agencyDeletedAt"] ? t("profile_disabled") : t("profile_active"),
    },
  ];

  return (
    <div className="px-4 py-5 pb-8 @3xl:px-6 @3xl:py-6 @3xl:pb-10">
      <div className="mx-auto flex w-full max-w-205 flex-col gap-6">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-border bg-background flex flex-col gap-0.5 rounded-lg border px-3.5 py-3"
            >
              <span className="text-muted-foreground truncate text-tiny font-semibold uppercase tracking-wider">
                {s.label}
              </span>
              <span className="text-foreground text-lg font-semibold leading-tight tracking-tight tabular-nums">
                {s.value}
              </span>
              <span className="text-muted-foreground truncate text-xs">{s.sub}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-foreground m-0 text-lg font-semibold tracking-tight">{t("profile_title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-xs leading-normal text-pretty">
            {t("profile_desc")}
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="border-border bg-background grid items-center gap-3 rounded-md border px-3.5 py-2.5"
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <span className="text-muted-foreground text-xs font-medium">{row.label}</span>
                <span className={cn("text-foreground text-sm/normal", row.mono && "font-mono text-xs")}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
            <span className="text-muted-foreground/80 mt-px shrink-0">
              <Eye size={13} />
            </span>
            <span className="text-pretty">{t("profile_note")}</span>
          </p>
        </section>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  page_title: "Consola de agencia",
  stat_affiliates: "Afiliados activos",
  stat_pending: "{{count}} pendientes",
  stat_up_to_date: "al día",
  stat_orgs: "Organizaciones",
  stat_all: "Todas",
  stat_global_scope: "alcance global",
  stat_granted_you: "te dieron acceso",
  stat_access_level: "Nivel de acceso",
  stat_read: "Lectura",
  stat_never_writes: "nunca escribe",
  profile_title: "Perfil de la agencia",
  profile_desc: "Cómo se ve tu agencia para las organizaciones que la habilitan.",
  profile_name: "Nombre",
  profile_slug: "Identificador",
  profile_status: "Estado",
  profile_active: "Activa",
  profile_disabled: "Deshabilitada",
  profile_note: "Para cambiar el nombre o el identificador de la agencia, escríbenos.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency console",
  stat_affiliates: "Active affiliates",
  stat_pending: "{{count}} pending",
  stat_up_to_date: "up to date",
  stat_orgs: "Organizations",
  stat_all: "All",
  stat_global_scope: "global scope",
  stat_granted_you: "gave you access",
  stat_access_level: "Access level",
  stat_read: "Read",
  stat_never_writes: "never writes",
  profile_title: "Agency profile",
  profile_desc: "How your agency looks to the organizations that enable it.",
  profile_name: "Name",
  profile_slug: "Identifier",
  profile_status: "Status",
  profile_active: "Active",
  profile_disabled: "Disabled",
  profile_note: "To change the agency name or identifier, write to us.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Console da agência",
  stat_affiliates: "Afiliados ativos",
  stat_pending: "{{count}} pendentes",
  stat_up_to_date: "em dia",
  stat_orgs: "Organizações",
  stat_all: "Todas",
  stat_global_scope: "alcance global",
  stat_granted_you: "lhe deram acesso",
  stat_access_level: "Nível de acesso",
  stat_read: "Leitura",
  stat_never_writes: "nunca escreve",
  profile_title: "Perfil da agência",
  profile_desc: "Como sua agência aparece para as organizações que a habilitam.",
  profile_name: "Nome",
  profile_slug: "Identificador",
  profile_status: "Status",
  profile_active: "Ativa",
  profile_disabled: "Desabilitada",
  profile_note: "Para alterar o nome ou o identificador da agência, escreva para nós.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
