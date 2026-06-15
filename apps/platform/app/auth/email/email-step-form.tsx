"use client";

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { notifyDevMailbox } from "~/lib/dev-mailbox-toast.client";
import { useRosetta } from "~/lib/i18n.client";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { OtpField } from "../_components/otp-field";

type Props = {
  email: string;
  next: string;
  /** null = privacy mode (existence not exposed). true/false = known. */
  exists: boolean | null;
  hasPasskey: boolean;
  hasPassword: boolean;
};

function RESOLVE_TARGET(next: string): string {
  return next.startsWith("/") && next !== "/" ? next : "/home";
}

export function EmailStepForm({ email, next, exists, hasPasskey, hasPassword }: Props) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
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
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
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
    verifyOtp(token);
  }

  function verifyOtp(nextToken: string) {
    setError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ email, token: nextToken, type: "email" });
      if (err) {
        setError(t("error_otp"));
        return;
      }
      await supabase.auth.refreshSession();
      router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(next))));
      router.refresh();
    });
  }

  function onOtpPasteComplete(nextToken: string) {
    setToken(nextToken);
    verifyOtp(nextToken);
  }

  function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(t("error_password"));
        return;
      }
      await supabase.auth.refreshSession();
      router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(next))));
      router.refresh();
    });
  }

  function onPasskey() {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError(t("error_no_passkey"));
          return;
        }
        await signInWithPasskey();
      } catch (err) {
        if (err instanceof Error && err.name === "NotAllowedError") {
          setError(t("error_passkey_cancelled"));
        } else {
          setError(err instanceof Error ? err.message : t("error_passkey_failed"));
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
          onPasteComplete={onOtpPasteComplete}
          sentTo={
            <>
              {t("sent_to_prefix")} <strong className="font-medium text-foreground">{email}</strong>.{" "}
              {t("sent_expires")}
            </>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending || token.length !== 6} className="h-10 w-full">
          <span>{pending ? t("verifying") : t("verify")}</span>
          <ArrowRight size={16} />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("not_arrived")}{" "}
          <button type="button" onClick={onMagicLink} disabled={pending} className="underline hover:text-foreground">
            {t("resend")}
          </button>{" "}
          {t("click_link")}
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
          <span>{pending ? t("passkey_btn_verifying") : t("passkey_btn")}</span>
        </Button>
      )}

      {showPasswordOption && (
        <form onSubmit={onPassword} className="flex flex-col gap-2">
          <Label htmlFor="email-password">{t("label_password")}</Label>
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
              aria-label={showPassword ? t("hide_password") : t("show_password")}
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
            <span>{pending ? t("signing_in") : t("sign_in_password")}</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {(showPasskey || showPasswordOption) && (
        <div className="flex items-center gap-3 text-tiny font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("divider_or")}
          <span className="h-px flex-1 bg-border" />
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
        <span>{pending ? t("sending") : isNew ? t("create_magic_link") : t("send_magic_link")}</span>
      </Button>
    </div>
  );
}

const LOCALE_ES = {
  sent_to_prefix: "Enviado a",
  sent_expires: "Caduca en 10 minutos.",
  verifying: "Verificando…",
  verify: "Verificar",
  not_arrived: "¿No llegó?",
  resend: "Reenviar",
  click_link: "· También puedes hacer clic en el enlace del correo.",
  passkey_btn_verifying: "Verificando…",
  passkey_btn: "Continuar con passkey",
  label_password: "Contraseña",
  hide_password: "Ocultar",
  show_password: "Mostrar",
  signing_in: "Ingresando…",
  sign_in_password: "Ingresar con contraseña",
  divider_or: "o",
  sending: "Enviando…",
  create_magic_link: "Crear cuenta con enlace mágico",
  send_magic_link: "Enviar enlace mágico",
  error_otp: "Código incorrecto o expirado.",
  error_password: "Correo o contraseña incorrectos.",
  error_no_passkey: "Tu navegador no soporta passkeys.",
  error_passkey_cancelled: "Cancelaste el inicio con passkey.",
  error_passkey_failed: "No pudimos verificar tu passkey.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  sent_to_prefix: "Sent to",
  sent_expires: "Expires in 10 minutes.",
  verifying: "Verifying…",
  verify: "Verify",
  not_arrived: "Didn't arrive?",
  resend: "Resend",
  click_link: "· You can also click the link in the email.",
  passkey_btn_verifying: "Verifying…",
  passkey_btn: "Continue with passkey",
  label_password: "Password",
  hide_password: "Hide",
  show_password: "Show",
  signing_in: "Signing in…",
  sign_in_password: "Sign in with password",
  divider_or: "or",
  sending: "Sending…",
  create_magic_link: "Create account with magic link",
  send_magic_link: "Send magic link",
  error_otp: "Incorrect or expired code.",
  error_password: "Incorrect email or password.",
  error_no_passkey: "Your browser doesn't support passkeys.",
  error_passkey_cancelled: "You cancelled passkey sign-in.",
  error_passkey_failed: "We couldn't verify your passkey.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  sent_to_prefix: "Enviado para",
  sent_expires: "Expira em 10 minutos.",
  verifying: "A verificar…",
  verify: "Verificar",
  not_arrived: "Não chegou?",
  resend: "Reenviar",
  click_link: "· Também pode clicar no link do e-mail.",
  passkey_btn_verifying: "A verificar…",
  passkey_btn: "Continuar com passkey",
  label_password: "Senha",
  hide_password: "Ocultar",
  show_password: "Mostrar",
  signing_in: "A entrar…",
  sign_in_password: "Entrar com senha",
  divider_or: "ou",
  sending: "A enviar…",
  create_magic_link: "Criar conta com link mágico",
  send_magic_link: "Enviar link mágico",
  error_otp: "Código incorreto ou expirado.",
  error_password: "E-mail ou senha incorretos.",
  error_no_passkey: "O seu navegador não suporta passkeys.",
  error_passkey_cancelled: "Cancelou o início de sessão com passkey.",
  error_passkey_failed: "Não foi possível verificar a sua passkey.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
