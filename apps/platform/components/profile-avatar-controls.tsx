"use client";

import { getSupabaseClient } from "@packages/supabase/client.browser";
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react";

const PROFILE_AVATAR_BUCKET = "profiles";
const PROFILE_AVATAR_ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const PROFILE_AVATAR_MAX_SIZE = 5 * 1024 * 1024;

function PROFILE_AVATAR_FOLDER(profileId: string) {
  return `${profileId}/avatar`;
}

function PROFILE_AVATAR_PATH(profileId: string, fileName: string) {
  const timestamp = String(Date.now()).padStart(13, "0");
  const random = crypto.randomUUID();
  return `${PROFILE_AVATAR_FOLDER(profileId)}/${timestamp}-${random}-${PROFILE_AVATAR_SAFE_FILE_NAME(fileName)}`;
}

function PROFILE_AVATAR_SAFE_FILE_NAME(fileName: string) {
  return (
    fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "avatar"
  );
}

async function deleteProfileAvatarFiles(profileId: string) {
  const supabase = getSupabaseClient();
  const folder = PROFILE_AVATAR_FOLDER(profileId);
  const { data: files, error } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).list(folder, {
    limit: 1000,
    sortBy: { column: "name", order: "desc" },
  });
  if (error) {
    throw error;
  }
  const paths = files?.map((file) => `${folder}/${file["name"]}`) ?? [];
  if (paths.length === 0) {
    return;
  }
  const { error: removeError } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove(paths);
  if (removeError) {
    throw removeError;
  }
}

/**
 * Lets the viewer upload or remove their profile avatar using the `profiles` storage bucket.
 * The bucket is public and follows the `<profile_id>/avatar/<filename>` convention.
 *
 * @example
 * <ProfileAvatarControls profileId={user.id} name={profileName} avatarSrc={avatarSrc} />
 */
export function ProfileAvatarControls({
  profileId,
  name,
  avatarSrc,
  className,
  ...props
}: {
  profileId: string;
  name: string;
  avatarSrc: string | null;
} & ComponentProps<"div">) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function triggerUpload() {
    inputRef.current?.click();
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || busy) {
      return;
    }
    if (!PROFILE_AVATAR_ALLOWED_MIME_TYPES.has(file.type)) {
      setServerError("Solo aceptamos PNG, JPEG, WebP o GIF.");
      return;
    }
    if (file.size > PROFILE_AVATAR_MAX_SIZE) {
      setServerError("La imagen no puede superar 5 MiB.");
      return;
    }

    setBusy(true);
    setServerError(null);

    try {
      const supabase = getSupabaseClient();
      const folder = PROFILE_AVATAR_FOLDER(profileId);
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .list(folder, {
          limit: 1000,
          sortBy: { column: "name", order: "desc" },
        });
      if (listError) {
        throw listError;
      }

      const path = PROFILE_AVATAR_PATH(profileId, file.name);
      const { error: uploadError } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) {
        throw uploadError;
      }

      const oldPaths =
        existingFiles?.map((entry) => `${folder}/${entry["name"]}`).filter((existingPath) => existingPath !== path) ??
        [];
      if (oldPaths.length > 0) {
        const { error: removeError } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove(oldPaths);
        if (removeError) {
          throw removeError;
        }
      }

      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No pudimos subir la foto.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (busy || !avatarSrc) {
      return;
    }

    setBusy(true);
    setServerError(null);

    try {
      await deleteProfileAvatarFiles(profileId);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No pudimos quitar la foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div {...props} className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex items-center gap-4">
        <Avatar className="inline-flex size-22 shrink-0 overflow-hidden rounded-full border bg-muted text-3xl font-semibold tracking-[-0.02em] text-muted-foreground">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt={name || "Avatar"} className="object-cover" /> : null}
          <AvatarFallback className="bg-muted text-3xl font-semibold tracking-[-0.02em] text-muted-foreground">
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
            {busy ? "Procesando…" : avatarSrc ? "Cambiar foto" : "Subir foto"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || !avatarSrc}
            className="text-muted-foreground"
            onClick={handleRemove}
          >
            {busy ? "Quitando…" : "Quitar"}
          </Button>
        </div>
      </div>
      <p className="text-xs leading-snug text-muted-foreground">
        Usa una imagen cuadrada. Si no subes una, seguimos mostrando tus iniciales.
      </p>
      {serverError && <p className="text-destructive text-xs leading-snug">{serverError}</p>}
    </div>
  );
}
