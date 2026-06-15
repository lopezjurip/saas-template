"use client";

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { useState } from "react";

export function useOnboardingEmailOtp() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendEmailOtp(email: string) {
    setPending(true);
    setError(null);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ email });
      if (err) {
        setError(err.message);
        return { serverError: err.message };
      }
      return { serverError: null };
    } catch (e) {
      const msg = (e as Error).message || "Error enviando OTP";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  async function verifyEmailOtp(email: string, token: string) {
    setPending(true);
    setError(null);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ type: "email_change", email, token });
      if (err) {
        setError(err.message);
        return { serverError: err.message };
      }
      await supabase.auth.refreshSession();
      return { serverError: null };
    } catch (e) {
      const msg = (e as Error).message || "Error verificando código";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { sendEmailOtp, verifyEmailOtp, error, pending };
}

export function useOnboardingPassword() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function setPassword(password: string) {
    setPending(true);
    setError(null);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return { serverError: err.message };
      }
      await supabase.auth.refreshSession();
      return { serverError: null };
    } catch (e) {
      const msg = (e as Error).message || "Error configurando contraseña";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { setPassword, error, pending };
}

export function useOnboardingPhoneOtp() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendPhoneOtp(phone: string) {
    setPending(true);
    setError(null);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ phone });
      if (err) {
        setError(err.message);
        return { serverError: err.message };
      }
      return { serverError: null };
    } catch (e) {
      const msg = (e as Error).message || "Error enviando OTP";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  async function verifyPhoneOtp(phone: string, token: string) {
    setPending(true);
    setError(null);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ type: "phone_change", phone, token });
      if (err) {
        setError(err.message);
        return { serverError: err.message };
      }
      await supabase.auth.refreshSession();
      return { serverError: null };
    } catch (e) {
      const msg = (e as Error).message || "Error verificando código";
      setError(msg);
      return { serverError: msg };
    } finally {
      setPending(false);
    }
  }

  return { sendPhoneOtp, verifyPhoneOtp, error, pending };
}
