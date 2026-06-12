"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, Fingerprint, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { OtpField } from "../_components/otp-field";

type Channel = "sms" | "whatsapp";

type Props = {
  phone: string;
  next: string;
  channels: Channel[];
};

function RESOLVE_TARGET(locale: string, next: string): string {
  return next.startsWith("/") && next !== "/" ? next : `/${locale}/home`;
}

export function PhoneStepForm({ phone, next, channels }: Props) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sentVia, setSentVia] = useState<Channel | null>(null);
  const [token, setToken] = useState("");

  function onSend(channel: Channel) {
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true, channel },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSentVia(channel);
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (err) {
        setError("Código incorrecto o expirado.");
        return;
      }
      await supabase.auth.refreshSession();
      router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(locale, next))));
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
        const supabase = createBrowserClient();
        const { error: err } = await supabase.auth.signInWithPasskey();
        if (err) throw err;
        await supabase.auth.refreshSession();
        router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(locale, next))));
        router.refresh();
      } catch (err) {
        if (err instanceof Error && err.name === "NotAllowedError") {
          setError("Cancelaste el inicio con passkey.");
        } else {
          setError(err instanceof Error ? err.message : "No pudimos verificar tu passkey.");
        }
      }
    });
  }

  if (sentVia) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="phone-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              Enviado por {sentVia === "whatsapp" ? "WhatsApp" : "SMS"} a{" "}
              <strong className="font-medium text-foreground">{phone}</strong>.
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
        <button
          type="button"
          onClick={() => setSentVia(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          Probar otro método
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" onClick={onPasskey} disabled={pending} className="h-10 w-full">
        <Fingerprint size={16} />
        <span>{pending ? "Verificando…" : "Continuar con passkey"}</span>
      </Button>

      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {channels.includes("whatsapp") && (
        <Button type="button" onClick={() => onSend("whatsapp")} disabled={pending} variant="outline" className="h-10 w-full">
          <MessageCircle size={16} />
          <span>{pending ? "Enviando…" : "Enviar código por WhatsApp"}</span>
        </Button>
      )}

      {channels.includes("sms") && (
        <Button
          type="button"
          onClick={() => onSend("sms")}
          disabled={pending}
          variant={channels.includes("whatsapp") ? "outline" : "outline"}
          className="h-10 w-full"
        >
          <Smartphone size={16} />
          <span>{pending ? "Enviando…" : "Enviar código por SMS"}</span>
        </Button>
      )}
    </div>
  );
}
