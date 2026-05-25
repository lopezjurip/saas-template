"use server";

import { randomBytes } from "node:crypto";
import { RosettaImpl } from "@packages/rosetta/rosetta";
import type { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { debug } from "~/lib/debug";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action";
import { MEMBERS_LOCALES } from "./locales";
import {
  cancelInvitationSchema,
  demoteWildcardSchema,
  inviteMemberSchema,
  PERMISSION_SLUG_WILDCARD,
  removeMemberSchema,
  togglePermissionSchema,
} from "./schemas";

const log = debug("admin:members");

const INVITATION_TTL_DAYS = 14;

type SupabaseServerClient = Awaited<ReturnType<typeof createServerClient>>;
type MembersRosetta = RosettaImpl<(typeof MEMBERS_LOCALES)["es"]>;

function GENERATE_INVITATION_TOKEN(): string {
  return randomBytes(32).toString("base64url");
}

async function GET_ROSETTA(): Promise<MembersRosetta> {
  const locale = await getServerLocale();
  return RosettaImpl.fromDictionary(MEMBERS_LOCALES, LOCALE_TO_BCP47[locale]);
}

async function ASSERT_MEMBERS_MANAGE(supabase: SupabaseServerClient, r: MembersRosetta, organization_id: number) {
  const { data, error } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
  });
  if (error) {
    log.error("permission check failed", { organization_id, error });
    throw new Error(r.t("error_permission_check"));
  }
  if (!data) {
    throw new Error(r.t("error_no_permission"));
  }
}

// True iff the org has at least one OTHER profile that holds `members_manage` (or `*`).
// Used to prevent locking the org out of its own admin surface.
async function HAS_OTHER_MANAGER(
  admin: ReturnType<typeof createServiceRoleClient>,
  r: MembersRosetta,
  organization_id: number,
  excluded_profile_id: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("membership_permissions")
    .select("profile_id")
    .eq("organization_id", organization_id)
    .in("permission_id", ["members_manage", PERMISSION_SLUG_WILDCARD])
    .neq("profile_id", excluded_profile_id)
    .limit(1);
  if (error) {
    log.error("has-other-manager check failed", { organization_id, excluded_profile_id, error });
    throw new Error(r.t("error_permission_structure"));
  }
  return (data?.length ?? 0) > 0;
}

export const actionInviteMember = authedAction
  .inputSchema(inviteMemberSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    await ASSERT_MEMBERS_MANAGE(supabase, r, parsedInput.organization_id);

    const admin = createServiceRoleClient();

    const orgRes = await admin
      .from("organizations")
      .select("organization_id, organization_name, tenant_id, tenants(tenant_name, tenant_slug)")
      .eq("organization_id", parsedInput.organization_id)
      .maybeSingle();

    if (orgRes.error || !orgRes.data) {
      log.error("invite: org lookup failed", {
        organization_id: parsedInput.organization_id,
        error: orgRes.error,
      });
      throw new Error(r.t("error_org_not_found"));
    }

    const tenant_slug = orgRes.data["tenants"]?.["tenant_slug"];
    if (!tenant_slug) {
      throw new Error(r.t("error_tenant_not_found"));
    }

    const dup = await admin
      .from("invitations")
      .select("invitation_id")
      .eq("organization_id", parsedInput.organization_id)
      .eq("invitation_email", parsedInput.invitation_email)
      .is("invitation_accepted_at", null)
      .is("invitation_revoked_at", null)
      .maybeSingle();

    if (dup.data) {
      throw new Error(r.t("error_invitation_duplicate"));
    }

    // If the email already belongs to a member of this org, skip the invite.
    const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!existing.error) {
      const existing_user = existing.data.users.find(
        (u) => u["email"]?.toLowerCase() === parsedInput.invitation_email.toLowerCase(),
      );
      if (existing_user) {
        const member = await admin
          .from("memberships")
          .select("profile_id")
          .eq("organization_id", parsedInput.organization_id)
          .eq("profile_id", existing_user["id"])
          .is("membership_disabled_at", null)
          .maybeSingle();
        if (member.data) {
          throw new Error(r.t("error_email_already_member"));
        }
      }
    }

    const token = GENERATE_INVITATION_TOKEN();
    const expires_at = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const insertRes = await admin
      .from("invitations")
      .insert({
        organization_id: parsedInput.organization_id,
        invitation_email: parsedInput.invitation_email,
        invitation_permission_slugs: parsedInput.invitation_permission_slugs,
        invitation_token: token,
        invited_by_profile_id: user.id,
        invitation_expires_at: expires_at,
      })
      .select("invitation_id")
      .single();

    if (insertRes.error || !insertRes.data) {
      log.error("invitation insert failed", {
        profile_id: user.id,
        organization_id: parsedInput.organization_id,
        error: insertRes.error,
      });
      throw new Error(r.t("error_invite_failed"));
    }

    // Try to send the magic-link email via Supabase Auth (creates the user if absent).
    // If it fails (e.g. provider misconfigured locally), we still keep the row so the
    // admin can resend or share the link manually.
    const headerList = await headers();
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    const host = headerList.get("host") ?? "";
    const locale = await getServerLocale();
    const redirectTo = `${proto}://${host}/${locale}/invitations/accept?token=${encodeURIComponent(token)}`;

    const invite = await admin.auth.admin.inviteUserByEmail(parsedInput.invitation_email, {
      redirectTo,
      data: {
        invitation_id: insertRes.data.invitation_id,
        organization_id: parsedInput.organization_id,
        tenant_slug,
      },
    });
    if (invite.error) {
      log.warn("supabase inviteUserByEmail failed; invitation row kept", {
        organization_id: parsedInput.organization_id,
        email: parsedInput.invitation_email,
        error: invite.error.message,
      });
    }

    revalidatePath(`/${locale}/${tenant_slug}/admin/members`);
    return { invitation_id: insertRes.data.invitation_id };
  });

export const actionCancelInvitation = authedAction
  .inputSchema(cancelInvitationSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    const admin = createServiceRoleClient();

    const invRes = await admin
      .from("invitations")
      .select("organization_id, organizations(tenants(tenant_slug))")
      .eq("invitation_id", parsedInput.invitation_id)
      .maybeSingle();

    if (invRes.error || !invRes.data) {
      log.error("cancel: invitation lookup failed", {
        invitation_id: parsedInput.invitation_id,
        error: invRes.error,
      });
      throw new Error(r.t("error_invitation_not_found"));
    }

    await ASSERT_MEMBERS_MANAGE(supabase, r, invRes.data.organization_id);

    const tenant_slug = invRes.data["organizations"]?.["tenants"]?.["tenant_slug"];

    const { error } = await admin
      .from("invitations")
      .update({
        invitation_revoked_at: new Date().toISOString(),
        invitation_revoked_by_profile_id: user.id,
      })
      .eq("invitation_id", parsedInput.invitation_id)
      .is("invitation_accepted_at", null)
      .is("invitation_revoked_at", null);

    if (error) {
      log.error("invitation revoke failed", {
        profile_id: user.id,
        invitation_id: parsedInput.invitation_id,
        error,
      });
      throw new Error(r.t("error_cancel_failed"));
    }

    if (tenant_slug) {
      revalidatePath(`/${await getServerLocale()}/${tenant_slug}/admin/members`);
    }
  });

export const actionTogglePermission = authedAction
  .inputSchema(togglePermissionSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    await ASSERT_MEMBERS_MANAGE(supabase, r, parsedInput.organization_id);

    if (parsedInput.permission_id === PERMISSION_SLUG_WILDCARD) {
      throw new Error(r.t("error_wildcard_usage"));
    }

    const admin = createServiceRoleClient();

    // If revoking members_manage from someone, make sure they're not the last admin.
    if (
      !parsedInput.granted &&
      parsedInput.permission_id === "members_manage" &&
      !(await HAS_OTHER_MANAGER(admin, r, parsedInput.organization_id, parsedInput.profile_id))
    ) {
      throw new Error(r.t("error_last_manager_revoke"));
    }

    if (parsedInput.granted) {
      const { error } = await admin.from("membership_permissions").upsert(
        {
          organization_id: parsedInput.organization_id,
          profile_id: parsedInput.profile_id,
          permission_id: parsedInput.permission_id,
        },
        { onConflict: "organization_id,profile_id,permission_id", ignoreDuplicates: true },
      );
      if (error) {
        log.error("grant permission failed", {
          profile_id: user.id,
          target_profile_id: parsedInput.profile_id,
          organization_id: parsedInput.organization_id,
          permission_id: parsedInput.permission_id,
          error,
        });
        throw new Error(r.t("error_grant_failed"));
      }
    } else {
      const { error } = await admin
        .from("membership_permissions")
        .delete()
        .eq("organization_id", parsedInput.organization_id)
        .eq("profile_id", parsedInput.profile_id)
        .eq("permission_id", parsedInput.permission_id);
      if (error) {
        log.error("revoke permission failed", {
          profile_id: user.id,
          target_profile_id: parsedInput.profile_id,
          organization_id: parsedInput.organization_id,
          permission_id: parsedInput.permission_id,
          error,
        });
        throw new Error(r.t("error_revoke_failed"));
      }
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });

export const actionDemoteWildcard = authedAction
  .inputSchema(demoteWildcardSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    await ASSERT_MEMBERS_MANAGE(supabase, r, parsedInput.organization_id);

    if (parsedInput.profile_id === user.id) {
      throw new Error(r.t("error_self_demote"));
    }

    const admin = createServiceRoleClient();

    if (!(await HAS_OTHER_MANAGER(admin, r, parsedInput.organization_id, parsedInput.profile_id))) {
      throw new Error(r.t("error_last_manager_demote"));
    }

    const { error } = await admin
      .from("membership_permissions")
      .delete()
      .eq("organization_id", parsedInput.organization_id)
      .eq("profile_id", parsedInput.profile_id)
      .eq("permission_id", PERMISSION_SLUG_WILDCARD);

    if (error) {
      log.error("demote wildcard failed", {
        profile_id: user.id,
        target_profile_id: parsedInput.profile_id,
        organization_id: parsedInput.organization_id,
        error,
      });
      throw new Error(r.t("error_demote_failed"));
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });

export const actionRemoveMember = authedAction
  .inputSchema(removeMemberSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    await ASSERT_MEMBERS_MANAGE(supabase, r, parsedInput.organization_id);

    if (parsedInput.profile_id === user.id) {
      throw new Error(r.t("error_self_remove"));
    }

    const admin = createServiceRoleClient();

    if (!(await HAS_OTHER_MANAGER(admin, r, parsedInput.organization_id, parsedInput.profile_id))) {
      throw new Error(r.t("error_last_manager_remove"));
    }

    const { error } = await admin
      .from("memberships")
      .delete()
      .eq("organization_id", parsedInput.organization_id)
      .eq("profile_id", parsedInput.profile_id);

    if (error) {
      log.error("remove member failed", {
        profile_id: user.id,
        target_profile_id: parsedInput.profile_id,
        organization_id: parsedInput.organization_id,
        error,
      });
      throw new Error(r.t("error_remove_failed"));
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });
