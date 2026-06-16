"use client";

import type { ComponentProps } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";

/**
 * Lets the viewer upload or remove their profile avatar using the public `profiles` storage
 * bucket (`<profile_id>/avatar/<filename>`). Thin wrapper over {@link EntityLogoControls}.
 *
 * @example
 * <ProfileAvatarControls profileId={user.id} name={profileName} avatarSrc={avatarSrc} />
 */
export function ProfileAvatarControls({
  profileId,
  name,
  avatarSrc,
  ...props
}: {
  profileId: string;
  name: string;
  avatarSrc: string | null;
} & Omit<ComponentProps<typeof EntityLogoControls>, "bucket" | "ownerKey" | "name" | "src" | "shape">) {
  return (
    <EntityLogoControls
      bucket="profiles"
      ownerKey={profileId}
      name={name}
      src={avatarSrc}
      shape="circle"
      helpText="Usa una imagen cuadrada. Si no subes una, seguimos mostrando tus iniciales."
      {...props}
    />
  );
}
