import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { assertParams } from "~/lib/params";
import { ROUTE } from "~/lib/route";
import { EditPermissionsForm } from "./edit-form";

const OrganizationMembershipEditPageQuery = /*#__PURE__*/ gql(`
  query OrganizationMembershipEditPageQuery(
    $organizationId: Int!
    $organizationMembershipId: Int!
    $presetsFilter: PermissionPresetsFilter
    $permissionsOrderBy: [PermissionsOrderBy!] = [{ permissionId: AscNullsLast }]
    $presetsOrderBy: [PermissionPresetsOrderBy!] = [{ permissionPresetId: AscNullsLast }]
    $first: Int = 250
  ) {
    organization: viewerOrganizationById(organizationId: $organizationId) {
      ...ViewerOrganizationGetFragment
    }
    canManage: viewerHasPermission(organizationId: $organizationId, permissionId: "members_manage")
    membership: viewerOrganizationMembershipById(organizationMembershipId: $organizationMembershipId) {
      organizationMembershipId
      profileId
      organizationMembershipLabel
      organizationMembershipEmail
      organizationMembershipInviteEmail
      organizationMembershipInvitePhone
      organizationMembershipInviteAddressLevel0Id
      organizationMembershipInviteDocumentKind
      organizationMembershipInviteDocumentValue
      organizationMembershipAcceptedAt
      organizationMembershipRevokedAt
      organizationMembershipRejectedAt
      profile { profileNameFull }
      permissionGrantsCollection(first: 250) {
        edges { node { permissionId } }
      }
    }
    permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {
      edges { node { ...EditPermissionsFormPermissionFragment } }
    }
    presets: permissionPresetsCollection(first: $first, filter: $presetsFilter, orderBy: $presetsOrderBy) {
      edges { node { ...EditPermissionsFormPresetFragment } }
    }
  }
`);

const paramsSchema = z.object({
  tenant_slug: z.string().min(1),
  organization_id: z.int().min(1),
  organization_membership_id: z.int().min(1),
});

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationMembershipEditPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
) {
  const params = await props.params;
  const { tenant_slug, organization_id, organization_membership_id } = assertParams(params, paramsSchema, "notFound");

  const { t } = await getRosetta(LOCALES);

  const membersHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members", {
    tenant_slug,
    organization_id,
  });

  const graphy = await getGraphySession();
  const { data, error } = await graphy.query({
    query: OrganizationMembershipEditPageQuery,
    variables: {
      organizationId: organization_id,
      organizationMembershipId: organization_membership_id,
      presetsFilter: {
        or: [{ organizationId: { is: FilterIs.Null } }, { organizationId: { eq: organization_id } }],
      },
    },
  });
  if (error) throw error;

  const organization = data?.["organization"] ?? null;
  if (!organization) notFound();

  if (!data?.["canManage"]) {
    return (
      <EditShell membersHref={membersHref} backLabel={t("back")}>
        <Alert variant="destructive">
          <AlertDescription>{t("no_permission_alert")}</AlertDescription>
        </Alert>
      </EditShell>
    );
  }

  const organization_membership = data?.["membership"] ?? null;
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

  const memberLabel = organization_membership["organizationMembershipLabel"] ?? "—";
  const email = organization_membership["organizationMembershipEmail"] ?? null;
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
    .map((e) => e["node"]);
  const grantedSlugs = (organization_membership["permissionGrantsCollection"]?.["edges"] ?? []).map(
    (e) => e["node"]["permissionId"],
  );
  const presets = (data?.["presets"]?.["edges"] ?? []).map((e) => e["node"]);

  return (
    <EditShell membersHref={membersHref} backLabel={t("back")}>
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          {organization["organizationName"]} · {t("eyebrow")}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={
              isPending
                ? "bg-muted text-muted-foreground border-border inline-flex size-11 shrink-0 items-center justify-center rounded-full border"
                : "bg-muted text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            }
          >
            {isPending ? <ChannelIcon size={18} /> : INITIALS_OF(memberLabel)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex min-w-0 items-center gap-2">
              <h1 className="text-foreground m-0 truncate text-lg font-semibold">{memberLabel}</h1>
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
