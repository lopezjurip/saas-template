"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import { OtpField } from "../../_components/otp-field";
import { actionStartDocumentSignup, actionVerifyDocumentSignup } from "./actions";

type Channel = "sms" | "email";

export function AcceptSignupForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [contactInput, setContactInput] = useState("");
  const [sent, setSent] = useState<{ channel: Channel; contact: string } | null>(null);
  const [otp, setOtp] = useState("");

  function onStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const [result, err] = await ErrorSafeAction.unwrap(
        actionStartDocumentSignup({
          invitation_token: token,
          full_name: fullName,
          channel,
          phone: channel === "sms" ? contactInput : "",
          email: channel === "email" ? contactInput : "",
        }),
      );
      if (err) {
        setError(err.message);
        return;
      }
      setSent({ channel: result.channel, contact: result.contact });
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!sent) return;
    setError(null);
    startTransition(async () => {
      // Verifies and redirects server-side to the org / home on success.
      const [, err] = await ErrorSafeAction.unwrap(
        actionVerifyDocumentSignup({
          invitation_token: token,
          channel: sent.channel,
          contact: sent.contact,
          token: otp,
        }),
      );
      if (err) setError("Código incorrecto o expirado.");
    });
  }

  if (sent) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="accept-otp"
          value={otp}
          onChange={setOtp}
          sentTo={
            <>
              Enviado por {sent.channel === "sms" ? "SMS" : "correo"} a{" "}
              <strong className="font-medium text-foreground">{sent.contact}</strong>.
            </>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending || otp.length !== 6} className="h-10 w-full">
          <span>{pending ? "Verificando…" : "Aceptar invitación"}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          Cambiar datos
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onStart} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accept-name">Tu nombre completo</Label>
        <Input
          id="accept-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-10"
          placeholder="María Pérez"
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        {(["email", "sms"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setChannel(c);
              setContactInput("");
            }}
            data-active={channel === c}
            className={cn(
              "h-8 rounded text-[13px] font-medium text-muted-foreground transition-colors",
              "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
            )}
          >
            {c === "email" ? "Correo" : "Teléfono"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accept-contact">{channel === "email" ? "Correo" : "Teléfono"}</Label>
        <Input
          id="accept-contact"
          value={contactInput}
          onChange={(e) => setContactInput(e.target.value)}
          className="h-10"
          type={channel === "email" ? "email" : "tel"}
          placeholder={channel === "email" ? "tu@empresa.cl" : "+56 9 1234 5678"}
          autoComplete={channel === "email" ? "email" : "tel"}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={pending || fullName.trim().length < 2 || contactInput.trim().length < 3}
        className="h-10 w-full"
      >
        <span>{pending ? "Enviando…" : "Enviar código"}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
