"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { notifyDevMailbox } from "~/lib/dev-mailbox-toast.client";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { OtpField } from "../_components/otp-field";

type Props = {
  email: string;
  next: string;
  // null = privacy mode (existence not exposed). true/false = known.
  exists: boolean | null;
  hasPasskey: boolean;
  hasPassword: boolean;
};

function RESOLVE_TARGET(locale: string, next: string): string {
  return next.startsWith("/") && next !== "/" ? next : `/${locale}/home`;
}

export function EmailStepForm({ email, next, exists, hasPasskey, hasPassword }: Props) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const isNew = exists === false;
  const showPasskey = exists === true && hasPasskey;
  const showPasswordOption = exists === true && hasPassword;

  function onMagicLink() {
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/${locale}/auth/confirm?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSent(true);
      notifyDevMailbox(email);
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (err) {
        setError("Código incorrecto o expirado.");
        return;
      }
      await supabase.auth.refreshSession();
      router.push(RESOLVE_TARGET(locale, next));
      router.refresh();
    });
  }

  function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      await supabase.auth.refreshSession();
      router.push(RESOLVE_TARGET(locale, next));
      router.refresh();
    });
  }

  function onPasskey() {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError("Tu navegador no soporta passkeys.");
          return;
        }
        await signInWithPasskey(email);
      } catch (err) {
        if (err instanceof Error && err.name === "NotAllowedError") {
          setError("Cancelaste el inicio con passkey.");
        } else {
          setError(err instanceof Error ? err.message : "No pudimos verificar tu passkey.");
        }
      }
    });
  }

  // Step 2b: code sent — verify the 6-digit OTP (or the user clicks the email link).
  if (sent) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="email-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              Enviado a <strong className="font-medium text-foreground">{email}</strong>. Caduca en 10 minutos.
            </>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending || token.length !== 6} className="h-10 w-full">
          <span>{pending ? "Verificando…" : "Verificar"}</span>
          <ArrowRight size={16} />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          ¿No llegó?{" "}
          <button type="button" onClick={onMagicLink} disabled={pending} className="underline hover:text-foreground">
            Reenviar
          </button>{" "}
          · También puedes hacer clic en el enlace del correo.
        </p>
      </form>
    );
  }

  // Step 2a: pick a method.
  return (
    <div className="flex flex-col gap-3">
      {showPasskey && (
        <Button type="button" onClick={onPasskey} disabled={pending} className="h-10 w-full">
          <Fingerprint size={16} />
          <span>{pending ? "Verificando…" : "Continuar con passkey"}</span>
        </Button>
      )}

      {showPasswordOption && (
        <form onSubmit={onPassword} className="flex flex-col gap-2">
          <Label htmlFor="email-password">Contraseña</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              <Lock size={16} />
            </span>
            <Input
              id="email-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pl-9 pr-10"
              placeholder="••••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <Button
            type="submit"
            disabled={pending || password.length < 8}
            variant={showPasskey ? "outline" : "default"}
            className="h-10 w-full"
          >
            <span>{pending ? "Ingresando…" : "Ingresar con contraseña"}</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {(showPasskey || showPasswordOption) && (
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={onMagicLink}
        disabled={pending}
        variant={showPasskey || showPasswordOption ? "outline" : "default"}
        className="h-10 w-full"
      >
        {isNew ? <KeyRound size={16} /> : <Mail size={16} />}
        <span>{pending ? "Enviando…" : isNew ? "Crear cuenta con enlace mágico" : "Enviar enlace mágico"}</span>
      </Button>
    </div>
  );
}
