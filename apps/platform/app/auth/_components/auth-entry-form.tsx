"use client";

import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
import { ArrowRight, IdCard, Mail, Phone, Search } from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { actionContinueAuth } from "../actions";

type LocalKind = "email" | "phone" | "document";

/**
 * Heuristic type detection for the single smart field. Email wins on "@"; a verifier-digit
 * shape (12345678-9) or a trailing K means RUT; "+"/spacing/parens or a long digit run means
 * phone; everything else falls back to email (the most common identifier).
 */
function DETECT_LOCAL_TYPE(raw: string): LocalKind | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.includes("@")) return "email";
  const noDots = v.replace(/\./g, "");
  if (/[kK]/.test(v) || /\d-[\dkK]$/.test(noDots)) return "document";
  const digits = v.replace(/\D/g, "");
  if (v.startsWith("+") || /[\s()]/.test(v)) return "phone";
  if (digits.length >= 10 && digits.length <= 15) return "phone";
  if (digits.length >= 7) return "document";
  return "email";
}

export function AuthEntryForm({ next, error }: { next: string; error?: string | null }) {
  const { t } = useRosetta(LOCALES);
  const [value, setValue] = useState("");
  const detected = DETECT_LOCAL_TYPE(value);
  const Icon = detected ? KIND_ICON[detected] : Search;
  // field name drives `actionContinueAuth`'s dispatch (email | phone | document)
  const fieldName: LocalKind = detected ?? "email";

  const kindLabel = detected
    ? t(detected === "email" ? "kind_email" : detected === "phone" ? "kind_phone" : "kind_document")
    : null;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value;
    if (DETECT_LOCAL_TYPE(next) === "document" && /[\dkK]/.test(next)) {
      next = RUT_NORMALIZE(next);
    }
    setValue(next);
  }

  function onBlur() {
    if (DETECT_LOCAL_TYPE(value) === "document" && value.length > 1) {
      setValue(RUT_FORMAT(value, { dots: true, dash: true }));
    }
  }

  return (
    <form action={actionContinueAuth} className="flex flex-col gap-2.5">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="auth-identifier" className="m-0">
            {t("label_account")}
          </Label>
          {kindLabel && detected ? (
            <span className="inline-flex items-center gap-1 text-tiny text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" />
              {t("kind_detected", { kind: kindLabel })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-tiny invisible">Esperando input</span>
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            <Icon size={16} />
          </span>
          <Input
            id="auth-identifier"
            name={fieldName}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={cn("h-10 pl-9", error && "border-destructive")}
            placeholder={t("placeholder")}
            autoComplete="username"
            autoFocus
          />
        </div>
        {error ? (
          <p className="text-xs leading-relaxed text-destructive">{error}</p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">{t("hint")}</p>
        )}
      </div>
      <ButtonSpinner type="submit" pendingChildren={<span>{t("submit_pending")}</span>} className="h-10 w-full">
        <span>{t("submit")}</span>
        <ArrowRight size={16} />
      </ButtonSpinner>
    </form>
  );
}

const KIND_ICON: Record<LocalKind, typeof Mail> = {
  email: Mail,
  phone: Phone,
  document: IdCard,
};

const LOCALE_ES = {
  label_account: "Cuenta",
  kind_email: "correo",
  kind_phone: "teléfono",
  kind_document: "RUT",
  kind_detected: "{{kind}} detectado",
  placeholder: "Correo, teléfono o RUT",
  hint: "Si no tienes cuenta, te ayudaremos a crearla.",
  submit: "Continuar",
  submit_pending: "Continuando…",
  waiting: "Esperando input",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_account: "Account",
  kind_email: "email",
  kind_phone: "phone",
  kind_document: "ID",
  kind_detected: "{{kind}} detected",
  placeholder: "Email, phone or ID",
  hint: "We will send you a magic link.",
  submit: "Continue",
  submit_pending: "Continuing…",
  waiting: "Waiting for input",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_account: "Conta",
  kind_email: "e-mail",
  kind_phone: "telefone",
  kind_document: "documento",
  kind_detected: "{{kind}} detectado",
  placeholder: "E-mail, telefone ou documento",
  hint: "Se não tiver conta, enviaremos um link mágico para criá-la.",
  submit: "Continuar",
  submit_pending: "Continuando…",
  waiting: "Aguardando entrada",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
