"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SendOtpValues, VerifyOtpValues } from "~/app/[locale]/auth/phone/schemas";
import { ROUTE, ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";

function SAFE_NEXT(next: string | undefined, locale: string): string {
  if (!next || !next.startsWith("/")) return `/${locale}/home`;
  return next;
}

export type PhoneOtpChannel = "sms" | "whatsapp";

export function useSendPhoneOtp() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sentChannel, setSentChannel] = useState<PhoneOtpChannel | null>(null);

  async function sendPhoneOtp(input: SendOtpValues & { shouldCreateUser?: boolean; channel?: PhoneOtpChannel }) {
    setPending(true);
    setError(null);

    try {
      const supabase = await createBrowserClient();
      /**
       * gotrue supports `channel: 'whatsapp'` when the provider is configured for it.
       * Until WhatsApp BSP is wired, this falls back to SMS server-side.
       */
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: input.phone,
        options: {
          shouldCreateUser: input.shouldCreateUser === true,
          channel: input.channel ?? "sms",
        },
      });

      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("sms") || msg.includes("provider")) {
          const m = "El servicio de SMS no está configurado.";
          setError(m);
          return { serverError: m };
        }
        if (msg.includes("not found") || msg.includes("signups not allowed")) {
          const m = "No encontramos una cuenta con ese teléfono.";
          setError(m);
          return { serverError: m };
        }
        const m = "No pudimos enviar el código. Intenta de nuevo.";
        setError(m);
        return { serverError: m };
      }

      setSentTo(input.phone);
      setSentChannel(input.channel ?? "sms");
      return { serverError: null, sentTo: input.phone, channel: input.channel ?? "sms" };
    } catch (e) {
      const msg = "Error enviando código";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { sendPhoneOtp, error, pending, sentTo, sentChannel };
}

export function useVerifyPhoneOtp(locale: string, next?: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function verifyPhoneOtp(input: VerifyOtpValues & { isNewUser?: boolean }) {
    setPending(true);
    setError(null);

    try {
      const supabase = await createBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({
        type: "sms",
        phone: input.phone,
        token: input.token,
      });

      if (err) {
        setError("Código incorrecto o expirado");
        return { serverError: "Código incorrecto o expirado" };
      }

      const target = input.isNewUser
        ? ROUTE("/[locale]/auth/onboarding", { locale })
        : UNSAFE_ROUTE(SAFE_NEXT(next, locale));
      router.push(ROUTE_HREF(target));
      return { serverError: null };
    } catch (e) {
      const msg = "Error verificando código";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { verifyPhoneOtp, error, pending };
}
