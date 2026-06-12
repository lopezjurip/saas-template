import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getRosetta } from "~/hooks/get-rosetta";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale } from "~/lib/i18n.server";
import { type AppRoute, ROUTE } from "~/lib/route";
import { EditPermissionsForm } from "./edit-form";

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
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationMembershipEditPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
) {
  const {
    locale,
    tenant_slug,
    organization_id: organization_id_param,
    organization_membership_id: organization_membership_id_param,
  } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();
  const organization_membership_id = Number(organization_membership_id_param);
  if (!Number.isInteger(organization_membership_id) || organization_membership_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const membersHref = ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings/members", {
    locale,
    tenant_slug,
    organization_id,
  });
  const supabase = await createServerClient();
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

  const admin = createServiceRoleClient();
  const [organizationMembershipRes, permissionsRes, grantsRes, presetsRes] = await Promise.all([
    admin
      .from("organization_memberships")
      .select(
        "organization_membership_id, profile_id, organization_membership_invite_email, organization_membership_invite_phone, organization_membership_invite_address_level0_id, organization_membership_invite_document_kind, organization_membership_invite_document_value, organization_membership_accepted_at, organization_membership_revoked_at, organization_membership_rejected_at, profiles(profile_name_full)",
      )
      .eq("organization_membership_id", organization_membership_id)
      .eq("organization_id", organization_id)
      .maybeSingle(),
    admin
      .from("permissions")
      .select("permission_id, permission_description")
      .order("permission_id", { ascending: true }),
    admin
      .from("organization_membership_permissions")
      .select("permission_id")
      .eq("organization_membership_id", organization_membership_id),
    admin
      .from("permission_presets")
      .select("permission_preset_id, permission_preset_name, permission_preset_slugs, organization_id")
      .or(`organization_id.is.null,organization_id.eq.${organization_id}`)
      .order("permission_preset_id", { ascending: true }),
  ]);

  const organization_membership = organizationMembershipRes.data;
  if (
    !organization_membership ||
    organization_membership["organization_membership_revoked_at"] ||
    organization_membership["organization_membership_rejected_at"]
  ) {
    return (
      <EditShell membersHref={membersHref} backLabel={t("back")}>
        <Alert variant="destructive">
          <AlertDescription>{t("not_found")}</AlertDescription>
        </Alert>
      </EditShell>
    );
  }

  // Email for active members lives in auth.users (not profiles).
  let email: string | null = null;
  if (organization_membership["profile_id"]) {
    const userRes = await admin.auth.admin.getUserById(organization_membership["profile_id"]);
    email = userRes.data?.user?.email ?? null;
  }

  const memberLabel = MEMBER_LABEL({
    profile_id: organization_membership["profile_id"],
    profile_name_full: organization_membership["profiles"]?.["profile_name_full"] ?? null,
    email,
    organization_membership_invite_email: organization_membership["organization_membership_invite_email"],
    organization_membership_invite_phone: organization_membership["organization_membership_invite_phone"],
    organization_membership_invite_document_value:
      organization_membership["organization_membership_invite_document_value"],
    organization_membership_invite_address_level0_id:
      organization_membership["organization_membership_invite_address_level0_id"],
  });
  const isPending = !organization_membership["profile_id"];
  const channel = organization_membership["organization_membership_invite_phone"]
    ? "phone"
    : organization_membership["organization_membership_invite_document_value"]
      ? "document"
      : "email";
  const ChannelIcon = channel === "phone" ? Phone : channel === "document" ? FileText : Mail;
  const secondary = isPending ? t("pending_label") : email && email !== memberLabel ? email : null;

  const permissionsCatalog = (permissionsRes.data ?? []).filter((p) => p["permission_id"] !== "*");
  const grantedSlugs = (grantsRes.data ?? []).map((g) => g["permission_id"] as string);
  const presets = presetsRes.data ?? [];

  return (
    <EditShell membersHref={membersHref} backLabel={t("back")}>
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
          {organization["organization_name"]} · {t("eyebrow")}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={
              isPending
                ? "bg-muted text-muted-foreground border-border inline-flex size-11 shrink-0 items-center justify-center rounded-full border"
                : "bg-muted text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold tracking-[-0.01em]"
            }
          >
            {isPending ? <ChannelIcon size={18} /> : INITIALS_OF(memberLabel)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex min-w-0 items-center gap-2">
              <h1 className="text-foreground m-0 truncate text-[18px] font-semibold tracking-[-0.01em]">
                {memberLabel}
              </h1>
              {isPending ? (
                <Badge variant="outline" className="text-muted-foreground shrink-0">
                  {t("invitation_badge")}
                </Badge>
              ) : null}
            </span>
            {secondary ? <span className="text-muted-foreground truncate text-[12.5px]">{secondary}</span> : null}
          </div>
        </div>
        {isPending ? (
          <div className="border-border bg-muted/40 flex items-start gap-2 rounded-md border px-3 py-2.5">
            <span className="text-muted-foreground mt-px shrink-0">
              <ShieldCheck size={14} />
            </span>
            <span className="text-muted-foreground text-[12px] leading-normal text-pretty">{t("pending_note")}</span>
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
  membersHref: AppRoute;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <Link
        href={membersHref}
        className="text-muted-foreground hover:text-foreground -ml-1.5 inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium"
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
