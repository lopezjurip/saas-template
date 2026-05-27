import { RosettaImpl } from "@packages/rosetta/rosetta";
import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47 } from "~/lib/i18n";
import { EditPermissionsForm } from "./edit-form";

const LOCALE_ES = {
  back: "Volver a miembros",
  page_title: "Permisos",
  no_permission_alert: "No tienes permiso para administrar miembros en esta organización.",
  not_found: "Membresía no encontrada.",
  pending_label: "Invitación pendiente",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    back: "Back to members",
    page_title: "Permissions",
    no_permission_alert: "You don't have permission to manage members in this organization.",
    not_found: "Membership not found.",
    pending_label: "Pending invitation",
  } satisfies typeof LOCALE_ES,
  pt: {
    back: "Voltar para membros",
    page_title: "Permissões",
    no_permission_alert: "Você não tem permissão para administrar membros nesta organização.",
    not_found: "Membresia não encontrada.",
    pending_label: "Convite pendente",
  } satisfies typeof LOCALE_ES,
};

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

export default async function MembershipEditPage({
  params,
}: {
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string; membership_id: string }>;
}) {
  const {
    locale,
    tenant_slug,
    organization_id: organization_id_param,
    membership_id: membership_id_param,
  } = await params;

  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale]);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();
  const membership_id = Number(membership_id_param);
  if (!Number.isInteger(membership_id) || membership_id <= 0) notFound();

  const { data: orgData } = await getViewerOrganization(organization_id);
  const organization = orgData?.["viewer_organization_by_id"];
  if (!organization) notFound();

  const membersHref = `/${locale}/${tenant_slug}/${organization_id}/settings/members`;
  const supabase = await createServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
  });

  if (!canManage) {
    return (
      <main className="bg-muted flex min-h-svh items-start justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
              <Link href={membersHref}>
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </Link>
            </Button>
            <CardTitle>{t("page_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{t("no_permission_alert")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
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
      <main className="bg-muted flex min-h-svh items-start justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
              <Link href={membersHref}>
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </Link>
            </Button>
            <CardTitle>{t("page_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{t("not_found")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
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

  const permissionsCatalog = (permissionsRes.data ?? []).filter((p) => p["permission_id"] !== "*");
  const grantedSlugs = (grantsRes.data ?? []).map((g) => g["permission_id"] as string);
  const presets = presetsRes.data ?? [];

  return (
    <main className="bg-muted flex min-h-svh items-start justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
            <Link href={membersHref}>
              <ChevronLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
          <CardTitle>{memberLabel}</CardTitle>
          <CardDescription>
            {organization["organization_name"]}
            {isPending ? ` · ${t("pending_label")}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditPermissionsForm
            membership_id={membership_id}
            permissions={permissionsCatalog}
            presets={presets}
            grantedSlugs={grantedSlugs}
            membersHref={membersHref}
          />
        </CardContent>
      </Card>
    </main>
  );
}
