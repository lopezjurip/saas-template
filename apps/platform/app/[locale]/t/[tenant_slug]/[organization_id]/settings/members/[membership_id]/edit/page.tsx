import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { EditPermissionsForm } from "./edit-form";

function MEMBER_LABEL(row: {
  profile_id: string | null;
  profile_name_full: string | null;
  email: string | null;
  membership_invite_email: string | null;
  membership_invite_phone: string | null;
  membership_invite_document_value: string | null;
  membership_invite_address_level0_id: string | null;
}): string {
  if (row.profile_id) return row.profile_name_full ?? row.email ?? row.profile_id.slice(0, 8);
  if (row.membership_invite_email) return row.membership_invite_email;
  if (row.membership_invite_phone) return row.membership_invite_phone;
  if (row.membership_invite_document_value) {
    return `${row.membership_invite_address_level0_id ?? ""} · ${row.membership_invite_document_value}`;
  }
  return "—";
}

function INITIALS_OF(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/[membership_id]/edit">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function MembershipEditPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/[membership_id]/edit">,
) {
  const {
    locale,
    tenant_slug,
    organization_id: organization_id_param,
    membership_id: membership_id_param,
  } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();
  const membership_id = Number(membership_id_param);
  if (!Number.isInteger(membership_id) || membership_id <= 0) notFound();

  const { data: orgData } = await getViewerOrganization(organization_id);
  const organization = orgData?.["organization"];
  if (!organization) notFound();

  const membersHref = `/${locale}/t/${tenant_slug}/${organization_id}/settings/members`;
  const supabase = await createServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
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
  const [membershipRes, permissionsRes, grantsRes, presetsRes] = await Promise.all([
    admin
      .from("memberships")
      .select(
        "membership_id, profile_id, membership_invite_email, membership_invite_phone, membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value, membership_accepted_at, membership_revoked_at, membership_rejected_at, profiles(profile_name_full)",
      )
      .eq("membership_id", membership_id)
      .eq("organization_id", organization_id)
      .maybeSingle(),
    admin
      .from("permissions")
      .select("permission_id, permission_description")
      .order("permission_id", { ascending: true }),
    admin.from("membership_permissions").select("permission_id").eq("membership_id", membership_id),
    admin
      .from("permission_presets")
      .select("permission_preset_id, permission_preset_name, permission_preset_slugs, organization_id")
      .or(`organization_id.is.null,organization_id.eq.${organization_id}`)
      .order("permission_preset_id", { ascending: true }),
  ]);

  const membership = membershipRes.data;
  if (!membership || membership["membership_revoked_at"] || membership["membership_rejected_at"]) {
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
  if (membership["profile_id"]) {
    const userRes = await admin.auth.admin.getUserById(membership["profile_id"]);
    email = userRes.data?.user?.email ?? null;
  }

  const memberLabel = MEMBER_LABEL({
    profile_id: membership["profile_id"],
    profile_name_full: membership["profiles"]?.["profile_name_full"] ?? null,
    email,
    membership_invite_email: membership["membership_invite_email"],
    membership_invite_phone: membership["membership_invite_phone"],
    membership_invite_document_value: membership["membership_invite_document_value"],
    membership_invite_address_level0_id: membership["membership_invite_address_level0_id"],
  });
  const isPending = !membership["profile_id"];
  const channel = membership["membership_invite_phone"]
    ? "phone"
    : membership["membership_invite_document_value"]
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
            <span className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">
              {t("pending_note")}
            </span>
          </div>
        ) : null}
      </header>

      <EditPermissionsForm
        membership_id={membership_id}
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
  membersHref: string;
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
  not_found: "Membership not found.",
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
