import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import type { ComponentProps } from "react";

/**
 * Display-only avatar for an entity (organization, tenant, profile, agency). Point `src` at the
 * stable avatar route (`/api/v1/<entity>/<id>/avatar`) — the route 307-redirects to the uploaded
 * image or 404s, in which case the deterministic colored-initials fallback shows. This is the only
 * sanctioned way to render these avatars: a raw `<img src={route}>` would show a broken-image glyph
 * for the (common) no-logo case, whereas this composes shadcn `Avatar` so the fallback kicks in.
 *
 * For the upload/edit surfaces use {@link EntityLogoControls} instead (it needs an explicit
 * storage `src` so the preview updates immediately after upload).
 *
 * @example <EntityAvatar name={org.name} src={`/api/v1/organizations/${org.id}/avatar`} className="size-8 text-xs" />
 */
export function EntityAvatar({
  name,
  src,
  shape = "square",
  className,
  ...props
}: {
  name: string;
  src?: string | null;
  shape?: "circle" | "square";
} & ComponentProps<typeof Avatar>) {
  const colorStyle = COLOR_HSL_FROM_STRING(name);
  const rounded = shape === "circle" ? "rounded-full" : "rounded-md";
  return (
    <Avatar
      className={cn("shrink-0 overflow-hidden border font-mono font-medium tracking-tight", rounded, className)}
      {...props}
    >
      {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
      <AvatarFallback
        className={cn("flex h-full w-full items-center justify-center", rounded)}
        style={{ backgroundColor: colorStyle.background, color: colorStyle.color, borderColor: colorStyle.borderColor }}
      >
        {INITIALS_OF(name)}
      </AvatarFallback>
    </Avatar>
  );
}
