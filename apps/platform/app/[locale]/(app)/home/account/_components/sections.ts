// Catalog of /home/account sections. Each section is a URL segment and a sidebar item.
// Sections without a real backend are marked todo:true so the page can render a placeholder
// instead of an unwired form.

import { Bell, Globe, Key, Monitor, ShieldCheck, Trash2, User } from "lucide-react";
import type { ComponentType } from "react";
import { ROUTE_PATH } from "~/lib/route";

export type AccountSectionId =
  | "profile"
  | "security"
  | "connections"
  | "sessions"
  | "tokens"
  | "notifications"
  | "danger";

export type AccountSection = {
  id: AccountSectionId;
  label: string;
  group: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
  todo?: boolean;
};

export const ACCOUNT_SECTIONS: readonly AccountSection[] = [
  { id: "profile", label: "Perfil", group: "Cuenta", Icon: User },
  { id: "security", label: "Inicio de sesión", group: "Cuenta", Icon: ShieldCheck },
  { id: "connections", label: "Conexiones", group: "Cuenta", Icon: Globe, todo: true },
  { id: "sessions", label: "Dispositivos", group: "Seguridad", Icon: Monitor },
  { id: "tokens", label: "Tokens de API", group: "Desarrollo", Icon: Key, todo: true },
  { id: "notifications", label: "Notificaciones", group: "Preferencias", Icon: Bell, todo: true },
  { id: "danger", label: "Eliminar cuenta", group: "Zona de riesgo", Icon: Trash2, danger: true, todo: true },
];

const ACCOUNT_SECTION_PATHS = {
  profile: ROUTE_PATH("/[locale]/home/account/profile"),
  security: ROUTE_PATH("/[locale]/home/account/security"),
  connections: ROUTE_PATH("/[locale]/home/account/connections"),
  sessions: ROUTE_PATH("/[locale]/home/account/sessions"),
  tokens: ROUTE_PATH("/[locale]/home/account/tokens"),
  notifications: ROUTE_PATH("/[locale]/home/account/notifications"),
  danger: ROUTE_PATH("/[locale]/home/account/danger"),
} as const satisfies Record<AccountSectionId, string>;

export function ACCOUNT_SECTION_PATH(id: AccountSectionId): (typeof ACCOUNT_SECTION_PATHS)[AccountSectionId] {
  return ACCOUNT_SECTION_PATHS[id];
}
