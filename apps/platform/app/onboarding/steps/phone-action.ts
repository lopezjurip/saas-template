"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { z } from "zod";

const phoneSchema = z.object({ phone: z.string().regex(/^\+[1-9]\d{7,14}$/) });
const verifySchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  token: z.string().regex(/^\d{6}$/),
});

export async function sendPhoneOtp(values: z.infer<typeof phoneSchema>) {
  const parsed = phoneSchema.safeParse(values);
  if (!parsed.success) return { error: "Formato de teléfono inválido" };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ phone: parsed.data.phone });
  if (error) {
    if (error.message.toLowerCase().includes("sms")) {
      return { error: "El servicio de SMS no está configurado. Omite por ahora." };
    }
    return { error: "No pudimos enviar el código" };
  }
  return { ok: true as const };
}

export async function verifyPhoneOtp(values: z.infer<typeof verifySchema>) {
  const parsed = verifySchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos" };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "phone_change",
    phone: parsed.data.phone,
    token: parsed.data.token,
  });
  if (error) return { error: "Código incorrecto o expirado" };
  return { ok: true as const };
}
