"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";
import { checkDocumentSchema, verifyLoginOtpSchema } from "./schemas";

const log = debug("auth:document");

type CheckDocumentResult =
  | { kind: "error"; reason: "send_otp_failed"; message?: string }
  | { kind: "redirect_signup"; country: string; doc_kind: "nin" | "passport"; value: string }
  | { kind: "login"; channel: "sms" | "email"; contact: string; masked: string }
  | { kind: "redirect_accept"; invitation_token: string }
  | {
      kind: "pick_invite";
      invites: Array<{
        membership_id: number;
        invitation_token: string;
        organization_id: number;
        organization_name: string;
        tenant_id: number;
        tenant_slug: string;
        tenant_name: string;
        invitation_expires_at: string | null;
      }>;
    };

function maskPhone(phone: string): string {
  const visible = 4;
  if (phone.length <= visible) return phone;
  return `${"•".repeat(Math.max(phone.length - visible, 4))}${phone.slice(-visible)}`;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const head = user.slice(0, 1);
  return `${head}${"•".repeat(Math.max(user.length - 1, 1))}@${domain}`;
}

export const actionCheckDocument = action
  .inputSchema(checkDocumentSchema)
  .action(async ({ parsedInput }): Promise<CheckDocumentResult> => {
    const supabase = await createServerClient();
    const country = parsedInput["address_level0_id"];
    const kind = parsedInput["profile_identity_document_kind"];
    const value = parsedInput["profile_identity_document_value"];

    const { data: profileId, error: resolveError } = await supabase.rpc("profile_identity_resolve", {
      country,
      kind,
      value,
    });
    if (resolveError) {
      log.error("profile_identity_resolve failed", { resolveError });
      throw new Error("No pudimos validar el documento. Intenta de nuevo.");
    }

    const { data: invites, error: invitesError } = await supabase.rpc("memberships_pending_by_document", {
      country,
      kind,
      value,
    });
    if (invitesError) {
      log.error("memberships_pending_by_document failed", { invitesError });
      throw new Error("No pudimos validar el documento. Intenta de nuevo.");
    }
    const invitesList = invites ?? [];

    if (!profileId && invitesList.length === 0) {
      log.info("document check: no profile and no invite — sending to signup with prefill", { country, kind });
      return { kind: "redirect_signup", country, doc_kind: kind, value };
    }

    if (profileId) {
      const adminClient = createServiceRoleClient();
      const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(profileId);
      if (userError || !userResult?.user) {
        log.error("getUserById failed for resolved profile", { profileId, userError });
        throw new Error("No pudimos enviar el código. Contacta a tu administrador.");
      }
      const user = userResult["user"];
      const phone = user["phone"];
      const email = user["email"];
      const contactPhone = phone ? `+${phone}` : null;
      let channel: "sms" | "email";
      let contact: string;
      if (contactPhone) {
        channel = "sms";
        contact = contactPhone;
      } else if (email) {
        channel = "email";
        contact = email;
      } else {
        log.error("resolved profile has no phone nor email", { profileId });
        throw new Error("Cuenta sin canal de contacto. Contacta a tu administrador.");
      }
      const { error: sendError } =
        channel === "sms"
          ? await supabase.auth.signInWithOtp({ phone: contact, options: { shouldCreateUser: false } })
          : await supabase.auth.signInWithOtp({ email: contact, options: { shouldCreateUser: false } });
      if (sendError) {
        log.error("signInWithOtp failed", { profileId, channel, sendError });
        return { kind: "error", reason: "send_otp_failed", message: sendError.message };
      }
      const masked = channel === "sms" ? maskPhone(contact) : maskEmail(contact);
      log.info("document login OTP sent", { profileId, channel, masked });
      return { kind: "login", channel, contact, masked };
    }

    if (invitesList.length === 1) {
      const only = invitesList[0]!;
      log.info("document check: single pending invite", { membership_id: only["membership_id"] });
      const token = only["membership_invite_token"];
      if (!token) {
        log.error("pending invite without token", { membership_id: only["membership_id"] });
        throw new Error("No pudimos validar la invitación. Contacta a tu administrador.");
      }
      return { kind: "redirect_accept", invitation_token: token };
    }

    log.info("document check: multiple pending invites", { count: invitesList.length });
    return {
      kind: "pick_invite",
      invites: invitesList.map((i) => ({
        membership_id: i["membership_id"],
        invitation_token: i["membership_invite_token"] ?? "",
        organization_id: i["organization_id"],
        organization_name: i["organization_name"],
        tenant_id: i["tenant_id"],
        tenant_slug: String(i["tenant_slug"]),
        tenant_name: i["tenant_name"],
        invitation_expires_at: i["membership_invite_expires_at"],
      })),
    };
  });

export const actionVerifyDocumentLoginOtp = action.inputSchema(verifyLoginOtpSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const channel = parsedInput["channel"];
  const contact = parsedInput["contact"];
  const token = parsedInput["token"];

  const { error } =
    channel === "sms"
      ? await supabase.auth.verifyOtp({ type: "sms", phone: contact, token })
      : await supabase.auth.verifyOtp({ type: "email", email: contact, token });

  if (error) {
    log.info("document login OTP rejected", { channel, reason: error.message });
    throw new Error("Código incorrecto o expirado");
  }

  log.info("document login succeeded", { channel });
  const locale = await getServerLocale();
  redirect(`/${locale}/home`);
});
