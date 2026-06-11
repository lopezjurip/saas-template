"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LoginValues, MagicLinkValues, VerifyMagicOtpValues } from "~/app/[locale]/auth/email/schemas";
import { ROUTE, ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";

function SAFE_NEXT(next: string | undefined, locale: string): string {
  if (!next || !next.startsWith("/")) return `/${locale}/home`;
  return next;
}

export function useLoginPassword(locale: string, next?: string) {
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

      router.push(ROUTE_HREF(UNSAFE_ROUTE(SAFE_NEXT(next, locale))));
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

export function useLoginMagicLink(locale: string, next?: string) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function sendMagicLink(input: MagicLinkValues & { shouldCreateUser?: boolean }) {
    setPending(true);
    setError(null);
    setSentTo(null);

    try {
      const supabase = await createBrowserClient();
      const target = SAFE_NEXT(next, locale);
      // If the magic link auto-creates a new user, route them through onboarding first.
      const shouldCreate = input.shouldCreateUser === true;
      const redirectPath = shouldCreate ? `/${locale}/auth/onboarding` : target;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          shouldCreateUser: shouldCreate,
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
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

export function useVerifyMagicOtp(locale: string, next?: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function verifyMagicOtp(input: VerifyMagicOtpValues & { isNewUser?: boolean }) {
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

  return { verifyMagicOtp, error, pending };
}
