"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, Mail } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMagicLink, useLoginPassword, useVerifyMagicOtp } from "~/hooks/use-login";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { type LoginValues, loginSchema, type VerifyMagicOtpValues, verifyMagicOtpSchema } from "./schemas";

export function LoginForm({ defaultEmail, hasPasskey }: { defaultEmail: string; hasPasskey: boolean }) {
  const params = useParams();
  const locale = params.locale as string;

  const { signInWithPassword, error: passwordError, pending: passwordPending } = useLoginPassword(locale);
  const { sendMagicLink, error: magicError, pending: magicPending, sentTo: magicSentTo } = useLoginMagicLink(locale);
  const { verifyMagicOtp, error: otpError, pending: otpPending } = useVerifyMagicOtp(locale);

  const [showPassword, setShowPassword] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
  });

  const otpForm = useForm<VerifyMagicOtpValues>({
    resolver: zodResolver(verifyMagicOtpSchema),
    defaultValues: { email: defaultEmail, token: "" },
  });

  const serverError = passwordError || magicError || otpError;
  const anyPending = passwordPending || magicPending || otpPending || passkeyPending;

  const onPasswordSubmit = form.handleSubmit(async (values) => {
    await signInWithPassword(values);
  });

  const onMagicLink = async () => {
    const email = form.getValues("email");
    const res = await sendMagicLink({ email });
    if (!res?.serverError && res?.sentTo) {
      otpForm.reset({ email: res.sentTo, token: "" });
    }
  };

  const onVerifyOtp = otpForm.handleSubmit(async (values) => {
    await verifyMagicOtp(values);
  });

  const onPasskey = async () => {
    setPasskeyPending(true);
    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        // Passkey not supported
        return;
      }
      await signInWithPasskey(form.getValues("email"));
    } catch (e) {
      // Error handled in signInWithPasskey
    } finally {
      setPasskeyPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-[10px]">
        {hasPasskey && (
          <button
            type="button"
            onClick={onPasskey}
            disabled={anyPending}
            className="sc-btn sc-btn-primary sc-btn-block"
          >
            <Fingerprint size={16} />
            <span>{passkeyPending ? "Verificando passkey…" : "Usar passkey"}</span>
          </button>
        )}

        {hasPasskey && <div className="sc-divider sc-divider-subtle my-[6px]">o</div>}

        {/* Password */}
        <form onSubmit={onPasswordSubmit} className="sc-password-group">
          <div className="flex items-center justify-between">
            <label className="sc-label" style={{ margin: 0 }} htmlFor="login-password">
              Contraseña
            </label>
            <a className="sc-link text-[12px]" href="#">
              ¿Olvidaste?
            </a>
          </div>
          <input type="hidden" autoComplete="email" {...form.register("email")} />
          <div className="sc-input-icon-wrap sc-password-input-wrap">
            <span className="sc-input-icon">
              <Lock size={16} />
            </span>
            <input
              id="login-password"
              className="sc-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            <button
              type="button"
              className="sc-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
          )}
          <button
            type="submit"
            disabled={anyPending}
            className={`sc-btn sc-btn-block ${hasPasskey ? "sc-btn-outline" : "sc-btn-primary"}`}
          >
            <span>{passwordPending ? "Iniciando…" : "Iniciar sesión"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="sc-divider my-[6px]">o</div>

        {/* Magic link */}
        <button
          type="button"
          onClick={onMagicLink}
          disabled={anyPending}
          className="sc-btn sc-btn-outline sc-btn-block"
        >
          <Mail size={16} />
          <span>{magicPending ? "Enviando…" : magicSentTo ? "Reenviar enlace mágico" : "Enviar enlace mágico"}</span>
        </button>

        {magicSentTo && (
          <>
            <Alert>
              <AlertDescription>
                Te enviamos un enlace mágico a <strong>{magicSentTo}</strong>. Haz clic o ingresa el código abajo.
              </AlertDescription>
            </Alert>
            <form onSubmit={onVerifyOtp} className="flex flex-col gap-2">
              <label className="sc-label" htmlFor="magic-token">
                Código del correo
              </label>
              <input
                id="magic-token"
                className="sc-input"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                aria-invalid={!!otpForm.formState.errors.token}
                {...otpForm.register("token")}
              />
              <button type="submit" disabled={anyPending} className="sc-btn sc-btn-primary sc-btn-block">
                <span>{otpPending ? "Verificando…" : "Verificar código"}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
