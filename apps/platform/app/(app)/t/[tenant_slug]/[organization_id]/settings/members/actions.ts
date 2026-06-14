"use server";
import "server-only";

import { randomBytes } from "node:crypto";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { captureMemberInvited } from "~/lib/posthog/events.server";
import { authedAction } from "~/lib/safe-action.server";
import { inviteMemberSchema } from "./schemas";

const log = debug("admin:members");

const INVITATION_TTL_DAYS = 14;

function GENERATE_INVITATION_TOKEN(): string {
  return randomBytes(32).toString("base64url");
}

export const actionInviteMember = authedAction
  .inputSchema(inviteMemberSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { t, TError } = await getRosetta(LOCALES);
    const { data: canManage } = await supabase
      .rpc("viewer_has_permission", {
        organization_id: parsedInput["organization_id"],
        permission_id: "members_manage",
      })
      .throwOnError();
    if (!canManage) {
      throw new TError("no_permission");
    }

    const admin = createServiceRoleClient();

    const orgRes = await admin
      .from("organizations")
      .select("organization_id, organization_name, tenant_id, tenants(tenant_name, tenant_slug)")
      .eq("organization_id", parsedInput["organization_id"])
      .throwOnError()
      .maybeSingle();

    if (!orgRes.data) {
      log.error("invite: org lookup failed", { organization_id: parsedInput["organization_id"] });
      throw new TError("org_not_found");
    }

    const tenant_slug = orgRes.data["tenants"]?.["tenant_slug"];
    if (!tenant_slug) {
      throw new TError("tenant_not_found");
    }

    const headerList = await headers();
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    const host = headerList.get("host") ?? "";
    const expires_at = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    if (parsedInput.channel === "email") {
      const email = (parsedInput.invitation_email ?? "").trim().toLowerCase();
      if (!email) throw new Error(t("invite_failed"));

      const dup = await admin
        .from("organization_memberships")
        .select("organization_membership_id")
        .eq("organization_id", parsedInput["organization_id"])
        .eq("organization_membership_invite_email", email)
        .is("profile_id", null)
        .is("organization_membership_revoked_at", null)
        .is("organization_membership_rejected_at", null)
        .maybeSingle();
      if (dup.data) {
        throw new TError("invitation_duplicate");
      }

      const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!existing.error) {
        const existing_user = existing.data.users.find((u) => u["email"]?.toLowerCase() === email);
        if (existing_user) {
          const memberDup = await admin
            .from("organization_memberships")
            .select("organization_membership_id")
            .eq("organization_id", parsedInput["organization_id"])
            .eq("profile_id", existing_user["id"])
            .not("organization_membership_accepted_at", "is", null)
            .is("organization_membership_revoked_at", null)
            .is("organization_membership_rejected_at", null)
            .maybeSingle();
          if (memberDup.data) {
            throw new TError("email_already_member");
          }
        }
      }

      const token = GENERATE_INVITATION_TOKEN();

      const insertRes = await admin
        .from("organization_memberships")
        .insert({
          organization_id: parsedInput["organization_id"],
          organization_membership_invite_email: email,
          organization_membership_invite_token: token,
          organization_membership_invite_expires_at: expires_at,
        })
        .select("organization_membership_id")
        .single();

      if (insertRes.error || !insertRes.data) {
        log.error("invitation insert failed", {
          profile_id: user.id,
          organization_id: parsedInput["organization_id"],
          error: insertRes.error,
        });
        throw new TError("invite_failed");
      }

      const acceptUrl = `${proto}://${host}/auth/document/accept?token=${encodeURIComponent(token)}`;

      const invite = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: acceptUrl,
        data: {
          organization_membership_id: insertRes.data["organization_membership_id"],
          organization_id: parsedInput["organization_id"],
          tenant_slug,
        },
      });
      if (invite.error) {
        log.warn("supabase inviteUserByEmail failed; organization_membership row kept", {
          organization_id: parsedInput["organization_id"],
          email,
          error: invite.error.message,
        });
      }

      revalidatePath(`/${tenant_slug}/${parsedInput["organization_id"]}/settings/members`);
      void captureMemberInvited(user.id, {
        organization_id: parsedInput["organization_id"],
        tenant_id: orgRes.data["tenant_id"],
        channel: "email",
      });
      return {
        organization_membership_id: insertRes.data["organization_membership_id"],
        invitation_url: acceptUrl,
        channel: "email" as const,
      };
    }

    if (parsedInput.channel === "phone") {
      const phone = (parsedInput.invitation_phone ?? "").trim();
      if (!phone) throw new Error(t("invite_failed"));

      const token = GENERATE_INVITATION_TOKEN();

      const insertRes = await admin
        .from("organization_memberships")
        .insert({
          organization_id: parsedInput["organization_id"],
          organization_membership_invite_phone: phone,
          organization_membership_invite_token: token,
          organization_membership_invite_expires_at: expires_at,
        })
        .select("organization_membership_id")
        .single();

      if (insertRes.error || !insertRes.data) {
        log.error("organization_membership phone insert failed", {
          profile_id: user.id,
          organization_id: parsedInput["organization_id"],
          error: insertRes.error,
        });
        if (insertRes.error?.code === "23505") {
          throw new TError("phone_duplicate");
        }
        if (insertRes.error?.message?.toLowerCase().includes("invalid invite phone")) {
          throw new TError("phone_invalid");
        }
        throw new TError("invite_failed");
      }

      const acceptUrl = `${proto}://${host}/auth/document/accept?token=${encodeURIComponent(token)}`;

      revalidatePath(`/${tenant_slug}/${parsedInput["organization_id"]}/settings/members`);
      void captureMemberInvited(user.id, {
        organization_id: parsedInput["organization_id"],
        tenant_id: orgRes.data["tenant_id"],
        channel: "phone",
      });
      return {
        organization_membership_id: insertRes.data["organization_membership_id"],
        invitation_url: acceptUrl,
        channel: "phone" as const,
      };
    }

    // channel === "document"
    const country = parsedInput.address_level0_id || "";
    const kind = parsedInput.profile_identity_document_kind || null;
    const value = (parsedInput.profile_identity_document_value || "").trim();
    if (!country || !kind || !value) throw new Error(t("invite_failed"));

    const dup = await admin
      .from("organization_memberships")
      .select("organization_membership_id")
      .eq("organization_id", parsedInput["organization_id"])
      .eq("organization_membership_invite_address_level0_id", country)
      .eq("organization_membership_invite_document_kind", kind)
      .eq("organization_membership_invite_document_value", value)
      .is("profile_id", null)
      .is("organization_membership_revoked_at", null)
      .is("organization_membership_rejected_at", null)
      .maybeSingle();
    if (dup.data) {
      throw new TError("invitation_duplicate");
    }

    const token = GENERATE_INVITATION_TOKEN();

    const insertRes = await admin
      .from("organization_memberships")
      .insert({
        organization_id: parsedInput["organization_id"],
        organization_membership_invite_address_level0_id: country,
        organization_membership_invite_document_kind: kind,
        organization_membership_invite_document_value: value,
        organization_membership_invite_token: token,
        organization_membership_invite_expires_at: expires_at,
      })
      .select("organization_membership_id")
      .single();

    if (insertRes.error || !insertRes.data) {
      log.error("organization_membership document insert failed", {
        profile_id: user.id,
        organization_id: parsedInput["organization_id"],
        error: insertRes.error,
      });
      if (insertRes.error?.message?.toLowerCase().includes("invalid")) {
        throw new TError("document_invalid");
      }
      throw new TError("invite_failed");
    }

    const acceptUrl = `${proto}://${host}/auth/document/accept?token=${encodeURIComponent(token)}`;

    revalidatePath(`/${tenant_slug}/${parsedInput["organization_id"]}/settings/members`);
    await captureMemberInvited(user.id, {
      organization_id: parsedInput["organization_id"],
      tenant_id: orgRes.data["tenant_id"],
      channel: "document",
    });
    return {
      organization_membership_id: insertRes.data["organization_membership_id"],
      invitation_url: acceptUrl,
      channel: "document" as const,
    };
  });

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
  document_invalid: "El documento ingresado no es válido (verifica el dígito verificador del RUT)",
};

const LOCALE_EN: typeof LOCALE_ES = {
  no_permission: "You don't have permission to manage members in this organization",
  permission_check: "We couldn't verify your permissions",
  org_not_found: "Organization not found",
  tenant_not_found: "Tenant not found",
  invitation_duplicate: "There's already a pending invitation for that email in this organization",
  phone_duplicate: "There's already a pending invitation for that phone number in this organization",
  phone_invalid: "The phone number entered is not valid",
  email_already_member: "That email already belongs to a member of the organization",
  invite_failed: "We couldn't create the invitation",
  document_invalid: "The document entered is not valid (check the RUT check digit)",
};

const LOCALE_PT: typeof LOCALE_ES = {
  no_permission: "Você não tem permissão para administrar membros nesta organização",
  permission_check: "Não conseguimos verificar suas permissões",
  org_not_found: "Organização não encontrada",
  tenant_not_found: "Tenant não encontrado",
  invitation_duplicate: "Já existe um convite pendente para esse e-mail nesta organização",
  phone_duplicate: "Já existe um convite pendente para esse número de telefone nesta organização",
  phone_invalid: "O número de telefone informado não é válido",
  email_already_member: "Esse e-mail já pertence a um membro da organização",
  invite_failed: "Não conseguimos criar o convite",
  document_invalid: "O documento informado não é válido (verifique o dígito verificador do RUT)",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
