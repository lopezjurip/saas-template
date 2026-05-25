import { createServerClient, getSupabaseServerUserMetadata } from "@packages/supabase/client.server";
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
import { notFound, redirect } from "next/navigation";
import { InviteMemberDialog } from "./invite-dialog";
import { PendingInvitations } from "./pending-invitations";
import { MembersMatrix } from "./permissions-matrix";

export default async function MembersAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tenant_slug: string }>;
  searchParams: Promise<{ organization?: string }>;
}) {
  const { locale, tenant_slug } = await params;
  const { organization: organization_slug_param } = await searchParams;

  const metadata = await getSupabaseServerUserMetadata();
  if (!metadata) {
    redirect(`/${locale}/auth`);
  }
  const tenant_id = metadata["tenants"]?.find((t) => t["slug"] === tenant_slug)?.["id"];
  if (!tenant_id) {
    notFound();
  }

  const supabase = await createServerClient();
  const admin = createServiceRoleClient();

  // Orgs in this tenant where the caller can manage members.
  const manageOrgIdsRes = await supabase.rpc("viewer_permission_org_ids", {
    target_permission_id: "members_manage",
  });
  const manageOrgIds = new Set<number>(manageOrgIdsRes.data ?? []);

  const orgsRes = await admin
    .from("organizations")
    .select("organization_id, organization_name, organization_slug")
    .eq("tenant_id", tenant_id)
    .is("organization_disabled_at", null)
    .order("organization_name", { ascending: true });

  const orgs = (orgsRes.data ?? []).filter((o) => manageOrgIds.has(o["organization_id"]));
  if (orgs.length === 0) {
    return (
      <main className="bg-muted flex min-h-svh items-start justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
              <Link href={`/${locale}/${tenant_slug}`}>
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <CardTitle>Miembros y permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>No tienes permiso para administrar miembros en esta empresa.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    );
  }

  const active_org = orgs.find((o) => o["organization_slug"] === organization_slug_param) ?? orgs[0]!;
  const organization_id = active_org["organization_id"];

  // Data fetch in parallel: memberships+profiles, permissions, presets, invitations.
  const [membershipsRes, membershipPermissionsRes, permissionsRes, presetsRes, invitationsRes] = await Promise.all([
    admin
      .from("memberships")
      .select("profile_id, membership_created_at, profiles(profile_name_full)")
      .eq("organization_id", organization_id)
      .is("membership_disabled_at", null)
      .order("membership_created_at", { ascending: true }),
    admin.from("membership_permissions").select("profile_id, permission_id").eq("organization_id", organization_id),
    admin
      .from("permissions")
      .select("permission_id, permission_description")
      .order("permission_id", { ascending: true }),
    admin
      .from("permission_presets")
      .select("permission_preset_id, permission_preset_name, permission_preset_slugs, organization_id")
      .or(`organization_id.is.null,organization_id.eq.${organization_id}`)
      .order("permission_preset_id", { ascending: true }),
    admin
      .from("invitations")
      .select(
        "invitation_id, invitation_email, invitation_permission_slugs, invitation_created_at, invitation_expires_at, invited_by_profile_id",
      )
      .eq("organization_id", organization_id)
      .is("invitation_accepted_at", null)
      .is("invitation_revoked_at", null)
      .order("invitation_created_at", { ascending: false }),
  ]);

  // Emails for member profiles (auth.users; not in profiles table). One paginated call
  // instead of N round-trips — Supabase admin rate-limits `getUserById`.
  const memberProfileIds = new Set((membershipsRes.data ?? []).map((m) => m["profile_id"]));
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

  const permissionsCatalog = (permissionsRes.data ?? []).filter((p) => p["permission_id"] !== "*");
  const presets = presetsRes.data ?? [];
  const invitations = invitationsRes.data ?? [];

  const membersByProfileId = new Map<
    string,
    {
      profile_id: string;
      profile_name_full: string | null;
      email: string | null;
      permissions: Set<string>;
      has_wildcard: boolean;
      membership_created_at: string;
    }
  >();
  for (const m of membershipsRes.data ?? []) {
    membersByProfileId.set(m["profile_id"], {
      profile_id: m["profile_id"],
      profile_name_full: m["profiles"]?.["profile_name_full"] ?? null,
      email: profileEmailById.get(m["profile_id"]) ?? null,
      permissions: new Set<string>(),
      has_wildcard: false,
      membership_created_at: m["membership_created_at"],
    });
  }
  for (const mp of membershipPermissionsRes.data ?? []) {
    const member = membersByProfileId.get(mp["profile_id"]);
    if (!member) continue;
    if (mp["permission_id"] === "*") {
      member.has_wildcard = true;
    } else {
      member.permissions.add(mp["permission_id"]);
    }
  }
  const members = Array.from(membersByProfileId.values()).map((m) => ({
    ...m,
    permissions: Array.from(m.permissions).sort(),
  }));

  return (
    <main className="bg-muted flex min-h-svh items-start justify-center p-6">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
            <Link href={`/${locale}/${tenant_slug}`}>
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Miembros y permisos</CardTitle>
              <CardDescription>
                {active_org["organization_name"]}
                {orgs.length > 1 ? (
                  <span className="text-muted-foreground">
                    {" · "}
                    {orgs.map((o, i) => (
                      <span key={o["organization_id"]}>
                        {i > 0 ? " · " : null}
                        {o["organization_id"] === organization_id ? (
                          <strong>{o["organization_name"]}</strong>
                        ) : (
                          <Link
                            href={`/${locale}/${tenant_slug}/admin/members?organization=${o["organization_slug"]}`}
                            className="hover:underline"
                          >
                            {o["organization_name"]}
                          </Link>
                        )}
                      </span>
                    ))}
                  </span>
                ) : null}
              </CardDescription>
            </div>
            <InviteMemberDialog
              organization_id={organization_id}
              organization_name={active_org["organization_name"]}
              permissions={permissionsCatalog}
              presets={presets}
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Matriz de permisos</h2>
              <p className="text-muted-foreground text-xs">
                Marca o desmarca cada capacidad por miembro. Los cambios se guardan al instante.
              </p>
            </div>
            <MembersMatrix organization_id={organization_id} permissions={permissionsCatalog} members={members} />
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Invitaciones pendientes</h2>
              <p className="text-muted-foreground text-xs">
                Cuando alguien acepta el correo, aparece como miembro arriba.
              </p>
            </div>
            <PendingInvitations
              invitations={invitations.map((i) => ({
                invitation_id: i["invitation_id"],
                invitation_email: i["invitation_email"],
                invitation_permission_slugs: i["invitation_permission_slugs"] ?? [],
                invitation_created_at: i["invitation_created_at"],
                invitation_expires_at: i["invitation_expires_at"],
              }))}
            />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
