import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { PendingInvitations } from "./pending-invitations";

export default async function MembersAdminPage({
  params,
}: {
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string }>;
}) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await params;

  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  const { t } = ROSETTA(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const { data: orgData } = await getViewerOrganization(organization_id);
  const organization = orgData?.["viewer_organization_by_id"];
  if (!organization) notFound();

  const supabase = await createServerClient();
  const admin = createServiceRoleClient();

  // viewer_has_permission is SECURITY DEFINER and honors '*' as a match.
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
  });

  if (!canManage) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{t("page_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{t("no_permission_alert")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // memberships now models both ACTIVE members and PENDING invites — split client-side.
  const [allMembershipsRes, membershipPermissionsRes] = await Promise.all([
    admin
      .from("memberships")
      .select(
        "membership_id, profile_id, membership_invite_email, membership_invite_phone, membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value, membership_invite_expires_at, membership_accepted_at, membership_created_at, profiles(profile_name_full)",
      )
      .eq("organization_id", organization_id)
      .is("membership_revoked_at", null)
      .is("membership_rejected_at", null)
      .order("membership_created_at", { ascending: true }),
    admin
      .from("membership_permissions")
      .select("membership_id, permission_id, memberships!inner(organization_id)")
      .eq("memberships.organization_id", organization_id),
  ]);

  const allMemberships = allMembershipsRes.data ?? [];
  const activeMemberships = allMemberships.filter((m) => m["profile_id"] && m["membership_accepted_at"]);
  const pendingMemberships = allMemberships.filter((m) => !m["profile_id"] && !m["membership_accepted_at"]);

  // Emails for member profiles (auth.users; not in profiles table). One paginated call
  // instead of N round-trips — Supabase admin rate-limits `getUserById`.
  const memberProfileIds = new Set(activeMemberships.map((m) => m["profile_id"] as string));
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

  const permissionsByMembershipId = new Map<number, { permission_id: string; is_wildcard: boolean }[]>();
  for (const mp of membershipPermissionsRes.data ?? []) {
    const list = permissionsByMembershipId.get(mp["membership_id"] as number) ?? [];
    list.push({
      permission_id: mp["permission_id"] as string,
      is_wildcard: mp["permission_id"] === "*",
    });
    permissionsByMembershipId.set(mp["membership_id"] as number, list);
  }

  const editHrefBase = `/${locale}/${tenant_slug}/${organization_id}/settings/members`;

  const activeRows = activeMemberships.map((m) => {
    const membership_id = m["membership_id"] as number;
    const grants = permissionsByMembershipId.get(membership_id) ?? [];
    const has_wildcard = grants.some((g) => g.is_wildcard);
    const slugs = grants.filter((g) => !g.is_wildcard).map((g) => g.permission_id);
    const profile_id = m["profile_id"] as string;
    return {
      membership_id,
      profile_id,
      profile_name_full: m["profiles"]?.["profile_name_full"] ?? null,
      email: profileEmailById.get(profile_id) ?? null,
      has_wildcard,
      permission_count: slugs.length,
    };
  });

  return (
    <div className="p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{t("page_title")}</CardTitle>
              <CardDescription>{organization["organization_name"]}</CardDescription>
            </div>
            <Button asChild>
              <Link href={`${editHrefBase}/new`}>
                <UserPlus className="h-4 w-4" />
                {t("invite_button")}
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("members_heading")}</h2>
              <p className="text-muted-foreground text-xs">{t("members_description")}</p>
            </div>
            {activeRows.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("members_empty")}</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {activeRows.map((m) => {
                  const name = m.profile_name_full ?? m.email ?? m.profile_id.slice(0, 8);
                  return (
                    <li key={m.membership_id}>
                      <Link
                        href={`${editHrefBase}/${m.membership_id}/edit`}
                        className="hover:bg-muted/50 flex items-center justify-between gap-3 p-3"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{name}</span>
                          {m.email && m.email !== name && (
                            <span className="text-muted-foreground text-xs">{m.email}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {m.has_wildcard ? (
                            <Badge variant="default">{t("full_access_badge")}</Badge>
                          ) : m.permission_count === 0 ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              {t("no_permissions")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t("permissions_count", { count: m.permission_count })}</Badge>
                          )}
                          <ChevronRight className="text-muted-foreground h-4 w-4" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("pending_heading")}</h2>
              <p className="text-muted-foreground text-xs">{t("pending_description")}</p>
            </div>
            <PendingInvitations
              editHrefBase={editHrefBase}
              invitations={pendingMemberships.map((i) => ({
                membership_id: i["membership_id"] as number,
                invitation_email: i["membership_invite_email"] as string | null,
                invitation_phone: i["membership_invite_phone"] as string | null,
                invitation_address_level0_id: i["membership_invite_address_level0_id"] as string | null,
                invitation_document_kind: i["membership_invite_document_kind"] as string | null,
                invitation_document_value: i["membership_invite_document_value"] as string | null,
                invitation_permission_slugs:
                  permissionsByMembershipId.get(i["membership_id"] as number)?.map((g) => g.permission_id) ?? [],
                invitation_created_at: i["membership_created_at"] as string,
                invitation_expires_at: i["membership_invite_expires_at"] as string | null,
              }))}
            />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

const LOCALE_ES = {
  page_title: "Miembros",
  no_permission_alert: "No tienes permiso para administrar miembros en esta organización.",
  members_heading: "Miembros activos",
  members_description: "Haz click en un miembro para editar sus permisos.",
  members_empty: "Esta organización aún no tiene miembros activos.",
  pending_heading: "Invitaciones pendientes",
  pending_description: "Cuando alguien acepta, aparece como miembro arriba.",
  invite_button: "Invitar",
  full_access_badge: "Acceso completo",
  permissions_count: "{{count}} permisos",
  no_permissions: "sin permisos",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Members",
  no_permission_alert: "You don't have permission to manage members in this organization.",
  members_heading: "Active members",
  members_description: "Click a member to edit their permissions.",
  members_empty: "This organization has no active members yet.",
  pending_heading: "Pending invitations",
  pending_description: "Once they accept, they show up as a member above.",
  invite_button: "Invite",
  full_access_badge: "Full access",
  permissions_count: "{{count}} permissions",
  no_permissions: "no permissions",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Membros",
  no_permission_alert: "Você não tem permissão para administrar membros nesta organização.",
  members_heading: "Membros ativos",
  members_description: "Clique em um membro para editar suas permissões.",
  members_empty: "Esta organização ainda não tem membros ativos.",
  pending_heading: "Convites pendentes",
  pending_description: "Quando aceitarem, aparecerão como membro acima.",
  invite_button: "Convidar",
  full_access_badge: "Acesso completo",
  permissions_count: "{{count}} permissões",
  no_permissions: "sem permissões",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
