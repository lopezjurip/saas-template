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
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import { OtpField } from "../_components/otp-field";
import { actionCheckDocument, actionVerifyDocumentLoginOtp } from "./actions";

type DocKind = "nin" | "passport";

type LoginState = { channel: "sms" | "email"; contact: string; masked: string };

export function DocumentStepForm({ value, next }: { value: string; next: string }) {
  const { t } = useRosetta(LOCALES);
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
          setError(t("error_send"));
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
          // multiple invites: send to accept with the first; the accept screen lists the rest
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
          setInfo(t("info_no_account"));
          break;
      }
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!login) return;
    setError(null);
    startTransition(async () => {
      // on success this action redirects server-side to /home; only returns on failure
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
      if (err) setError(t("error_otp"));
    });
  }

  if (login) {
    const channelLabel = login.channel === "sms" ? t("channel_sms") : t("channel_email");
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="doc-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              {t("sent_to_prefix", { channel: channelLabel })}{" "}
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
          <span>{pending ? t("verifying") : t("verify")}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => setLogin(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("use_other_doc")}
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
            {k === "nin" ? t("tab_rut") : t("tab_passport")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="doc-value">{kind === "nin" ? t("label_rut") : t("label_passport")}</Label>
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
            placeholder={kind === "nin" ? t("placeholder_rut") : t("placeholder_passport")}
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
        <span>{pending ? t("checking") : t("continue")}</span>
        <ArrowRight size={16} />
      </Button>
      <input type="hidden" name="next" value={next} />
    </form>
  );
}

const LOCALE_ES = {
  tab_rut: "RUT",
  tab_passport: "Pasaporte",
  label_rut: "RUT",
  label_passport: "Número de pasaporte",
  placeholder_rut: "12.345.678-9",
  placeholder_passport: "P1234567",
  sent_to_prefix: "Enviado por {{channel}} a",
  channel_sms: "SMS",
  channel_email: "correo",
  verifying: "Verificando…",
  verify: "Verificar",
  use_other_doc: "Usar otro documento",
  checking: "Verificando…",
  continue: "Continuar",
  error_send: "No pudimos enviar el código. Intenta de nuevo.",
  error_otp: "Código incorrecto o expirado.",
  info_no_account:
    "No encontramos una cuenta ni una invitación con ese documento. Pídele a tu empresa que te invite, o entra con tu correo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  tab_rut: "ID",
  tab_passport: "Passport",
  label_rut: "ID",
  label_passport: "Passport number",
  placeholder_rut: "12.345.678-9",
  placeholder_passport: "P1234567",
  sent_to_prefix: "Sent via {{channel}} to",
  channel_sms: "SMS",
  channel_email: "email",
  verifying: "Verifying…",
  verify: "Verify",
  use_other_doc: "Use another document",
  checking: "Verifying…",
  continue: "Continue",
  error_send: "We couldn't send the code. Please try again.",
  error_otp: "Incorrect or expired code.",
  info_no_account:
    "We didn't find an account or invitation with that document. Ask your company to invite you, or sign in with your email.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  tab_rut: "Documento",
  tab_passport: "Passaporte",
  label_rut: "Documento",
  label_passport: "Número de passaporte",
  placeholder_rut: "12.345.678-9",
  placeholder_passport: "P1234567",
  sent_to_prefix: "Enviado via {{channel}} para",
  channel_sms: "SMS",
  channel_email: "e-mail",
  verifying: "A verificar…",
  verify: "Verificar",
  use_other_doc: "Usar outro documento",
  checking: "A verificar…",
  continue: "Continuar",
  error_send: "Não foi possível enviar o código. Tente novamente.",
  error_otp: "Código incorreto ou expirado.",
  info_no_account:
    "Não encontramos uma conta nem um convite com esse documento. Peça à sua empresa que o convide, ou entre com o seu e-mail.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
