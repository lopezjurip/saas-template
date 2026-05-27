"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerLocale } from "~/lib/i18n.server";
import { action, formAction } from "~/lib/safe-action";

const checkPhoneSchema = z.object({
  phone: z
    .string()
    .min(1)
    .transform((v) => v.trim()),
  next: z.string().default("/"),
});

const checkPhoneRun = action.inputSchema(checkPhoneSchema).action(async ({ parsedInput }) => {
  const locale = await getServerLocale();
  const supabase = await createServerClient();
  const phone = parsedInput["phone"];

  const { data: normalized } = await supabase.rpc("phone_normalize", {
    value: phone,
    default_code: "+56",
  });
  if (!normalized) redirect(`/${locale}/auth/phone?error=invalid_phone`);

  const { data: exists } = await supabase.rpc("phone_exists", {
    phone_to_check: phone,
    default_code: "+56",
  });
  if (!exists) {
    redirect(`/${locale}/auth/phone/signup?phone=${encodeURIComponent(normalized as string)}`);
  }
  redirect(`/${locale}/auth/phone/login?phone=${encodeURIComponent(normalized as string)}`);
});

export const checkPhone = formAction(checkPhoneRun, (fd) => ({
  phone: String(fd.get("phone") ?? ""),
  next: String(fd.get("next") ?? "/"),
}));
