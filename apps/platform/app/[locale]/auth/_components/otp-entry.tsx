"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@packages/ui-common/shadcn/components/ui/input-otp";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type OtpChannel = "email" | "sms" | "whatsapp";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const CHANNEL_CONFIG = {
  email: {
    Icon: Mail,
    verb: "Te enviamos un enlace mágico y un código a",
    resendLabel: "Reenviar correo",
    hint: "También puedes hacer clic en el enlace del correo desde el mismo dispositivo.",
  },
  sms: {
    Icon: MessageCircle,
    verb: "Te enviamos un código por SMS a",
    resendLabel: "Reenviar SMS",
    hint: undefined,
  },
  whatsapp: {
    Icon: MessageCircle,
    verb: "Te enviamos un código por WhatsApp a",
    resendLabel: "Reenviar WhatsApp",
    hint: undefined,
  },
} as const;

function MASK_EMAIL(value: string): string {
  const [local, domain] = value.split("@");
  if (!domain || !local) return value;
  if (local.length <= 2) return `${local[0]}•••@${domain}`;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(2, local.length - 3))}${local.slice(-1)}@${domain}`;
}

function MASK_PHONE(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return value;
  const last = digits.slice(-2);
  const first = value.startsWith("+") ? `+${digits.slice(0, Math.max(0, digits.length - 6))}` : digits.slice(0, 2);
  return `${first} •••• ${last}`;
}

function FORMAT_COUNTDOWN(seconds: number): string {
  return `0:${String(seconds).padStart(2, "0")}`;
}

export function OtpEntry({
  channel,
  destination,
  next,
  locale,
}: {
  channel: OtpChannel;
  destination: string;
  next: string;
  locale: string;
}) {
  const router = useRouter();
  const cfg = CHANNEL_CONFIG[channel];
  const masked = channel === "email" ? MASK_EMAIL(destination) : MASK_PHONE(destination);

  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const resendEnabled = secondsLeft <= 0;

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const target = (next.startsWith("/") ? next : `/${locale}/home`) as Route;
    router.push(target);
  }

  function onResend() {
    setToken("");
    setSecondsLeft(RESEND_SECONDS);
  }

  return (
    <div className="flex flex-col gap-3.5">
      <Alert>
        <cfg.Icon size={16} />
        <AlertDescription>
          {cfg.verb} <strong className="font-medium text-foreground">{masked}</strong>. Ingresa el código a
          continuación.
        </AlertDescription>
      </Alert>

      <form onSubmit={onVerify} className="flex flex-col gap-2.5">
        <Label htmlFor="otp" className="m-0 flex items-center justify-between">
          <span>Código de 6 dígitos</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
            <ShieldCheck size={12} /> expira en 10:00
          </span>
        </Label>
        <InputOTP
          id="otp"
          maxLength={OTP_LENGTH}
          value={token}
          onChange={setToken}
          autoFocus
          containerClassName="w-full justify-between gap-2"
        >
          <InputOTPGroup className="flex w-full gap-2">
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-12 flex-1 rounded-md border-l font-mono text-lg first:rounded-l-md last:rounded-r-md"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" disabled={pending || token.length !== OTP_LENGTH} className="h-10 w-full">
          <span>{pending ? "Verificando…" : "Verificar"}</span>
          <ArrowRight size={16} />
        </Button>
      </form>

      <div className="-mt-1 flex items-center justify-between">
        <span className="text-[12.5px] text-muted-foreground">¿No lo recibiste?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={!resendEnabled}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] text-muted-foreground enabled:hover:bg-accent enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-80"
        >
          {resendEnabled ? (
            cfg.resendLabel
          ) : (
            <>
              Reenviar en <span className="font-mono text-[11.5px] tabular-nums">{FORMAT_COUNTDOWN(secondsLeft)}</span>
            </>
          )}
        </button>
      </div>

      {cfg.hint && <p className="text-center text-xs text-muted-foreground">{cfg.hint}</p>}
    </div>
  );
}
