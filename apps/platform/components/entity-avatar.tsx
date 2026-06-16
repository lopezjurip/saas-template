import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import type { ComponentProps } from "react";

/** The entities that have a public avatar route under `/api/v1/<entity>/<id>/avatar`. */
export type AvatarEntity = "organizations" | "tenants" | "profiles" | "agencies";

/**
 * Display-only avatar for an entity (organization, tenant, profile, agency). Pass `entity` +
 * `entityId` and it points at the stable avatar route (`/api/v1/<entity>/<id>/avatar`); the route
 * streams the uploaded image or 404s, in which case the deterministic colored-initials fallback
 * shows. This is the only sanctioned way to render these avatars: composing shadcn `Avatar` means
 * the fallback kicks in for the (common) no-logo case, whereas a raw `<img>` would show a broken
 * glyph.
 *
 * For the upload/edit surfaces use {@link EntityLogoControls} instead (it needs an explicit
 * storage `src` so the preview updates immediately after upload).
 *
 * @example <EntityAvatar entity="agencies" entityId={agency.agencyId} name={agency.agencyName} className="size-8" />
 */
export function EntityAvatar({
  entity,
  entityId,
  name,
  shape = "square",
  className,
  ...props
}: {
  entity: AvatarEntity;
  entityId: string | number;
  name: string;
  shape?: "circle" | "square";
} & ComponentProps<typeof Avatar>) {
  const colorStyle = COLOR_HSL_FROM_STRING(name);
  const rounded = shape === "circle" ? "rounded-full" : "rounded-md";
  return (
    <Avatar
      className={cn("shrink-0 overflow-hidden border font-mono font-medium tracking-tight", rounded, className)}
      {...props}
    >
      <AvatarImage src={`/api/v1/${entity}/${entityId}/avatar`} alt={name} className="object-cover" />
      <AvatarFallback
        className={cn("flex h-full w-full items-center justify-center", rounded)}
        style={{ backgroundColor: colorStyle.background, color: colorStyle.color, borderColor: colorStyle.borderColor }}
      >
        {INITIALS_OF(name)}
      </AvatarFallback>
    </Avatar>
  );
}
