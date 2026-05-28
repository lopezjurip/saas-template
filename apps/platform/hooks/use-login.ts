"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LoginValues, MagicLinkValues, VerifyMagicOtpValues } from "~/app/[locale]/auth/email/login/schemas";

export function useLoginPassword(locale: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signInWithPassword(input: LoginValues) {
    setPending(true);
    setError(null);

    try {
      const supabase = await createBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword(input);

      if (err) {
        setError("Correo o contraseña incorrectos");
        return { serverError: "Correo o contraseña incorrectos" };
      }

      router.push(`/${locale}/home`);
      return { serverError: null };
    } catch (e) {
      const msg = "Error en login";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { signInWithPassword, error, pending };
}

export function useLoginMagicLink(locale: string) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function sendMagicLink(input: MagicLinkValues) {
    setPending(true);
    setError(null);
    setSentTo(null);

    try {
      const supabase = await createBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/${locale}/home`,
        },
      });

      if (err) {
        setError("No pudimos enviar el enlace. Intenta de nuevo.");
        return { serverError: "No pudimos enviar el enlace. Intenta de nuevo." };
      }

      setSentTo(input.email);
      return { serverError: null, sentTo: input.email };
    } catch (e) {
      const msg = "Error enviando enlace";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { sendMagicLink, error, pending, sentTo };
}

export function useVerifyMagicOtp(locale: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function verifyMagicOtp(input: VerifyMagicOtpValues) {
    setPending(true);
    setError(null);

    try {
      const supabase = await createBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({
        type: "email",
        email: input.email,
        token: input.token,
      });

      if (err) {
        setError("Código incorrecto o expirado");
        return { serverError: "Código incorrecto o expirado" };
      }

      router.push(`/${locale}/home`);
      return { serverError: null };
    } catch (e) {
      const msg = "Error verificando código";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { verifyMagicOtp, error, pending };
}
