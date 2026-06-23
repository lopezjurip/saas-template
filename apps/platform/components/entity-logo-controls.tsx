"use client";

import { getSupabaseClient } from "@packages/supabase/client.browser";
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";

const LOGO_ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const LOGO_MAX_SIZE = 5 * 1024 * 1024;

function LOGO_SAFE_FILE_NAME(fileName: string) {
  return (
    fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "avatar"
  );
}

function LOGO_PATH(folder: string, fileName: string) {
  const timestamp = String(Date.now()).padStart(13, "0");
  const random = crypto.randomUUID();
  return `${folder}/${timestamp}-${random}-${LOGO_SAFE_FILE_NAME(fileName)}`;
}

/**
 * Headless upload/remove control for any public storage "avatar" folder following the
 * `<ownerKey>/<folder>/<filename>` convention (the same one `profiles`, `organizations` and
 * `tenants` buckets use). Validates mime + size, replaces the previous file on upload, and
 * `router.refresh()`es so the server re-reads the storage view. RLS on the bucket decides who
 * may write — the control just surfaces the resulting error.
 *
 * @example
 * <EntityLogoControls bucket="organizations" ownerKey={String(organizationId)} name={orgName} src={logoSrc} shape="square" />
 */
export function EntityLogoControls({
  bucket,
  ownerKey,
  folder = "avatar",
  name,
  src,
  shape = "circle",
  helpText,
  className,
  ...props
}: {
  bucket: string;
  ownerKey: string;
  folder?: string;
  name: string;
  src: string | null;
  shape?: "circle" | "square";
  helpText?: string;
} & ComponentProps<"div">) {
  const router = useRouter();
  const r = useRosetta(LOCALES);
  const effectiveHelpText = helpText ?? r.t("helpText.default");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const folderPath = `${ownerKey}/${folder}`;

  function triggerUpload() {
    inputRef.current?.click();
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || busy) {
      return;
    }
    if (!LOGO_ALLOWED_MIME_TYPES.has(file.type)) {
      setServerError(r.t("error.invalidType"));
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setServerError(r.t("error.tooLarge"));
      return;
    }

    setBusy(true);
    setServerError(null);

    try {
      const supabase = getSupabaseClient();
      const { data: existingFiles, error: listError } = await supabase.storage.from(bucket).list(folderPath, {
        limit: 1000,
        sortBy: { column: "name", order: "desc" },
      });
      if (listError) {
        throw listError;
      }

      const path = LOGO_PATH(folderPath, file.name);
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) {
        throw uploadError;
      }

      const oldPaths =
        existingFiles
          ?.map((entry) => `${folderPath}/${entry["name"]}`)
          .filter((existingPath) => existingPath !== path) ?? [];
      if (oldPaths.length > 0) {
        const { error: removeError } = await supabase.storage.from(bucket).remove(oldPaths);
        if (removeError) {
          throw removeError;
        }
      }

      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : r.t("error.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (busy || !src) {
      return;
    }

    setBusy(true);
    setServerError(null);

    try {
      const supabase = getSupabaseClient();
      const { data: files, error: listError } = await supabase.storage.from(bucket).list(folderPath, {
        limit: 1000,
        sortBy: { column: "name", order: "desc" },
      });
      if (listError) {
        throw listError;
      }
      const paths = files?.map((file) => `${folderPath}/${file["name"]}`) ?? [];
      if (paths.length > 0) {
        const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
        if (removeError) {
          throw removeError;
        }
      }
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : r.t("error.removeFailed"));
    } finally {
      setBusy(false);
    }
  }

  const rounded = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div {...props} className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex items-center gap-4">
        <Avatar
          className={cn(
            "bg-muted text-muted-foreground inline-flex size-22 shrink-0 overflow-hidden border text-3xl font-semibold tracking-tight",
            rounded,
          )}
        >
          {src ? <AvatarImage src={src} alt={name || "Logo"} className="object-cover" /> : null}
          <AvatarFallback className={cn("bg-muted text-foreground text-3xl font-semibold tracking-tight", rounded)}>
            {INITIALS_OF(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={triggerUpload}>
            {busy ? r.t("button.processing") : src ? r.t("button.change") : r.t("button.upload")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || !src}
            className="text-muted-foreground"
            onClick={handleRemove}
          >
            {busy ? r.t("button.removing") : r.t("button.remove")}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-xs leading-snug">{effectiveHelpText}</p>
      {serverError && <p className="text-destructive text-xs leading-snug">{serverError}</p>}
    </div>
  );
}

const LOCALE_ES = {
  "helpText.default": "Usa una imagen cuadrada. Si no subes una, seguimos mostrando las iniciales.",
  "error.invalidType": "Solo aceptamos PNG, JPEG, WebP o GIF.",
  "error.tooLarge": "La imagen no puede superar 5 MiB.",
  "error.uploadFailed": "No pudimos subir la imagen.",
  "error.removeFailed": "No pudimos quitar la imagen.",
  "button.processing": "Procesando…",
  "button.change": "Cambiar imagen",
  "button.upload": "Subir imagen",
  "button.removing": "Quitando…",
  "button.remove": "Quitar",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    "helpText.default": "Use a square image. If you don't upload one, we'll keep showing the initials.",
    "error.invalidType": "We only accept PNG, JPEG, WebP or GIF.",
    "error.tooLarge": "The image cannot exceed 5 MiB.",
    "error.uploadFailed": "We couldn't upload the image.",
    "error.removeFailed": "We couldn't remove the image.",
    "button.processing": "Processing…",
    "button.change": "Change image",
    "button.upload": "Upload image",
    "button.removing": "Removing…",
    "button.remove": "Remove",
  } satisfies typeof LOCALE_ES,
  pt: {
    "helpText.default": "Use uma imagem quadrada. Se não enviar uma, continuaremos mostrando as iniciais.",
    "error.invalidType": "Só aceitamos PNG, JPEG, WebP ou GIF.",
    "error.tooLarge": "A imagem não pode ultrapassar 5 MiB.",
    "error.uploadFailed": "Não conseguimos enviar a imagem.",
    "error.removeFailed": "Não conseguimos remover a imagem.",
    "button.processing": "Processando…",
    "button.change": "Alterar imagem",
    "button.upload": "Enviar imagem",
    "button.removing": "Removendo…",
    "button.remove": "Remover",
  } satisfies typeof LOCALE_ES,
};
