"use client";

import type { ComponentProps } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { useRosetta } from "~/hooks/use-rosetta";

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
  const r = useRosetta(LOCALES);
  return (
    <EntityLogoControls
      bucket="profiles"
      ownerKey={profileId}
      name={name}
      src={avatarSrc}
      shape="circle"
      helpText={r.t("helpText")}
      {...props}
    />
  );
}

const LOCALE_ES = {
  helpText: "Usa una imagen cuadrada. Si no subes una, seguimos mostrando tus iniciales.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    helpText: "Use a square image. If you don't upload one, we'll keep showing your initials.",
  } satisfies typeof LOCALE_ES,
  pt: {
    helpText: "Use uma imagem quadrada. Se não enviar uma, continuaremos mostrando suas iniciais.",
  } satisfies typeof LOCALE_ES,
};
