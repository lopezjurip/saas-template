"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoginMagicLink, useLoginPassword } from "~/hooks/use-login";
import { type PhoneOtpChannel, useSendPhoneOtp } from "~/hooks/use-phone-otp";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { rememberAuthMethod } from "./method-button";

type Kind = "email" | "phone";

type Props = {
  kind: Kind;
  value: string;
  hasPasskey: boolean;
  hasPassword: boolean;
  isNewUser?: boolean;
  existsKnown?: boolean;
  channels?: PhoneOtpChannel[];
  locale: string;
  next?: string;
};

// Renders the step-2 method picker for either email or phone identities.
// After sending OTP/magic-link, redirects to the dedicated magic-link page.
export function MethodPicker({
  kind,
  value,
  hasPasskey,
  hasPassword,
  isNewUser = false,
  existsKnown = true,
  channels = ["sms", "whatsapp"],
  locale,
  next,
}: Props) {
  if (kind === "email") {
    return (
      <EmailMethods
        value={value}
        hasPasskey={hasPasskey}
        hasPassword={hasPassword}
        isNewUser={isNewUser}
        existsKnown={existsKnown}
        locale={locale}
        next={next}
      />
    );
  }
  return (
    <PhoneMethods
      value={value}
      hasPasskey={hasPasskey}
      hasPassword={hasPassword}
      isNewUser={isNewUser}
      channels={channels}
      locale={locale}
      next={next}
    />
  );
}

function EmailMethods({
  value,
  hasPasskey,
  hasPassword,
  isNewUser,
  existsKnown,
  locale,
  next,
}: {
  value: string;
  hasPasskey: boolean;
  hasPassword: boolean;
  isNewUser: boolean;
  existsKnown: boolean;
  locale: string;
  next?: string;
}) {
  const router = useRouter();
  const { signInWithPassword, error: passwordError, pending: passwordPending } = useLoginPassword(locale, next);
  const { sendMagicLink, error: magicError, pending: magicPending } = useLoginMagicLink(locale, next);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const anyPending = passwordPending || magicPending || passkeyPending;
  const serverError = passwordError || magicError || passkeyError;

  async function onPasskey() {
    setPasskeyPending(true);
    setPasskeyError(null);
    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        setPasskeyError("Tu navegador no soporta passkeys.");
        return;
      }
      rememberAuthMethod("passkey");
      await signInWithPasskey(value);
    } catch (e) {
      setPasskeyError(e instanceof Error ? e.message : "Error con passkey");
    } finally {
      setPasskeyPending(false);
    }
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    rememberAuthMethod("password");
    await signInWithPassword({ email: value, password });
  }

  async function onMagicLink() {
    rememberAuthMethod("email");
    const result = await sendMagicLink({ email: value, shouldCreateUser: isNewUser });
    if (!result?.serverError) {
      router.push(
        `/${locale}/auth/email/magic-link?value=${encodeURIComponent(value)}&next=${encodeURIComponent(next ?? "")}`,
      );
    }
  }

  const primary: "passkey" | "password" | "magic" = hasPasskey ? "passkey" : hasPassword ? "password" : "magic";

  return (
    <div className="flex flex-col gap-[10px]">
      {hasPasskey && (
        <Button type="button" onClick={onPasskey} disabled={anyPending} className="h-10 w-full">
          <Fingerprint size={16} />
          <span>{passkeyPending ? "Verificando passkey…" : "Usar passkey"}</span>
        </Button>
      )}

      {hasPasskey && hasPassword && (
        <div className="my-[6px] flex items-center gap-3 text-[10.5px] uppercase tracking-[0.08em] font-medium text-muted-foreground/70 before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
          o
        </div>
      )}

      {hasPassword && (
        <form onSubmit={onPassword} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Contraseña</Label>
            <a
              className="cursor-pointer text-[12px] text-foreground underline decoration-border underline-offset-[3px] hover:decoration-foreground"
              href="#"
            >
              ¿Olvidaste?
            </a>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Lock size={16} />
            </span>
            <Input
              id="login-password"
              className="h-10 pl-9 pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <Button
            type="submit"
            variant={primary === "password" ? "default" : "outline"}
            disabled={anyPending || password.length < 8}
            className="h-10 w-full"
          >
            <span>{passwordPending ? "Iniciando…" : "Iniciar sesión"}</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {(hasPasskey || hasPassword) && (
        <div className="my-[6px] flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
          o
        </div>
      )}

      <Button
        type="button"
        onClick={onMagicLink}
        variant={primary === "magic" ? "default" : "outline"}
        disabled={anyPending}
        className="h-10 w-full"
      >
        <Mail size={16} />
        <span>
          {magicPending
            ? "Enviando…"
            : existsKnown && isNewUser
              ? "Crear cuenta con enlace mágico"
              : "Enviar enlace mágico"}
        </span>
      </Button>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function PhoneMethods({
  value,
  hasPasskey,
  hasPassword,
  isNewUser,
  channels,
  locale,
  next,
}: {
  value: string;
  hasPasskey: boolean;
  hasPassword: boolean;
  isNewUser: boolean;
  channels: PhoneOtpChannel[];
  locale: string;
  next?: string;
}) {
  const router = useRouter();
  const { sendPhoneOtp, error: sendError, pending: sendPending } = useSendPhoneOtp();

  const serverError = sendError;

  async function onSend(channel: PhoneOtpChannel) {
    rememberAuthMethod("phone");
    const result = await sendPhoneOtp({ phone: value, shouldCreateUser: isNewUser, channel });
    if (!result?.serverError) {
      router.push(
        `/${locale}/auth/phone/magic-link?value=${encodeURIComponent(value)}&next=${encodeURIComponent(next ?? "")}&channel=${channel}`,
      );
    }
  }

  // Passkey-via-phone is intentionally NOT a button here because passkeys are email-scoped
  // in our store. When hasPasskey is true, surface the hint to switch to /auth/email instead.
  return (
    <div className="flex flex-col gap-[10px]">
      {hasPasskey && (
        <p className="text-muted-foreground text-xs">
          Tu cuenta tiene passkey configurado. Para usarlo,{" "}
          <a
            href={`/${locale}/auth/email`}
            className="cursor-pointer underline decoration-border underline-offset-[3px] hover:decoration-foreground"
          >
            ingresa con tu correo
          </a>
          .
        </p>
      )}

      {channels.includes("sms") && (
        <Button type="button" onClick={() => onSend("sms")} disabled={sendPending} className="h-10 w-full">
          <MessageCircle size={16} />
          <span>{sendPending ? "Enviando…" : "Enviar código por SMS"}</span>
        </Button>
      )}

      {channels.includes("whatsapp") && (
        <Button
          type="button"
          variant="outline"
          onClick={() => onSend("whatsapp")}
          disabled={sendPending}
          className="h-10 w-full"
        >
          <MessageCircle size={16} />
          <span>{sendPending ? "Enviando…" : "Enviar código por WhatsApp"}</span>
        </Button>
      )}

      {hasPassword && (
        <p className="text-muted-foreground text-[11px] text-center">
          Esta cuenta tiene contraseña. Para usarla, ingresa con tu correo.
        </p>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
