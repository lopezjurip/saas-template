"use server";
import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:[locale]:(app):a:[agency_slug]:actions");

const inviteAffiliateSchema = z.object({
  agency_id: z.coerce.number().int().positive(),
  invitation_email: z.string().trim().email().max(254),
});

/**
 * Invite a person to an agency by email.
 *
 * Two concerns split by trust boundary: ensuring an auth user exists (GoTrue, service-role,
 * can't run under RLS) stays here; the membership write goes through the caller's RLS context
 * via `viewer_agency_membership_invite_by_email`, which enforces `agency_members_manage`. We
 * pre-check that capability so an unauthorized caller can't trigger user creation / invite email.
 */
export const actionInviteAffiliate = authedAction
  .inputSchema(inviteAffiliateSchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { TError } = await getRosetta(LOCALES);

    const email = parsedInput.invitation_email.trim().toLowerCase();

    // Permission pre-check (the RPC re-checks too) — gate the GoTrue side effects.
    const { data: canManage } = await supabase
      .rpc("viewer_has_agency_team_permission", {
        agency_id: parsedInput.agency_id,
        permission_id: "agency_members_manage",
      })
      .throwOnError();
    if (!canManage) {
      throw new TError("no_permission");
    }

    // Ensure an auth user exists for this email (GoTrue — service-role, not transactional).
    // NOTE: listUsers is paginated; known limitation below 1000 users.
    const admin = createSupabaseServiceRoleClient();
    const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = existing.error ? undefined : existing.data.users.find((u) => u["email"]?.toLowerCase() === email);

    if (!match) {
      const headerList = await headers();
      const proto = headerList.get("x-forwarded-proto") ?? "https";
      const host = headerList.get("host") ?? "";
      const redirectTo = `${proto}://${host}/affiliate`;
      const invite = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (invite.error || !invite.data.user) {
        log.error("[actionInviteAffiliate] inviteUserByEmail failed", {
          agency_id: parsedInput.agency_id,
          email,
          error: invite.error?.message,
        });
        throw new TError("invite_failed");
      }
    }

    // Membership upsert under the caller's RLS context (resolves the profile by email in-DB).
    const { error: rpcError } = await supabase.rpc("viewer_agency_membership_invite_by_email", {
      agency_id: parsedInput.agency_id,
      email,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionInviteAffiliate] viewer_agency_membership_invite_by_email failed", {
        agency_id: parsedInput.agency_id,
        email,
        error: rpcError.message,
      });
      throw new TError("invite_failed");
    }

    // Fetch slug for cache invalidation (caller is an affiliate → RLS allows the read).
    const agencyRes = await supabase
      .from("agencies")
      .select("agency_slug")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();

    const slug = agencyRes.data?.["agency_slug"];
    if (slug) {
      revalidatePath(`/admin/agencies/${slug}`);
      // Layout scope so the agency shell's child routes (team, access, …) all refresh.
      revalidatePath(`/a/${slug}`, "layout");
    }
    return { email };
  });

const membershipActionSchema = z.object({
  // agency_id is kept only for cache revalidation; the RPC derives it from the membership row.
  agency_id: z.coerce.number().int().positive(),
  agency_membership_id: z.number().int().positive(),
  operation: z.enum(["revoke", "reactivate"]),
});

/**
 * Revoke or reactivate another affiliate's membership. Runs under the caller's RLS context;
 * `viewer_agency_membership_update` enforces `agency_members_manage` and last-admin protection.
 */
export const actionUpdateAffiliateMembership = authedAction
  .inputSchema(membershipActionSchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { TError } = await getRosetta(LOCALES);

    const { error: rpcError } = await supabase.rpc("viewer_agency_membership_update", {
      agency_membership_id: parsedInput.agency_membership_id,
      operation: parsedInput.operation,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionUpdateAffiliateMembership] viewer_agency_membership_update failed", {
        agency_id: parsedInput.agency_id,
        agency_membership_id: parsedInput.agency_membership_id,
        error: rpcError.message,
      });
      throw new TError("update_failed");
    }

    const agencyRes = await supabase
      .from("agencies")
      .select("agency_slug")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();

    const slug = agencyRes.data?.["agency_slug"];
    if (slug) {
      revalidatePath(`/admin/agencies/${slug}`);
      // Layout scope so the agency shell's child routes (team, access, …) all refresh.
      revalidatePath(`/a/${slug}`, "layout");
    }
    return { agency_membership_id: parsedInput.agency_membership_id };
  });

const respondInvitationSchema = z.object({
  agency_membership_id: z.number().int().positive(),
  response: z.enum(["accept", "reject"]),
});

/**
 * The invited person responds to their own pending invite.
 * Uses the authenticated server client — the RPC resolves the caller via
 * viewer_profile_id() and enforces ownership in-DB.
 */
export const actionRespondInvitation = authedAction
  .inputSchema(respondInvitationSchema)
  .action(async ({ parsedInput }) => {
    const { TError } = await getRosetta(LOCALES);
    const supabase = await createSupabaseServerClient();

    const { error: rpcError } = await supabase.rpc("viewer_agency_membership_respond", {
      agency_membership_id: parsedInput.agency_membership_id,
      response: parsedInput.response,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionRespondInvitation] viewer_agency_membership_respond failed", {
        agency_membership_id: parsedInput.agency_membership_id,
        error: rpcError.message,
      });
      throw new TError("respond_failed");
    }

    revalidatePath("/affiliate");
    return { response: parsedInput.response };
  });

const LOCALE_ES = {
  no_permission: "No tienes permiso para gestionar el equipo de esta agencia",
  agency_not_found: "Agencia no encontrada",
  user_not_found: "No existe una cuenta registrada con ese correo",
  invite_failed: "No pudimos enviar la invitación",
  already_member: "Esa persona ya es afiliada activa de la agencia",
  update_failed: "No pudimos actualizar la afiliación",
  membership_not_found: "Membresía no encontrada",
  last_admin_protected: "No puedes revocar al último administrador del equipo de la agencia",
  invalid_operation: "Operación inválida",
  not_authenticated: "No autenticado",
  invitation_not_found: "Invitación no encontrada",
  invitation_not_pending: "Esta invitación ya fue respondida",
  invalid_response: "Respuesta inválida",
  respond_failed: "No pudimos registrar tu respuesta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  no_permission: "You don't have permission to manage this agency's team",
  agency_not_found: "Agency not found",
  user_not_found: "No registered account exists for that email",
  invite_failed: "We couldn't send the invitation",
  already_member: "That person is already an active affiliate of the agency",
  update_failed: "We couldn't update the affiliation",
  membership_not_found: "Membership not found",
  last_admin_protected: "You can't revoke the agency team's last admin",
  invalid_operation: "Invalid operation",
  not_authenticated: "Not authenticated",
  invitation_not_found: "Invitation not found",
  invitation_not_pending: "This invitation has already been answered",
  invalid_response: "Invalid response",
  respond_failed: "We couldn't record your response",
};

const LOCALE_PT: typeof LOCALE_ES = {
  no_permission: "Você não tem permissão para gerenciar a equipe desta agência",
  agency_not_found: "Agência não encontrada",
  user_not_found: "Não existe uma conta registrada com esse e-mail",
  invite_failed: "Não conseguimos enviar o convite",
  already_member: "Essa pessoa já é afiliada ativa da agência",
  update_failed: "Não conseguimos atualizar a afiliação",
  membership_not_found: "Membro não encontrado",
  last_admin_protected: "Você não pode revogar o último administrador da equipe da agência",
  invalid_operation: "Operação inválida",
  not_authenticated: "Não autenticado",
  invitation_not_found: "Convite não encontrado",
  invitation_not_pending: "Este convite já foi respondido",
  invalid_response: "Resposta inválida",
  respond_failed: "Não conseguimos registrar sua resposta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
