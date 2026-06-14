"use client";

import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRosetta } from "~/lib/i18n.client";

/**
 * Shared 6-digit code field for every OTP "sent" step (email, phone, document, accept).
 * Short label + muted "where we sent it" helper, so it doesn't read as a second heading.
 */
export function OtpField({
  id,
  value,
  onChange,
  onPasteComplete,
  sentTo,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  onPasteComplete?: (next: string) => void;
  sentTo: React.ReactNode;
}) {
  const { t } = useRosetta(LOCALES);

  function handleChange(next: string) {
    onChange(next.replace(/\D/g, "").slice(0, 6));
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const next = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (next.length === 6) {
      onPasteComplete?.(next);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t("label")}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={handlePaste}
        className="h-12 text-center font-mono text-lg tracking-[0.5em]"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        placeholder="••••••"
        autoFocus
      />
      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">{sentTo}</p>
    </div>
  );
}

const LOCALE_ES = {
  label: "Código de verificación",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label: "Verification code",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label: "Código de verificação",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
