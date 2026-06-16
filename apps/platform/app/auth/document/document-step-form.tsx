"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCountries } from "~/hooks/use-countries";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import {
  DOCUMENT_VALUE_LABEL,
  DOCUMENT_VALUE_PLACEHOLDER,
  FORMAT_DOCUMENT,
  NORMALIZE_DOCUMENT,
} from "../_components/document-labels";
import { OtpField } from "../_components/otp-field";
import { actionCheckDocument, actionVerifyDocumentLoginOtp } from "./actions";

type DocKind = "nin" | "passport";

type LoginState = { channel: "sms" | "email"; contact: string; masked: string };

export function DocumentStepForm({ value, next }: { value: string; next: string }) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [country, setCountry] = useState("CL");
  const [kind, setKind] = useState<DocKind>("nin");
  // The initial `value` prefill comes from the signup hand-off, which today is always a CL RUT.
  const [doc, setDoc] = useState(() =>
    value ? FORMAT_DOCUMENT("CL", "nin", NORMALIZE_DOCUMENT("CL", "nin", value)) : "",
  );
  const [login, setLogin] = useState<LoginState | null>(null);
  const [noAccount, setNoAccount] = useState(false);
  const [token, setToken] = useState("");

  const { data: countriesData } = useCountries();
  const countries = countriesData?.["addressesLevel0"]?.["edges"] ?? [];

  function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
              ROUTE("/auth/document/accept", {
                token: result["invitation_token"],
              }),
            ),
          );
          break;
        case "pick_invite":
          // multiple invites: send to accept with the first; the accept screen lists the rest
          router.push(
            ROUTE_HREF(
              ROUTE("/auth/document/accept", {
                token: result["invites"][0]?.["invitation_token"] ?? "",
              }),
            ),
          );
          break;
        case "redirect_signup":
          setNoAccount(true);
          break;
      }
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!login) return;
    setError(null);
    startTransition(async () => {
      // on success this action redirects server-side to /auth/router; only returns on failure
      const [, err] = await ErrorSafeAction.unwrap(
        actionVerifyDocumentLoginOtp({
          address_level0_id: country,
          profile_identity_document_kind: kind,
          profile_identity_document_value: doc,
          channel: login.channel,
          contact: login.contact,
          token,
          next,
        }),
      );
      if (err) setError(t("error_otp"));
    });
  }

  if (noAccount) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertDescription>{t("info_no_account")}</AlertDescription>
        </Alert>
        <Button
          type="button"
          onClick={() => router.push(ROUTE_HREF(ROUTE("/auth", { locale, next })))}
          className="h-10 w-full"
        >
          <span>{t("signup_other_method")}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => {
            setNoAccount(false);
            setError(null);
          }}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("retry")}
        </button>
      </div>
    );
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="doc-country">{t("label_country")}</Label>
        <Select
          value={country}
          onValueChange={(next_country) => {
            setCountry(next_country);
            // A value formatted under one country's rule is meaningless under another — start fresh.
            setDoc("");
          }}
        >
          <SelectTrigger id="doc-country" className="w-full">
            <SelectValue placeholder={t("select_country")} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((edge) => {
              const node = edge["node"];
              return (
                <SelectItem
                  key={node["addressLevel0Id"]}
                  value={node["addressLevel0Id"]}
                  textValue={node["addressLevel0Name"]}
                >
                  {node["addressLevel0Emoji"] ? `${node["addressLevel0Emoji"]} ` : ""}
                  {node["addressLevel0Name"]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        {(["nin", "passport"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              // Re-normalize the current value under the new kind so blur formatting stays correct.
              setDoc((current) => NORMALIZE_DOCUMENT(country, k, current));
              setKind(k);
            }}
            data-active={kind === k}
            className={cn(
              "h-8 rounded text-sm/normal font-medium text-muted-foreground transition-colors",
              "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
            )}
          >
            {k === "nin" ? DOCUMENT_VALUE_LABEL(country, "nin") : t("tab_passport")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="doc-value">{DOCUMENT_VALUE_LABEL(country, kind)}</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            <IdCard size={16} />
          </span>
          <Input
            id="doc-value"
            value={doc}
            onChange={(e) => {
              setDoc(NORMALIZE_DOCUMENT(country, kind, e.target.value));
            }}
            onBlur={() => {
              setDoc((current) => FORMAT_DOCUMENT(country, kind, current));
            }}
            className="h-10 pl-9"
            placeholder={DOCUMENT_VALUE_PLACEHOLDER(country, kind)}
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

      <Button type="submit" disabled={pending || doc.trim().length < 2} className="h-10 w-full">
        <span>{pending ? t("checking") : t("continue")}</span>
        <ArrowRight size={16} />
      </Button>
      <input type="hidden" name="next" value={next} />
    </form>
  );
}

const LOCALE_ES = {
  label_country: "País",
  select_country: "Selecciona…",
  tab_passport: "Pasaporte",
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
  signup_other_method: "Crear cuenta con otro método",
  retry: "Volver a intentar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_country: "Country",
  select_country: "Select…",
  tab_passport: "Passport",
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
  signup_other_method: "Create account with another method",
  retry: "Try again",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_country: "País",
  select_country: "Selecione…",
  tab_passport: "Passaporte",
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
  signup_other_method: "Criar conta com outro método",
  retry: "Tentar novamente",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
