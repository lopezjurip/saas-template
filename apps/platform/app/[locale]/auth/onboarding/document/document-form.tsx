"use client";

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
import { RUT_FORMAT, RUT_NORMALIZE, RUT_VALIDATE } from "@packages/utils/rut";
import { ArrowRight, Check, IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";

type DocumentType = "rut" | "passport" | "dni";

const DOCUMENT_TYPES: readonly { value: DocumentType; label: string }[] = [
  { value: "rut", label: "RUT (Chile)" },
  { value: "dni", label: "DNI (Argentina)" },
  { value: "passport", label: "Pasaporte" },
] as const;

const PLACEHOLDERS: Record<DocumentType, string> = {
  rut: "12.345.678-9",
  dni: "12.345.678",
  passport: "AB123456",
};

function DISPLAY_VALUE(type: DocumentType, raw: string): string {
  if (type !== "rut") {
    return raw;
  }
  const normalized = RUT_NORMALIZE(raw);
  return normalized.length > 2 ? RUT_FORMAT(normalized) : normalized;
}

function VALIDATE(type: DocumentType, raw: string): string | null {
  const value = raw.trim();
  if (value.length === 0) {
    return "Ingresa el número de tu documento.";
  }
  if (type === "rut") {
    return RUT_VALIDATE(RUT_NORMALIZE(value)) ? null : "RUT inválido. Revisa el número y el dígito verificador.";
  }
  if (type === "dni" && !/^\d{6,9}$/.test(value.replace(/\D/g, ""))) {
    return "El DNI debe tener entre 6 y 9 dígitos.";
  }
  if (type === "passport" && !/^[A-Za-z0-9]{6,12}$/.test(value)) {
    return "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos.";
  }
  return null;
}

export function DocumentForm() {
  const locale = useLocaleParam();
  const router = useRouter();
  const [type, setType] = useState<DocumentType>("rut");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onChangeType(next: string) {
    setType(next as DocumentType);
    setValue("");
    setError(null);
  }

  function onChangeValue(raw: string) {
    setValue(type === "rut" ? DISPLAY_VALUE("rut", raw) : raw);
    if (error) {
      setError(null);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = VALIDATE(type, value);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push(`/${locale}/auth/onboarding`), 700);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border bg-muted/35 p-5 text-center">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background">
          <Check size={18} />
        </span>
        <strong className="text-sm font-medium text-foreground">Documento guardado</strong>
        <span className="text-[12.5px] text-muted-foreground">Volviendo al inicio…</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="document-type">Tipo de documento</Label>
        <Select value={type} onValueChange={onChangeType}>
          <SelectTrigger id="document-type" className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="document-number">Número</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <IdCard size={16} />
          </span>
          <Input
            id="document-number"
            className="h-10 pl-9"
            type="text"
            inputMode={type === "passport" ? "text" : "numeric"}
            placeholder={PLACEHOLDERS[type]}
            autoComplete="off"
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            aria-invalid={!!error}
          />
        </div>
        {error ? (
          <p className="text-destructive text-xs">{error}</p>
        ) : (
          <p className="text-[11.5px] leading-[1.4] text-muted-foreground">
            {type === "rut"
              ? "Validamos el formato y el dígito verificador. Para procesos formales también te pediremos una foto del documento."
              : "Validamos el formato. Para procesos formales también te pediremos una foto del documento."}
          </p>
        )}
      </div>

      <Button type="submit" className="h-10 w-full">
        <span>Guardar documento</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
