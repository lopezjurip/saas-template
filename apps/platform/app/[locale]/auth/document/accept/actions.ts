"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { action } from "~/lib/safe-action.server";
import { sendOtpSchema, verifyOtpSchema } from "./schemas";

const log = debug("auth:document:accept");

export const actionStartDocumentSignup = action.inputSchema(sendOtpSchema).action(async ({ parsedInput }) => {
  const admin = createServiceRoleClient();
  const { data: inviteRow, error: inviteError } = await admin
    .from("memberships")
    .select(
      "membership_id, profile_id, membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value, membership_invite_expires_at, membership_accepted_at, membership_rejected_at, membership_revoked_at",
    )
    .eq("membership_invite_token", parsedInput["invitation_token"])
    .maybeSingle();
  if (inviteError) log.error("invitation lookup failed", { error: inviteError });
  if (!inviteRow) throw new Error("Invitación no encontrada");
  const invite = inviteRow;
  if (invite["membership_revoked_at"]) throw new Error("Esta invitación fue cancelada");
  if (invite["membership_rejected_at"]) throw new Error("Esta invitación fue rechazada");
  if (invite["membership_accepted_at"] || invite["profile_id"]) throw new Error("Esta invitación ya fue aceptada");
  if (invite["membership_invite_expires_at"] && new Date(invite["membership_invite_expires_at"]) <= new Date()) {
    throw new Error("Esta invitación expiró");
  }

  const country = invite["membership_invite_address_level0_id"];
  const kind = invite["membership_invite_document_kind"];
  const value = invite["membership_invite_document_value"];
  if (!country || !kind || !value) {
    throw new Error("Esta invitación no tiene documento asociado");
  }

  const channel = parsedInput["channel"];
  const supabase = await createServerClient();
  const metadata = {
    full_name: parsedInput["full_name"],
    profile_identity: { country, kind, value },
  };

  if (channel === "sms") {
    const phone = (parsedInput["phone"] || "").replace(/[\s\-().]/g, "");
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true, data: metadata },
    });
    if (error) {
      log.error("accept OTP send failed (sms)", { error });
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") && msg.includes("document")) {
        throw new Error("El documento de esta invitación ya pertenece a otro perfil.");
      }
      throw new Error("No pudimos enviar el código. Intenta de nuevo.");
    }
    log.info("accept OTP sent (sms)", { membership_id: invite["membership_id"] });
    return { channel, contact: phone };
  }
  const email = parsedInput["email"] || "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: metadata },
  });
  if (error) {
    log.error("accept OTP send failed (email)", { error });
    throw new Error("No pudimos enviar el código. Intenta de nuevo.");
  }
  log.info("accept OTP sent (email)", { membership_id: invite["membership_id"] });
  return { channel, contact: email };
});

export const actionVerifyDocumentSignup = action.inputSchema(verifyOtpSchema).action(async ({ parsedInput }) => {
  const admin = createServiceRoleClient();
  const { data: inviteRow, error: inviteError } = await admin
    .from("memberships")
    .select(
      "membership_id, profile_id, membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value, membership_invite_expires_at, membership_accepted_at, membership_rejected_at, membership_revoked_at, organizations(tenants(tenant_slug))",
    )
    .eq("membership_invite_token", parsedInput["invitation_token"])
    .maybeSingle();
  if (inviteError) log.error("invitation lookup failed", { error: inviteError });
  if (!inviteRow) throw new Error("Invitación no encontrada");
  const invite = inviteRow;
  if (invite["membership_revoked_at"]) throw new Error("Esta invitación fue cancelada");
  if (invite["membership_rejected_at"]) throw new Error("Esta invitación fue rechazada");
  if (invite["membership_accepted_at"] || invite["profile_id"]) throw new Error("Esta invitación ya fue aceptada");
  if (invite["membership_invite_expires_at"] && new Date(invite["membership_invite_expires_at"]) <= new Date()) {
    throw new Error("Esta invitación expiró");
  }

  const supabase = await createServerClient();
  const channel = parsedInput["channel"];
  const contact = parsedInput["contact"];
  const token = parsedInput["token"];

  const verifyRes =
    channel === "sms"
      ? await supabase.auth.verifyOtp({ type: "sms", phone: contact, token })
      : await supabase.auth.verifyOtp({ type: "email", email: contact, token });

  if (verifyRes.error || !verifyRes.data?.user) {
    log.info("accept OTP rejected", { reason: verifyRes.error?.message });
    throw new Error("Código incorrecto o expirado");
  }

  const profileId = verifyRes.data.user.id;

  // Single-row claim: stamp profile_id + accepted_at on the existing pending membership.
  // Burn the token so the accept-link can't be replayed.
  const claimRes = await admin
    .from("memberships")
    .update({
      profile_id: profileId,
      membership_accepted_at: new Date().toISOString(),
      membership_invite_token: null,
    })
    .eq("membership_id", invite["membership_id"])
    .is("profile_id", null)
    .is("membership_accepted_at", null)
    .is("membership_rejected_at", null)
    .is("membership_revoked_at", null);
  if (claimRes.error) {
    log.error("membership claim failed", { error: claimRes.error, profileId });
    throw new Error("No pudimos completar tu ingreso. Contacta a tu administrador.");
  }

  // Ensure the document identity row exists (trigger should have created it, but be defensive
  // for the case where the verified user already existed and the trigger only fired at first signup).
  if (
    invite["membership_invite_address_level0_id"] &&
    invite["membership_invite_document_kind"] &&
    invite["membership_invite_document_value"]
  ) {
    const idRes = await admin.from("profile_identities").upsert(
      {
        profile_id: profileId,
        address_level0_id: invite["membership_invite_address_level0_id"],
        profile_identity_document_kind: invite["membership_invite_document_kind"],
        profile_identity_document_value: invite["membership_invite_document_value"],
      },
      { onConflict: "profile_id,address_level0_id,profile_identity_document_kind", ignoreDuplicates: true },
    );
    if (idRes.error) {
      log.warn("identity upsert failed (non-fatal)", { error: idRes.error, profileId });
    }
  }

  await supabase.auth.refreshSession();

  const tenant_slug = invite["organizations"]?.["tenants"]?.["tenant_slug"];
  if (tenant_slug) {
    redirect(`/[locale]/${tenant_slug}`);
  }
  redirect("/[locale]/home");
});
