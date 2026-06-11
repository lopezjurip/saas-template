"use server";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { getRosetta } from "~/hooks/get-rosetta";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("agencies:affiliates");

// Resolve the caller's ACTIVE (accepted, not revoked/rejected) membership of an
// agency. Any active affiliate may invite or revoke others (no agency-admin
// concept — all affiliates are equal). Returns the agency row when allowed.
async function ASSERT_ACTIVE_AFFILIATE(
  admin: ReturnType<typeof createServiceRoleClient>,
  agency_id: string,
  profile_id: string,
): Promise<boolean> {
  const res = await admin
    .from("agency_memberships")
    .select("agency_membership_id")
    .eq("agency_id", agency_id)
    .eq("profile_id", profile_id)
    .not("agency_membership_accepted_at", "is", null)
    .is("agency_membership_revoked_at", null)
    .is("agency_membership_rejected_at", null)
    .maybeSingle();
  return Boolean(res.data);
}

const inviteAffiliateSchema = z.object({
  agency_id: z.string().uuid(),
  invitation_email: z.string().trim().email().max(254),
});

type InviteAffiliateValues = z.infer<typeof inviteAffiliateSchema>;

// Invite a person to an agency by email. agency_memberships has profile_id NOT NULL
// with no invite/token columns, so we must resolve a profile first: look up the
// auth user by email; if absent, invite them by email (the users_handle_created
// trigger creates the profile). The membership is inserted with accepted_at = null
// (pending) — the invited person flips accepted_at/rejected_at from their own
// affiliate portal.
export const actionInviteAffiliate = authedAction
  .inputSchema(inviteAffiliateSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    const allowed = await ASSERT_ACTIVE_AFFILIATE(admin, parsedInput.agency_id, user.id);
    if (!allowed) {
      throw new TError("no_permission");
    }

    const agencyRes = await admin
      .from("agencies")
      .select("agency_id, agency_slug")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();
    if (!agencyRes.data) {
      throw new TError("agency_not_found");
    }

    const email = parsedInput.invitation_email.trim().toLowerCase();

    // Resolve (or create) the auth user behind this email.
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
      const locale = await getServerLocale();
      const redirectTo = `${proto}://${host}/${locale}/affiliate`;
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

    // Already a member? Surface the right error or re-activate a revoked seat.
    const existingMembership = await admin
      .from("agency_memberships")
      .select(
        "agency_membership_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at",
      )
      .eq("agency_id", parsedInput.agency_id)
      .eq("profile_id", profile_id)
      .maybeSingle();

    if (existingMembership.data) {
      const m = existingMembership.data;
      const isActive =
        m.agency_membership_accepted_at && !m.agency_membership_revoked_at && !m.agency_membership_rejected_at;
      if (isActive) {
        throw new TError("already_member");
      }
      // Reset a revoked/rejected/pending seat back to a fresh pending invite.
      const reset = await admin
        .from("agency_memberships")
        .update({
          agency_membership_accepted_at: null,
          agency_membership_revoked_at: null,
          agency_membership_rejected_at: null,
        })
        .eq("agency_membership_id", m.agency_membership_id);
      if (reset.error) {
        log.error("[actionInviteAffiliate] membership reset failed", {
          agency_id: parsedInput.agency_id,
          profile_id,
          error: reset.error,
        });
        throw new TError("invite_failed");
      }
    } else {
      const insertRes = await admin
        .from("agency_memberships")
        .insert({ agency_id: parsedInput.agency_id, profile_id })
        .select("agency_membership_id")
        .single();
      if (insertRes.error) {
        log.error("[actionInviteAffiliate] membership insert failed", {
          agency_id: parsedInput.agency_id,
          profile_id,
          error: insertRes.error,
        });
        throw new TError("invite_failed");
      }
    }

    const locale = await getServerLocale();
    revalidatePath(`/${locale}/admin/agencies/${agencyRes.data.agency_slug}`);
    revalidatePath(`/${locale}/a/${agencyRes.data.agency_slug}`);
    return { email };
  });

const membershipActionSchema = z.object({
  agency_id: z.string().uuid(),
  agency_membership_id: z.number().int().positive(),
  operation: z.enum(["revoke", "reactivate"]),
});

type MembershipActionValues = z.infer<typeof membershipActionSchema>;

// Revoke or reactivate another affiliate's membership. Any active affiliate may do this.
export const actionUpdateAffiliateMembership = authedAction
  .inputSchema(membershipActionSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    const allowed = await ASSERT_ACTIVE_AFFILIATE(admin, parsedInput.agency_id, user.id);
    if (!allowed) {
      throw new TError("no_permission");
    }

    const now = new Date().toISOString();
    const patch =
      parsedInput.operation === "revoke"
        ? { agency_membership_revoked_at: now }
        : { agency_membership_revoked_at: null, agency_membership_rejected_at: null, agency_membership_accepted_at: now };

    const updateRes = await admin
      .from("agency_memberships")
      .update(patch)
      .eq("agency_membership_id", parsedInput.agency_membership_id)
      .eq("agency_id", parsedInput.agency_id)
      .select("agency_membership_id, agencies(agency_slug)")
      .single();

    if (updateRes.error || !updateRes.data) {
      log.error("[actionUpdateAffiliateMembership] update failed", {
        agency_id: parsedInput.agency_id,
        agency_membership_id: parsedInput.agency_membership_id,
        error: updateRes.error,
      });
      throw new TError("update_failed");
    }

    const slug = updateRes.data.agencies?.agency_slug;
    const locale = await getServerLocale();
    if (slug) {
      revalidatePath(`/${locale}/admin/agencies/${slug}`);
      revalidatePath(`/${locale}/a/${slug}`);
    }
    return { agency_membership_id: parsedInput.agency_membership_id };
  });

// The invited person responds to their own pending invite from the affiliate portal.
const respondInvitationSchema = z.object({
  agency_membership_id: z.number().int().positive(),
  response: z.enum(["accept", "reject"]),
});

type RespondInvitationValues = z.infer<typeof respondInvitationSchema>;

export const actionRespondInvitation = authedAction
  .inputSchema(respondInvitationSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    // The membership must belong to the caller and be pending.
    const membershipRes = await admin
      .from("agency_memberships")
      .select(
        "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at",
      )
      .eq("agency_membership_id", parsedInput.agency_membership_id)
      .maybeSingle();

    if (!membershipRes.data || membershipRes.data.profile_id !== user.id) {
      throw new TError("invitation_not_found");
    }
    const m = membershipRes.data;
    if (m.agency_membership_revoked_at || m.agency_membership_accepted_at || m.agency_membership_rejected_at) {
      throw new TError("invitation_not_pending");
    }

    const now = new Date().toISOString();
    const patch =
      parsedInput.response === "accept"
        ? { agency_membership_accepted_at: now }
        : { agency_membership_rejected_at: now };

    const updateRes = await admin
      .from("agency_memberships")
      .update(patch)
      .eq("agency_membership_id", parsedInput.agency_membership_id);

    if (updateRes.error) {
      log.error("[actionRespondInvitation] update failed", {
        agency_membership_id: parsedInput.agency_membership_id,
        error: updateRes.error,
      });
      throw new TError("respond_failed");
    }

    const locale = await getServerLocale();
    revalidatePath(`/${locale}/affiliate`);
    return { response: parsedInput.response };
  });

const LOCALE_ES = {
  no_permission: "Debes ser afiliado activo de esta agencia para gestionar a su equipo",
  agency_not_found: "Agencia no encontrada",
  invite_failed: "No pudimos enviar la invitación",
  already_member: "Esa persona ya es afiliada activa de la agencia",
  update_failed: "No pudimos actualizar la afiliación",
  invitation_not_found: "Invitación no encontrada",
  invitation_not_pending: "Esta invitación ya fue respondida",
  respond_failed: "No pudimos registrar tu respuesta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  no_permission: "You must be an active affiliate of this agency to manage its team",
  agency_not_found: "Agency not found",
  invite_failed: "We couldn't send the invitation",
  already_member: "That person is already an active affiliate of the agency",
  update_failed: "We couldn't update the affiliation",
  invitation_not_found: "Invitation not found",
  invitation_not_pending: "This invitation has already been answered",
  respond_failed: "We couldn't record your response",
};

const LOCALE_PT: typeof LOCALE_ES = {
  no_permission: "Você precisa ser afiliado ativo desta agência para gerenciar sua equipe",
  agency_not_found: "Agência não encontrada",
  invite_failed: "Não conseguimos enviar o convite",
  already_member: "Essa pessoa já é afiliada ativa da agência",
  update_failed: "Não conseguimos atualizar a afiliação",
  invitation_not_found: "Convite não encontrado",
  invitation_not_pending: "Este convite já foi respondido",
  respond_failed: "Não conseguimos registrar sua resposta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
