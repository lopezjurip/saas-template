import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { INITIALS_OF } from "@packages/utils/string";
import { ChevronRight, ShieldCheck, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { PendingInvitations } from "./pending-invitations";

/**
 * Active members + pending invites for an org, with each membership's permission grants nested
 * via the FK relationship — one typed query replacing two service-role table selects + a manual
 * join. RLS gates rows: a `members_manage` co-member sees their org's memberships and grants.
 * Member emails live in `auth.users` (not here) and are fetched separately via the auth admin API.
 * @example
 * const { data } = await graphy.query({ query: MembersAdminPageQuery, variables: { organizationId } });
 */
const MembersAdminPageQuery = /*#__PURE__*/ gql(`
  query MembersAdminPageQuery(
    $filter: OrganizationMembershipsFilter
    $orderBy: [OrganizationMembershipsOrderBy!] = [{ organizationMembershipCreatedAt: AscNullsLast }]
    $first: Int = 250
  ) {
    memberships: organizationMembershipsCollection(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          organizationMembershipId
          profileId
          organizationMembershipInviteEmail
          organizationMembershipInvitePhone
          organizationMembershipInviteAddressLevel0Id
          organizationMembershipInviteDocumentKind
          organizationMembershipInviteDocumentValue
          organizationMembershipInviteExpiresAt
          organizationMembershipAcceptedAt
          organizationMembershipCreatedAt
          profile { profileNameFull }
          organizationMembershipPermissionsCollection(first: 250) {
            edges { node { permissionId } }
          }
        }
      }
    }
  }
`);

/** Flattens a membership node's nested permission grants into a slug list. */
function GRANTS_OF(node: {
  organizationMembershipPermissionsCollection?: { edges: { node: { permissionId: string } }[] } | null;
}): string[] {
  return (node["organizationMembershipPermissionsCollection"]?.["edges"] ?? []).map((e) => e["node"]["permissionId"]);
}

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function MembersAdminPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members">,
) {
  const { tenant_slug, organization_id: organization_id_param } = await props.params;
  const locale = await getServerLocale();
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseServiceRoleClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewer_profile_id = user?.id ?? null;

  /** viewer_has_permission is SECURITY DEFINER and honors '*' as a match. */
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    organization_id: organization_id,
    permission_id: "members_manage",
  });

  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <Alert variant="destructive">
          <AlertDescription>{t("no_permission_alert")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  /**
   * organization_memberships models both ACTIVE members and PENDING invites — split here.
   * Permission grants arrive nested per membership via the FK relationship.
   */
  const graphy = await getGraphySession();
  const { data, error } = await graphy.query({
    query: MembersAdminPageQuery,
    variables: {
      filter: {
        organizationId: { eq: organization_id },
        organizationMembershipRevokedAt: { is: FilterIs.Null },
        organizationMembershipRejectedAt: { is: FilterIs.Null },
      },
    },
  });
  if (error) throw error;
  const membershipNodes = (data?.["memberships"]?.["edges"] ?? []).map((e) => e["node"]);

  const activeOrganizationOrganizationMemberships = membershipNodes.filter(
    (m) => m["profileId"] && m["organizationMembershipAcceptedAt"],
  );
  const pendingOrganizationOrganizationMemberships = membershipNodes.filter(
    (m) => !m["profileId"] && !m["organizationMembershipAcceptedAt"],
  );

  /**
   * Emails for member profiles (auth.users; not in profiles table). One paginated call
   * instead of N round-trips — Supabase admin rate-limits `getUserById`.
   */
  const memberProfileIds = new Set(activeOrganizationOrganizationMemberships.map((m) => m["profileId"]));
  const profileEmailById = new Map<string, string | null>();
  if (memberProfileIds.size > 0) {
    const usersRes = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!usersRes.error) {
      for (const u of usersRes.data.users) {
        if (memberProfileIds.has(u["id"])) {
          profileEmailById.set(u["id"], u["email"] ?? null);
        }
      }
    }
  }

  const activeRows = activeOrganizationOrganizationMemberships.map((m) => {
    const grants = GRANTS_OF(m);
    const has_wildcard = grants.includes("*");
    const slugs = grants.filter((g) => g !== "*");
    const profile_id = m["profileId"] ?? "";
    return {
      organization_membership_id: m["organizationMembershipId"],
      profile_id,
      profile_name_full: m["profile"]?.["profileNameFull"] ?? null,
      email: profileEmailById.get(profile_id) ?? null,
      has_wildcard,
      permission_count: slugs.length,
      is_self: profile_id === viewer_profile_id,
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-6 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
            {organization["organizationName"]} · {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("page_title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link
            href={ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/new", {
              tenant_slug,
              organization_id,
            })}
          >
            <UserPlus className="h-4 w-4" />
            {t("invite_button")}
          </Link>
        </Button>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("members_heading")}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">{activeRows.length}</span>
        </div>
        {activeRows.length === 0 ? (
          <p className="text-muted-foreground px-1 text-xs">{t("members_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeRows.map((m) => {
              const name = m["profile_name_full"] ?? m["email"] ?? m["profile_id"].slice(0, 8);
              return (
                <Link
                  key={m["organization_membership_id"]}
                  href={ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit", {
                    tenant_slug,
                    organization_id,
                    organization_membership_id: m["organization_membership_id"],
                  })}
                  className="group border-border bg-background hover:bg-accent/60 hover:border-foreground/25 grid grid-cols-[36px_1fr_auto_auto] items-center gap-3 rounded-md border px-3.5 py-3 transition-[background,border-color]"
                >
                  <MemberAvatar name={name} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="text-foreground truncate text-sm font-medium">{name}</span>
                      {m["is_self"] ? (
                        <span className="bg-foreground text-background shrink-0 rounded-full px-1.5 py-0.5 text-tiny font-semibold uppercase leading-none tracking-[0.04em]">
                          {t("self")}
                        </span>
                      ) : null}
                    </span>
                    {m["email"] && m["email"] !== name ? (
                      <span className="text-muted-foreground truncate text-xs">{m["email"]}</span>
                    ) : null}
                  </span>
                  {m["has_wildcard"] ? (
                    <Badge>{t("full_access_badge")}</Badge>
                  ) : m["permission_count"] === 0 ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t("no_permissions")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{t("permissions_count", { count: m["permission_count"] })}</Badge>
                  )}
                  <span className="text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("pending_heading")}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {pendingOrganizationOrganizationMemberships.length}
          </span>
        </div>
        <PendingInvitations
          locale={locale}
          tenantSlug={tenant_slug}
          organizationId={organization_id}
          invitations={pendingOrganizationOrganizationMemberships.map((i) => ({
            organization_membership_id: i["organizationMembershipId"],
            invitation_email: i["organizationMembershipInviteEmail"] ?? null,
            invitation_phone: i["organizationMembershipInvitePhone"] ?? null,
            invitation_address_level0_id: i["organizationMembershipInviteAddressLevel0Id"] ?? null,
            invitation_document_kind: i["organizationMembershipInviteDocumentKind"] ?? null,
            invitation_document_value: i["organizationMembershipInviteDocumentValue"] ?? null,
            invitation_permission_slugs: GRANTS_OF(i),
            invitation_created_at: i["organizationMembershipCreatedAt"],
            invitation_expires_at: i["organizationMembershipInviteExpiresAt"] ?? null,
          }))}
        />
        {pendingOrganizationOrganizationMemberships.length > 0 ? (
          <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs/normal">
            <span className="text-muted-foreground/80 mt-px shrink-0">
              <ShieldCheck size={13} />
            </span>
            <span className="text-pretty">{t("pre_accept_note")}</span>
          </p>
        ) : null}
      </section>
    </div>
  );
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <span className="bg-muted text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-[-0.01em]">
      {INITIALS_OF(name)}
    </span>
  );
}

const LOCALE_ES = {
  page_title: "Miembros",
  eyebrow: "Equipo",
  subtitle:
    "Quién tiene acceso a esta organización y con qué permisos. Invita por correo, teléfono o documento — y ajusta lo que cada quien puede hacer.",
  no_permission_alert: "No tienes permiso para administrar miembros en esta organización.",
  members_heading: "Miembros activos",
  members_empty: "Esta organización aún no tiene miembros activos.",
  pending_heading: "Invitaciones pendientes",
  pre_accept_note:
    "Los permisos que asignes a una invitación se aplican en el momento exacto en que la persona acepta. Puedes ajustarlos antes.",
  invite_button: "Invitar",
  self: "Tú",
  full_access_badge: "Acceso completo",
  permissions_count: "{{count}} permisos",
  no_permissions: "sin permisos",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Members",
  eyebrow: "Team",
  subtitle:
    "Who has access to this organization and with which permissions. Invite by email, phone or document — and adjust what each person can do.",
  no_permission_alert: "You don't have permission to manage members in this organization.",
  members_heading: "Active members",
  members_empty: "This organization has no active members yet.",
  pending_heading: "Pending invitations",
  pre_accept_note:
    "The permissions you assign to an invitation apply the exact moment the person accepts. You can adjust them beforehand.",
  invite_button: "Invite",
  self: "You",
  full_access_badge: "Full access",
  permissions_count: "{{count}} permissions",
  no_permissions: "no permissions",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Membros",
  eyebrow: "Equipe",
  subtitle:
    "Quem tem acesso a esta organização e com quais permissões. Convide por e-mail, telefone ou documento — e ajuste o que cada um pode fazer.",
  no_permission_alert: "Você não tem permissão para administrar membros nesta organização.",
  members_heading: "Membros ativos",
  members_empty: "Esta organização ainda não tem membros ativos.",
  pending_heading: "Convites pendentes",
  pre_accept_note:
    "As permissões que você atribui a um convite são aplicadas no momento exato em que a pessoa aceita. Você pode ajustá-las antes.",
  invite_button: "Convidar",
  self: "Você",
  full_access_badge: "Acesso completo",
  permissions_count: "{{count}} permissões",
  no_permissions: "sem permissões",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
