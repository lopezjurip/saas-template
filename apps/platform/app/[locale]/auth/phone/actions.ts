"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { action, formAction } from "~/lib/safe-action.server";

const checkPhoneSchema = z.object({
  phone: z
    .string()
    .min(1)
    .transform((v) => v.trim()),
  next: z.string().default("/"),
});

/**
 * Step-1 → step-2 dispatcher. Resolves availability flags then redirects to the same
 * /auth/phone route with `value=` + flags so the page renders the method picker.
 */
const checkPhoneRun = action.inputSchema(checkPhoneSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const phone = parsedInput["phone"];
  const next = parsedInput["next"];

  const { data: normalized } = await supabase.rpc("phone_normalize", {
    value: phone,
    default_code: "+56",
  });
  if (!normalized) {
    redirect(`/[locale]/auth/phone?error=invalid_phone&next=${encodeURIComponent(next)}`);
  }

  if (!AUTH_EXPOSE_ACCOUNT_EXISTENCE) {
    const qs = new URLSearchParams({ value: normalized as string, channels: "sms,whatsapp", next });
    redirect(`/[locale]/auth/phone?${qs.toString()}`);
  }

  const { data: exists } = await supabase.rpc("phone_exists", {
    phone_to_check: phone,
    default_code: "+56",
  });
  if (!exists) {
    const qs = new URLSearchParams({
      value: normalized as string,
      exists: "0",
      channels: "sms,whatsapp",
      next,
    });
    redirect(`/[locale]/auth/phone?${qs.toString()}`);
  }

  const [passkeyRes, passwordRes] = await Promise.all([
    supabase.rpc("phone_has_passkey", { phone_to_check: phone, default_code: "+56" }),
    supabase.rpc("phone_has_password", { phone_to_check: phone, default_code: "+56" }),
  ]);

  const qs = new URLSearchParams({
    value: normalized as string,
    exists: "1",
    has_passkey: passkeyRes.data ? "1" : "0",
    has_password: passwordRes.data ? "1" : "0",
    channels: "sms,whatsapp",
    next,
  });
  redirect(`/[locale]/auth/phone?${qs.toString()}`);
});

export const checkPhone = formAction(checkPhoneRun, (fd) => ({
  phone: String(fd.get("phone") ?? ""),
  next: String(fd.get("next") ?? "/"),
}));
