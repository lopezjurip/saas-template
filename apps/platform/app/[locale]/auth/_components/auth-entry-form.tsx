"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { RUT_FORMAT } from "@packages/utils/rut";
import { ArrowRight, IdCard, Mail, Phone, Search } from "lucide-react";
import { useState } from "react";
import { actionContinueAuth } from "../actions";

type LocalKind = "email" | "phone" | "document";

const KIND_META: Record<LocalKind, { label: string; Icon: typeof Mail }> = {
  email: { label: "correo", Icon: Mail },
  phone: { label: "teléfono", Icon: Phone },
  document: { label: "RUT", Icon: IdCard },
};

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
  const [value, setValue] = useState("");
  const detected = DETECT_LOCAL_TYPE(value);
  const Icon = detected ? KIND_META[detected].Icon : Search;
  // The field name drives `actionContinueAuth`'s dispatch (email | phone | document).
  const fieldName: LocalKind = detected ?? "email";

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value;
    if (DETECT_LOCAL_TYPE(next) === "document" && /[\dkK]/.test(next)) {
      next = RUT_FORMAT(next, { dots: true, dash: true });
    }
    setValue(next);
  }

  return (
    <form action={actionContinueAuth} className="flex flex-col gap-2.5">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="auth-identifier" className="m-0">
            Cuenta
          </Label>
          {detected && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" />
              {KIND_META[detected].label} detectado
            </span>
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
            className={cn("h-10 pl-9", error && "border-destructive")}
            placeholder="Correo, teléfono o RUT"
            autoComplete="username"
            autoFocus
          />
        </div>
        {error ? (
          <p className="text-xs leading-relaxed text-destructive">{error}</p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Si no tienes cuenta, te enviaremos un enlace mágico para crearla.
          </p>
        )}
      </div>
      <Button type="submit" className="h-10 w-full">
        <span>Continuar</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
