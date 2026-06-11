"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { RUT_FORMAT } from "@packages/utils/rut";
import { ArrowRight, IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import { OtpField } from "../_components/otp-field";
import { actionCheckDocument, actionVerifyDocumentLoginOtp } from "./actions";

type DocKind = "nin" | "passport";

type LoginState = { channel: "sms" | "email"; contact: string; masked: string };

export function DocumentStepForm({ value, next }: { value: string; next: string }) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [kind, setKind] = useState<DocKind>("nin");
  const [doc, setDoc] = useState(() => (value ? RUT_FORMAT(value, { dots: true, dash: true }) : ""));
  const [login, setLogin] = useState<LoginState | null>(null);
  const [token, setToken] = useState("");

  const country = "CL";

  function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const [result, err] = await ErrorSafeAction.unwrap(
        actionCheckDocument({
          address_level0_id: country,
          profile_identity_document_kind: kind,
          profile_identity_document_value: doc,
        }),
      );
      if (err) {
        setError(err.message);
        return;
      }
      switch (result["kind"]) {
        case "login":
          setLogin({
            channel: result["channel"],
            contact: result["contact"],
            masked: result["masked"],
          });
          break;
        case "error":
          setError("No pudimos enviar el código. Intenta de nuevo.");
          break;
        case "redirect_accept":
          router.push(
            ROUTE_HREF(
              ROUTE("/[locale]/auth/document/accept", {
                locale,
                token: result["invitation_token"],
              }),
            ),
          );
          break;
        case "pick_invite":
          // Multiple invites: send to accept with the first; the accept screen lists the rest.
          router.push(
            ROUTE_HREF(
              ROUTE("/[locale]/auth/document/accept", {
                locale,
                token: result["invites"][0]?.["invitation_token"] ?? "",
              }),
            ),
          );
          break;
        case "redirect_signup":
          setInfo(
            "No encontramos una cuenta ni una invitación con ese documento. Pídele a tu empresa que te invite, o entra con tu correo.",
          );
          break;
      }
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!login) return;
    setError(null);
    startTransition(async () => {
      // On success this action redirects server-side to /home; it only returns on failure.
      const [, err] = await ErrorSafeAction.unwrap(
        actionVerifyDocumentLoginOtp({
          address_level0_id: country,
          profile_identity_document_kind: kind,
          profile_identity_document_value: doc,
          channel: login.channel,
          contact: login.contact,
          token,
        }),
      );
      if (err) setError("Código incorrecto o expirado.");
    });
  }

  if (login) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="doc-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              Enviado por {login.channel === "sms" ? "SMS" : "correo"} a{" "}
              <strong className="font-medium text-foreground">{login.masked}</strong>.
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
          onClick={() => setLogin(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          Usar otro documento
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCheck} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        {(["nin", "passport"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            data-active={kind === k}
            className={cn(
              "h-8 rounded text-sm/normal font-medium text-muted-foreground transition-colors",
              "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
            )}
          >
            {k === "nin" ? "RUT" : "Pasaporte"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="doc-value">{kind === "nin" ? "RUT" : "Número de pasaporte"}</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            <IdCard size={16} />
          </span>
          <Input
            id="doc-value"
            value={doc}
            onChange={(e) =>
              setDoc(kind === "nin" ? RUT_FORMAT(e.target.value, { dots: true, dash: true }) : e.target.value)
            }
            className="h-10 pl-9"
            placeholder={kind === "nin" ? "12.345.678-9" : "P1234567"}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || doc.trim().length < 2} className="h-10 w-full">
        <span>{pending ? "Verificando…" : "Continuar"}</span>
        <ArrowRight size={16} />
      </Button>
      <input type="hidden" name="next" value={next} />
    </form>
  );
}
