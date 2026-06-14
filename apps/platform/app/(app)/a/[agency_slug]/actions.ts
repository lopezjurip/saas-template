"use server";
import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:[locale]:(app):a:[agency_slug]:actions");

const inviteAffiliateSchema = z.object({
  agency_id: z.string().uuid(),
  invitation_email: z.string().trim().email().max(254),
});

/**
 * Invite a person to an agency by email.
 *
 * Auth-user resolution/creation must happen in TS (GoTrue calls can't be
 * transactional). The membership upsert is an atomic RPC so there is no
 * TOCTOU race on insert-vs-reset.
 */
export const actionInviteAffiliate = authedAction
  .inputSchema(inviteAffiliateSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    const email = parsedInput.invitation_email.trim().toLowerCase();

    // Resolve the profile_id for this email from auth.users.
    // NOTE: listUsers is paginated. This is a known limitation below 1000 users;
    // a security-definer SQL helper (like viewer_organization_membership_pending reads
    // auth.users) would replace this, but that requires a schema change.
    const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let profile_id: string | null = null;
    if (!existing.error) {
      const match = existing.data.users.find((u) => u.email?.toLowerCase() === email);
      profile_id = match?.id ?? null;
    }

    if (!profile_id) {
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
      profile_id = invite.data.user.id;
    }

    // Atomic upsert: permission check + insert-or-reset in one DB round-trip.
    const { data: agencySlug, error: rpcError } = await admin.rpc("agency_membership_invite", {
      agency_id: parsedInput.agency_id,
      profile_id: profile_id,
      caller_id: user.id,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionInviteAffiliate] agency_membership_invite failed", {
        agency_id: parsedInput.agency_id,
        profile_id,
        error: rpcError.message,
      });
      throw new TError("invite_failed");
    }

    // Fetch slug for cache invalidation (RPC returns membership_id, not slug).
    const agencyRes = await admin
      .from("agencies")
      .select("agency_slug")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();

    const slug = agencyRes.data?.["agency_slug"];
    if (slug) {
      revalidatePath(`/admin/agencies/${slug}`);
      revalidatePath(`/a/${slug}`);
    }
    return { email };
  });

const membershipActionSchema = z.object({
  agency_id: z.string().uuid(),
  agency_membership_id: z.number().int().positive(),
  operation: z.enum(["revoke", "reactivate"]),
});

/**
 * Revoke or reactivate another affiliate's membership.
 * Permission check + update are atomic inside the RPC.
 */
export const actionUpdateAffiliateMembership = authedAction
  .inputSchema(membershipActionSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    const { error: rpcError } = await admin.rpc("agency_membership_update", {
      agency_membership_id: parsedInput.agency_membership_id,
      agency_id: parsedInput.agency_id,
      operation: parsedInput.operation,
      caller_id: user.id,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionUpdateAffiliateMembership] agency_membership_update failed", {
        agency_id: parsedInput.agency_id,
        agency_membership_id: parsedInput.agency_membership_id,
        error: rpcError.message,
      });
      throw new TError("update_failed");
    }

    const agencyRes = await admin
      .from("agencies")
      .select("agency_slug")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();

    const slug = agencyRes.data?.["agency_slug"];
    if (slug) {
      revalidatePath(`/admin/agencies/${slug}`);
      revalidatePath(`/a/${slug}`);
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
    const supabase = await createServerClient();

    const { error: rpcError } = await supabase.rpc("agency_membership_respond", {
      agency_membership_id: parsedInput.agency_membership_id,
      response: parsedInput.response,
    });

    if (rpcError) {
      const key = rpcError.message as keyof typeof LOCALE_ES;
      if (key in LOCALE_ES) throw new TError(key);
      log.error("[actionRespondInvitation] agency_membership_respond failed", {
        agency_membership_id: parsedInput.agency_membership_id,
        error: rpcError.message,
      });
      throw new TError("respond_failed");
    }

    revalidatePath("/affiliate");
    return { response: parsedInput.response };
  });

const LOCALE_ES = {
  no_permission: "Debes ser afiliado activo de esta agencia para gestionar a su equipo",
  agency_not_found: "Agencia no encontrada",
  invite_failed: "No pudimos enviar la invitación",
  already_member: "Esa persona ya es afiliada activa de la agencia",
  update_failed: "No pudimos actualizar la afiliación",
  membership_not_found: "Membresía no encontrada",
  invalid_operation: "Operación inválida",
  not_authenticated: "No autenticado",
  invitation_not_found: "Invitación no encontrada",
  invitation_not_pending: "Esta invitación ya fue respondida",
  invalid_response: "Respuesta inválida",
  respond_failed: "No pudimos registrar tu respuesta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  no_permission: "You must be an active affiliate of this agency to manage its team",
  agency_not_found: "Agency not found",
  invite_failed: "We couldn't send the invitation",
  already_member: "That person is already an active affiliate of the agency",
  update_failed: "We couldn't update the affiliation",
  membership_not_found: "Membership not found",
  invalid_operation: "Invalid operation",
  not_authenticated: "Not authenticated",
  invitation_not_found: "Invitation not found",
  invitation_not_pending: "This invitation has already been answered",
  invalid_response: "Invalid response",
  respond_failed: "We couldn't record your response",
};

const LOCALE_PT: typeof LOCALE_ES = {
  no_permission: "Você precisa ser afiliado ativo desta agência para gerenciar sua equipe",
  agency_not_found: "Agência não encontrada",
  invite_failed: "Não conseguimos enviar o convite",
  already_member: "Essa pessoa já é afiliada ativa da agência",
  update_failed: "Não conseguimos atualizar a afiliação",
  membership_not_found: "Membro não encontrado",
  invalid_operation: "Operação inválida",
  not_authenticated: "Não autenticado",
  invitation_not_found: "Convite não encontrado",
  invitation_not_pending: "Este convite já foi respondido",
  invalid_response: "Resposta inválida",
  respond_failed: "Não conseguimos registrar sua resposta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
