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

const LOCALE_ES = {
  no_permission: "No tienes permiso para administrar miembros en esta organización",
  permission_check: "No pudimos verificar tus permisos",
  org_not_found: "Organización no encontrada",
  tenant_not_found: "Tenant no encontrado",
  invitation_duplicate: "Ya hay una invitación pendiente para ese correo en esta organización",
  phone_duplicate: "Ya hay una invitación pendiente para ese teléfono en esta organización",
  phone_invalid: "El número de teléfono ingresado no es válido",
  email_already_member: "Ese correo ya pertenece a un miembro de la organización",
  invite_failed: "No pudimos crear la invitación",
  invitation_not_found: "Invitación no encontrada",
  cancel_failed: "No pudimos cancelar la invitación",
  wildcard_usage: "Usa la opción 'Acceso completo' en lugar de marcar el comodín",
  grant_failed: "No pudimos otorgar el permiso",
  revoke_failed: "No pudimos quitar el permiso",
  self_demote: "No puedes quitarte tu acceso completo a ti mismo",
  demote_failed: "No pudimos remover el acceso completo",
  self_remove: "No puedes removerte a ti mismo",
  remove_failed: "No pudimos remover al miembro",
  last_manager_revoke: "No puedes quitar el último administrador de la organización",
  last_manager_demote: "No puedes quitar el acceso completo al último administrador",
  last_manager_remove: "No puedes remover al último administrador de la organización",
  permission_structure: "No pudimos verificar la estructura de permisos",
  membership_not_found: "No encontramos la membresía",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    no_permission: "You don't have permission to manage members in this organization",
    permission_check: "We couldn't verify your permissions",
    org_not_found: "Organization not found",
    tenant_not_found: "Tenant not found",
    invitation_duplicate: "There's already a pending invitation for that email in this organization",
    phone_duplicate: "There's already a pending invitation for that phone number in this organization",
    phone_invalid: "The phone number entered is not valid",
    email_already_member: "That email already belongs to a member of the organization",
    invite_failed: "We couldn't create the invitation",
    invitation_not_found: "Invitation not found",
    cancel_failed: "We couldn't cancel the invitation",
    wildcard_usage: "Use the 'Full access' option instead of checking the wildcard",
    grant_failed: "We couldn't grant the permission",
    revoke_failed: "We couldn't revoke the permission",
    self_demote: "You can't remove your own full access",
    demote_failed: "We couldn't remove full access",
    self_remove: "You can't remove yourself",
    remove_failed: "We couldn't remove the member",
    last_manager_revoke: "You can't remove the last administrator of the organization",
    last_manager_demote: "You can't remove full access from the last administrator",
    last_manager_remove: "You can't remove the last administrator of the organization",
    permission_structure: "We couldn't verify the permission structure",
    membership_not_found: "Membership not found",
  } satisfies typeof LOCALE_ES,
  pt: {
    no_permission: "Você não tem permissão para administrar membros nesta organização",
    permission_check: "Não conseguimos verificar suas permissões",
    org_not_found: "Organização não encontrada",
    tenant_not_found: "Tenant não encontrado",
    invitation_duplicate: "Já existe um convite pendente para esse e-mail nesta organização",
    phone_duplicate: "Já existe um convite pendente para esse número de telefone nesta organização",
    phone_invalid: "O número de telefone informado não é válido",
    email_already_member: "Esse e-mail já pertence a um membro da organização",
    invite_failed: "Não conseguimos criar o convite",
    invitation_not_found: "Convite não encontrado",
    cancel_failed: "Não conseguimos cancelar o convite",
    wildcard_usage: "Use a opção 'Acesso completo' em vez de marcar o coringa",
    grant_failed: "Não conseguimos conceder a permissão",
    revoke_failed: "Não conseguimos remover a permissão",
    self_demote: "Você não pode remover seu próprio acesso completo",
    demote_failed: "Não conseguimos remover o acesso completo",
    self_remove: "Você não pode se remover",
    remove_failed: "Não conseguimos remover o membro",
    last_manager_revoke: "Você não pode remover o último administrador da organização",
    last_manager_demote: "Você não pode remover o acesso completo do último administrador",
    last_manager_remove: "Você não pode remover o último administrador da organização",
    permission_structure: "Não conseguimos verificar a estrutura de permissões",
    membership_not_found: "Membresia não encontrada",
  } satisfies typeof LOCALE_ES,
};

type SupabaseServerClient = Awaited<ReturnType<typeof createServerClient>>;
type ActionsRosetta = RosettaImpl<typeof LOCALE_ES>;
type AdminClient = ReturnType<typeof createServiceRoleClient>;

function GENERATE_INVITATION_TOKEN(): string {
  return randomBytes(32).toString("base64url");
}

async function GET_ROSETTA(): Promise<ActionsRosetta> {
  const locale = await getServerLocale();
  return RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale]);
}

async function ASSERT_MEMBERS_MANAGE(supabase: SupabaseServerClient, r: ActionsRosetta, organization_id: number) {
  const { data, error } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
  });
  if (error) {
    log.error("permission check failed", { organization_id, error });
    throw new Error(r.t("permission_check"));
  }
  if (!data) {
    throw new Error(r.t("no_permission"));
  }
}

// Resolve (organization_id, profile_id) for an arbitrary membership_id. profile_id is null
// when the membership is still PENDING. Returns null if no live row matches.
async function LOAD_MEMBERSHIP(
  admin: AdminClient,
  membership_id: number,
): Promise<{ organization_id: number; profile_id: string | null } | null> {
  const { data, error } = await admin
    .from("memberships")
    .select("organization_id, profile_id, membership_revoked_at, membership_rejected_at")
    .eq("membership_id", membership_id)
    .maybeSingle();
  if (error || !data) {
    log.error("membership lookup failed", { membership_id, error });
    return null;
  }
  if (data["membership_revoked_at"] || data["membership_rejected_at"]) return null;
  return { organization_id: data["organization_id"], profile_id: data["profile_id"] };
}

// True iff the org has at least one OTHER active member that holds `members_manage` (or `*`).
// Pending invites don't count — they aren't admins yet. Used to prevent locking the org
// out of its own admin surface.
async function HAS_OTHER_MANAGER(
  admin: AdminClient,
  r: ActionsRosetta,
  organization_id: number,
  excluded_membership_id: number,
): Promise<boolean> {
  const { data, error } = await admin
    .from("membership_permissions")
    .select(
      "membership_id, memberships!inner(organization_id, profile_id, membership_accepted_at, membership_revoked_at, membership_rejected_at)",
    )
    .in("permission_id", ["members_manage", PERMISSION_SLUG_WILDCARD])
    .eq("memberships.organization_id", organization_id)
    .neq("membership_id", excluded_membership_id)
    .not("memberships.profile_id", "is", null)
    .not("memberships.membership_accepted_at", "is", null)
    .is("memberships.membership_revoked_at", null)
    .is("memberships.membership_rejected_at", null)
    .limit(1);
  if (error) {
    log.error("has-other-manager check failed", { organization_id, excluded_membership_id, error });
    throw new Error(r.t("permission_structure"));
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
      throw new Error(r.t("org_not_found"));
    }

    const tenant_slug = orgRes.data["tenants"]?.["tenant_slug"];
    if (!tenant_slug) {
      throw new Error(r.t("tenant_not_found"));
    }

    const headerList = await headers();
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    const host = headerList.get("host") ?? "";
    const locale = await getServerLocale();
    const expires_at = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    if (parsedInput.channel === "email") {
      const email = (parsedInput.invitation_email ?? "").trim().toLowerCase();
      if (!email) throw new Error(r.t("invite_failed"));

      const dup = await admin
        .from("memberships")
        .select("membership_id")
        .eq("organization_id", parsedInput.organization_id)
        .eq("membership_invite_email", email)
        .is("profile_id", null)
        .is("membership_revoked_at", null)
        .is("membership_rejected_at", null)
        .maybeSingle();
      if (dup.data) {
        throw new Error(r.t("invitation_duplicate"));
      }

      const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!existing.error) {
        const existing_user = existing.data.users.find((u) => u["email"]?.toLowerCase() === email);
        if (existing_user) {
          const memberDup = await admin
            .from("memberships")
            .select("membership_id")
            .eq("organization_id", parsedInput.organization_id)
            .eq("profile_id", existing_user["id"])
            .not("membership_accepted_at", "is", null)
            .is("membership_revoked_at", null)
            .is("membership_rejected_at", null)
            .maybeSingle();
          if (memberDup.data) {
            throw new Error(r.t("email_already_member"));
          }
        }
      }

      const token = GENERATE_INVITATION_TOKEN();

      const insertRes = await admin
        .from("memberships")
        .insert({
          organization_id: parsedInput.organization_id,
          membership_invite_email: email,
          membership_invite_token: token,
          membership_invite_expires_at: expires_at,
        })
        .select("membership_id")
        .single();

      if (insertRes.error || !insertRes.data) {
        log.error("invitation insert failed", {
          profile_id: user.id,
          organization_id: parsedInput.organization_id,
          error: insertRes.error,
        });
        throw new Error(r.t("invite_failed"));
      }

      const acceptUrl = `${proto}://${host}/${locale}/auth/document/accept?token=${encodeURIComponent(token)}`;

      const invite = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: acceptUrl,
        data: {
          membership_id: insertRes.data["membership_id"],
          organization_id: parsedInput.organization_id,
          tenant_slug,
        },
      });
      if (invite.error) {
        log.warn("supabase inviteUserByEmail failed; membership row kept", {
          organization_id: parsedInput.organization_id,
          email,
          error: invite.error.message,
        });
      }

      revalidatePath(`/${locale}/${tenant_slug}/${parsedInput.organization_id}/settings/members`);
      return {
        membership_id: insertRes.data["membership_id"],
        invitation_url: acceptUrl,
        channel: "email" as const,
      };
    }

    if (parsedInput.channel === "phone") {
      const phone = (parsedInput.invitation_phone ?? "").trim();
      if (!phone) throw new Error(r.t("invite_failed"));

      const token = GENERATE_INVITATION_TOKEN();

      const insertRes = await admin
        .from("memberships")
        .insert({
          organization_id: parsedInput.organization_id,
          membership_invite_phone: phone,
          membership_invite_token: token,
          membership_invite_expires_at: expires_at,
        })
        .select("membership_id")
        .single();

      if (insertRes.error || !insertRes.data) {
        log.error("membership phone insert failed", {
          profile_id: user.id,
          organization_id: parsedInput.organization_id,
          error: insertRes.error,
        });
        if (insertRes.error?.code === "23505") {
          throw new Error(r.t("phone_duplicate"));
        }
        if (insertRes.error?.message?.toLowerCase().includes("invalid invite phone")) {
          throw new Error(r.t("phone_invalid"));
        }
        throw new Error(r.t("invite_failed"));
      }

      const acceptUrl = `${proto}://${host}/${locale}/auth/document/accept?token=${encodeURIComponent(token)}`;

      revalidatePath(`/${locale}/${tenant_slug}/${parsedInput.organization_id}/settings/members`);
      return {
        membership_id: insertRes.data["membership_id"],
        invitation_url: acceptUrl,
        channel: "phone" as const,
      };
    }

    // channel === "document"
    const country = parsedInput.address_level0_id || "";
    const kind = parsedInput.profile_identity_document_kind || null;
    const value = (parsedInput.profile_identity_document_value || "").trim();
    if (!country || !kind || !value) throw new Error(r.t("invite_failed"));

    const dup = await admin
      .from("memberships")
      .select("membership_id")
      .eq("organization_id", parsedInput.organization_id)
      .eq("membership_invite_address_level0_id", country)
      .eq("membership_invite_document_kind", kind)
      .eq("membership_invite_document_value", value)
      .is("profile_id", null)
      .is("membership_revoked_at", null)
      .is("membership_rejected_at", null)
      .maybeSingle();
    if (dup.data) {
      throw new Error(r.t("invitation_duplicate"));
    }

    const token = GENERATE_INVITATION_TOKEN();

    const insertRes = await admin
      .from("memberships")
      .insert({
        organization_id: parsedInput.organization_id,
        membership_invite_address_level0_id: country,
        membership_invite_document_kind: kind,
        membership_invite_document_value: value,
        membership_invite_token: token,
        membership_invite_expires_at: expires_at,
      })
      .select("membership_id")
      .single();

    if (insertRes.error || !insertRes.data) {
      log.error("membership document insert failed", {
        profile_id: user.id,
        organization_id: parsedInput.organization_id,
        error: insertRes.error,
      });
      if (insertRes.error?.message?.toLowerCase().includes("invalid")) {
        throw new Error("El documento ingresado no es válido (verifica el dígito verificador del RUT).");
      }
      throw new Error(r.t("invite_failed"));
    }

    const acceptUrl = `${proto}://${host}/${locale}/auth/document/accept?token=${encodeURIComponent(token)}`;

    revalidatePath(`/${locale}/${tenant_slug}/${parsedInput.organization_id}/settings/members`);
    return {
      membership_id: insertRes.data["membership_id"],
      invitation_url: acceptUrl,
      channel: "document" as const,
    };
  });

export const actionCancelInvitation = authedAction
  .inputSchema(cancelInvitationSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    const admin = createServiceRoleClient();

    const invRes = await admin
      .from("memberships")
      .select("organization_id, organizations(tenants(tenant_slug))")
      .eq("membership_id", parsedInput.membership_id)
      .maybeSingle();

    if (invRes.error || !invRes.data) {
      log.error("cancel: invitation lookup failed", {
        membership_id: parsedInput.membership_id,
        error: invRes.error,
      });
      throw new Error(r.t("invitation_not_found"));
    }

    await ASSERT_MEMBERS_MANAGE(supabase, r, invRes.data["organization_id"]);

    const tenant_slug = invRes.data["organizations"]?.["tenants"]?.["tenant_slug"];

    const { error } = await admin
      .from("memberships")
      .update({
        membership_revoked_at: new Date().toISOString(),
        membership_invite_token: null,
      })
      .eq("membership_id", parsedInput.membership_id)
      .is("profile_id", null)
      .is("membership_revoked_at", null)
      .is("membership_rejected_at", null);

    if (error) {
      log.error("invitation revoke failed", {
        profile_id: user.id,
        membership_id: parsedInput.membership_id,
        error,
      });
      throw new Error(r.t("cancel_failed"));
    }

    if (tenant_slug) {
      revalidatePath(`/${await getServerLocale()}/${tenant_slug}/${invRes.data["organization_id"]}/settings/members`);
    }
  });

export const actionTogglePermission = authedAction
  .inputSchema(togglePermissionSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    const admin = createServiceRoleClient();
    const m = await LOAD_MEMBERSHIP(admin, parsedInput.membership_id);
    if (!m) throw new Error(r.t("membership_not_found"));

    await ASSERT_MEMBERS_MANAGE(supabase, r, m.organization_id);

    if (parsedInput.permission_id === PERMISSION_SLUG_WILDCARD) {
      throw new Error(r.t("wildcard_usage"));
    }

    // Revoking members_manage from a CLAIMED admin: ensure they aren't the last one.
    // Pending invites can't lock anything since they have no profile yet.
    if (
      !parsedInput.granted &&
      parsedInput.permission_id === "members_manage" &&
      m.profile_id &&
      !(await HAS_OTHER_MANAGER(admin, r, m.organization_id, parsedInput.membership_id))
    ) {
      throw new Error(r.t("last_manager_revoke"));
    }

    if (parsedInput.granted) {
      const { error } = await admin.from("membership_permissions").upsert(
        {
          membership_id: parsedInput.membership_id,
          permission_id: parsedInput.permission_id,
        },
        { onConflict: "membership_id,permission_id", ignoreDuplicates: true },
      );
      if (error) {
        log.error("grant permission failed", {
          profile_id: user.id,
          membership_id: parsedInput.membership_id,
          permission_id: parsedInput.permission_id,
          error,
        });
        throw new Error(r.t("grant_failed"));
      }
    } else {
      const { error } = await admin
        .from("membership_permissions")
        .delete()
        .eq("membership_id", parsedInput.membership_id)
        .eq("permission_id", parsedInput.permission_id);
      if (error) {
        log.error("revoke permission failed", {
          profile_id: user.id,
          membership_id: parsedInput.membership_id,
          permission_id: parsedInput.permission_id,
          error,
        });
        throw new Error(r.t("revoke_failed"));
      }
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });

// Toggles the wildcard '*' grant. Demote requires another active admin in the org;
// promote is unconditional (the membership owner already has members_manage to call this).
export const actionToggleWildcard = authedAction
  .inputSchema(demoteWildcardSchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const r = await GET_ROSETTA();
    const admin = createServiceRoleClient();
    const m = await LOAD_MEMBERSHIP(admin, parsedInput.membership_id);
    if (!m) throw new Error(r.t("membership_not_found"));

    await ASSERT_MEMBERS_MANAGE(supabase, r, m.organization_id);

    const existing = await admin
      .from("membership_permissions")
      .select("permission_id")
      .eq("membership_id", parsedInput.membership_id)
      .eq("permission_id", PERMISSION_SLUG_WILDCARD)
      .maybeSingle();
    const has_wildcard = !!existing.data;

    if (has_wildcard) {
      if (m.profile_id && !(await HAS_OTHER_MANAGER(admin, r, m.organization_id, parsedInput.membership_id))) {
        throw new Error(r.t("last_manager_demote"));
      }
      const { error } = await admin
        .from("membership_permissions")
        .delete()
        .eq("membership_id", parsedInput.membership_id)
        .eq("permission_id", PERMISSION_SLUG_WILDCARD);
      if (error) throw new Error(r.t("demote_failed"));
    } else {
      const { error } = await admin
        .from("membership_permissions")
        .upsert(
          { membership_id: parsedInput.membership_id, permission_id: PERMISSION_SLUG_WILDCARD },
          { onConflict: "membership_id,permission_id", ignoreDuplicates: true },
        );
      if (error) throw new Error(r.t("grant_failed"));
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });

// Legacy name kept for callers that only "demote." Toggle action now promotes-or-demotes.
export const actionDemoteWildcard = actionToggleWildcard;

export const actionRemoveMember = authedAction
  .inputSchema(removeMemberSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const r = await GET_ROSETTA();
    const admin = createServiceRoleClient();
    const m = await LOAD_MEMBERSHIP(admin, parsedInput.membership_id);
    if (!m) throw new Error(r.t("membership_not_found"));

    await ASSERT_MEMBERS_MANAGE(supabase, r, m.organization_id);

    if (m.profile_id === user.id) {
      throw new Error(r.t("self_remove"));
    }

    if (m.profile_id && !(await HAS_OTHER_MANAGER(admin, r, m.organization_id, parsedInput.membership_id))) {
      throw new Error(r.t("last_manager_remove"));
    }

    const { error } = await admin
      .from("memberships")
      .update({ membership_revoked_at: new Date().toISOString() })
      .eq("membership_id", parsedInput.membership_id);

    if (error) {
      log.error("remove member failed", {
        profile_id: user.id,
        membership_id: parsedInput.membership_id,
        error,
      });
      throw new Error(r.t("remove_failed"));
    }

    revalidatePath(`/${await getServerLocale()}`, "layout");
  });
