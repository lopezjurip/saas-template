import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { EditPermissionsForm } from "./edit-form";

/**
 * Loads everything the permission editor needs in one typed query: the target membership (with
 * its profile name and current grants nested via FK), the full permission catalog, and the presets
 * available to this org (global + org-scoped). RLS gates rows for a `members_manage` co-member.
 * The member's email lives in `auth.users` and is fetched separately via the auth admin API.
 */
const OrganizationMembershipEditPageQuery = /*#__PURE__*/ gql(`
  query OrganizationMembershipEditPageQuery(
    $membershipFilter: OrganizationMembershipsFilter
    $presetsFilter: PermissionPresetsFilter
    $permissionsOrderBy: [PermissionsOrderBy!] = [{ permissionId: AscNullsLast }]
    $presetsOrderBy: [PermissionPresetsOrderBy!] = [{ permissionPresetId: AscNullsLast }]
    $first: Int = 250
  ) {
    memberships: organizationMembershipsCollection(first: 1, filter: $membershipFilter) {
      edges {
        node {
          organizationMembershipId
          profileId
          organizationMembershipInviteEmail
          organizationMembershipInvitePhone
          organizationMembershipInviteAddressLevel0Id
          organizationMembershipInviteDocumentKind
          organizationMembershipInviteDocumentValue
          organizationMembershipAcceptedAt
          organizationMembershipRevokedAt
          organizationMembershipRejectedAt
          profile { profileNameFull }
          organizationMembershipPermissionsCollection(first: 250) {
            edges { node { permissionId } }
          }
        }
      }
    }
    permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {
      edges { node { permissionId permissionDescription } }
    }
    presets: permissionPresetsCollection(first: $first, filter: $presetsFilter, orderBy: $presetsOrderBy) {
      edges { node { permissionPresetId permissionPresetName permissionPresetSlugs organizationId } }
    }
  }
`);

function MEMBER_LABEL(row: {
  profile_id: string | null;
  profile_name_full: string | null;
  email: string | null;
  organization_membership_invite_email: string | null;
  organization_membership_invite_phone: string | null;
  organization_membership_invite_document_value: string | null;
  organization_membership_invite_address_level0_id: string | null;
}): string {
  if (row.profile_id) return row.profile_name_full ?? row.email ?? row.profile_id.slice(0, 8);
  if (row.organization_membership_invite_email) return row.organization_membership_invite_email;
  if (row.organization_membership_invite_phone) return row.organization_membership_invite_phone;
  if (row.organization_membership_invite_document_value) {
    return `${row.organization_membership_invite_address_level0_id ?? ""} · ${row.organization_membership_invite_document_value}`;
  }
  return "—";
}

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationMembershipEditPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
) {
  const {
    tenant_slug,
    organization_id: organization_id_param,
    organization_membership_id: organization_membership_id_param,
  } = await props.params;
  const locale = await getServerLocale();
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();
  const organization_membership_id = Number(organization_membership_id_param);
  if (!Number.isInteger(organization_membership_id) || organization_membership_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const membersHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members", {
    tenant_slug,
    organization_id,
  });
  const supabase = await createSupabaseServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    organization_id: organization_id,
    permission_id: "members_manage",
  });

  if (!canManage) {
    return (
      <EditShell membersHref={membersHref} backLabel={t("back")}>
        <Alert variant="destructive">
          <AlertDescription>{t("no_permission_alert")}</AlertDescription>
        </Alert>
      </EditShell>
    );
  }

  const graphy = await getGraphySession();
  const { data, error } = await graphy.query({
    query: OrganizationMembershipEditPageQuery,
    variables: {
      membershipFilter: {
        organizationMembershipId: { eq: organization_membership_id },
        organizationId: { eq: organization_id },
      },
      presetsFilter: {
        or: [{ organizationId: { is: FilterIs.Null } }, { organizationId: { eq: organization_id } }],
      },
    },
  });
  if (error) throw error;

  const organization_membership = data?.["memberships"]?.["edges"]?.[0]?.["node"] ?? null;
  if (
    !organization_membership ||
    organization_membership["organizationMembershipRevokedAt"] ||
    organization_membership["organizationMembershipRejectedAt"]
  ) {
    return (
      <EditShell membersHref={membersHref} backLabel={t("back")}>
        <Alert variant="destructive">
          <AlertDescription>{t("not_found")}</AlertDescription>
        </Alert>
      </EditShell>
    );
  }

  /** Email for active members lives in auth.users (not profiles) — auth admin API, not GraphQL. */
  let email: string | null = null;
  if (organization_membership["profileId"]) {
    const admin = createSupabaseServiceRoleClient();
    const userRes = await admin.auth.admin.getUserById(organization_membership["profileId"]);
    email = userRes.data?.user?.email ?? null;
  }

  const memberLabel = MEMBER_LABEL({
    profile_id: organization_membership["profileId"] ?? null,
    profile_name_full: organization_membership["profile"]?.["profileNameFull"] ?? null,
    email,
    organization_membership_invite_email: organization_membership["organizationMembershipInviteEmail"] ?? null,
    organization_membership_invite_phone: organization_membership["organizationMembershipInvitePhone"] ?? null,
    organization_membership_invite_document_value:
      organization_membership["organizationMembershipInviteDocumentValue"] ?? null,
    organization_membership_invite_address_level0_id:
      organization_membership["organizationMembershipInviteAddressLevel0Id"] ?? null,
  });
  const isPending = !organization_membership["profileId"];
  const channel = organization_membership["organizationMembershipInvitePhone"]
    ? "phone"
    : organization_membership["organizationMembershipInviteDocumentValue"]
      ? "document"
      : "email";
  const ChannelIcon = channel === "phone" ? Phone : channel === "document" ? FileText : Mail;
  const secondary = isPending ? t("pending_label") : email && email !== memberLabel ? email : null;

  const permissionsCatalog = (data?.["permissions"]?.["edges"] ?? [])
    .filter((e) => e["node"]["permissionId"] !== "*")
    .map((e) => ({
      permission_id: e["node"]["permissionId"],
      permission_description: e["node"]["permissionDescription"] ?? null,
    }));
  const grantedSlugs = (organization_membership["organizationMembershipPermissionsCollection"]?.["edges"] ?? []).map(
    (e) => e["node"]["permissionId"],
  );
  const presets = (data?.["presets"]?.["edges"] ?? []).map((e) => ({
    permission_preset_id: e["node"]["permissionPresetId"],
    permission_preset_name: e["node"]["permissionPresetName"],
    permission_preset_slugs: e["node"]["permissionPresetSlugs"] ?? null,
    organization_id: e["node"]["organizationId"] ?? null,
  }));

  return (
    <EditShell membersHref={membersHref} backLabel={t("back")}>
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
          {organization["organizationName"]} · {t("eyebrow")}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={
              isPending
                ? "bg-muted text-muted-foreground border-border inline-flex size-11 shrink-0 items-center justify-center rounded-full border"
                : "bg-muted text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold tracking-[-0.01em]"
            }
          >
            {isPending ? <ChannelIcon size={18} /> : INITIALS_OF(memberLabel)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex min-w-0 items-center gap-2">
              <h1 className="text-foreground m-0 truncate text-lg font-semibold tracking-[-0.01em]">{memberLabel}</h1>
              {isPending ? (
                <Badge variant="outline" className="text-muted-foreground shrink-0">
                  {t("invitation_badge")}
                </Badge>
              ) : null}
            </span>
            {secondary ? <span className="text-muted-foreground truncate text-xs">{secondary}</span> : null}
          </div>
        </div>
        {isPending ? (
          <div className="border-border bg-muted/40 flex items-start gap-2 rounded-md border px-3 py-2.5">
            <span className="text-muted-foreground mt-px shrink-0">
              <ShieldCheck size={14} />
            </span>
            <span className="text-muted-foreground text-xs leading-normal text-pretty">{t("pending_note")}</span>
          </div>
        ) : null}
      </header>

      <EditPermissionsForm
        organization_membership_id={organization_membership_id}
        permissions={permissionsCatalog}
        presets={presets}
        grantedSlugs={grantedSlugs}
        membersHref={membersHref}
      />
    </EditShell>
  );
}

function EditShell({
  membersHref,
  backLabel,
  children,
}: {
  membersHref: Route;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <Link
        href={membersHref}
        className="text-muted-foreground hover:text-foreground -ml-1.5 inline-flex w-fit items-center gap-1.5 text-xs font-medium"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      {children}
    </div>
  );
}

const LOCALE_ES = {
  back: "Volver a miembros",
  page_title: "Permisos",
  eyebrow: "Permisos",
  no_permission_alert: "No tienes permiso para administrar miembros en esta organización.",
  not_found: "Membresía no encontrada.",
  pending_label: "Invitación pendiente",
  invitation_badge: "Invitación",
  pending_note:
    "Aún no acepta la invitación. Los permisos que dejes aquí se aplican automáticamente en cuanto entre con su enlace.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  back: "Back to members",
  page_title: "Permissions",
  eyebrow: "Permissions",
  no_permission_alert: "You don't have permission to manage members in this organization.",
  not_found: "OrganizationMembership not found.",
  pending_label: "Pending invitation",
  invitation_badge: "Invitation",
  pending_note:
    "They haven't accepted the invitation yet. The permissions you set here apply automatically the moment they enter with their link.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  back: "Voltar para membros",
  page_title: "Permissões",
  eyebrow: "Permissões",
  no_permission_alert: "Você não tem permissão para administrar membros nesta organização.",
  not_found: "Membresia não encontrada.",
  pending_label: "Convite pendente",
  invitation_badge: "Convite",
  pending_note:
    "Ainda não aceitou o convite. As permissões que você definir aqui se aplicam automaticamente assim que entrar com o link.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
