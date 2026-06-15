/**
 * Catalog of /home/account sections. Each section is a URL segment and a sidebar item.
 * Sections without a real backend are marked todo:true so the page can render a placeholder
 * instead of an unwired form.
 *
 * `labelKey` and `groupKey` are stable i18n keys resolved in sidebar.tsx. They are not
 * translated strings — sidebar.tsx owns all translations for this nav surface.
 */

import { Bell, Globe, Monitor, ShieldCheck, Trash2, Unplug, User } from "lucide-react";
import type { ComponentType } from "react";
import { ROUTE_PATH } from "~/lib/route";

export type AccountSectionId =
  | "profile"
  | "security"
  | "connections"
  | "sessions"
  | "notifications"
  | "integrations"
  | "danger";

export type AccountGroupKey = "account" | "security_group" | "danger_zone" | "preferences";

export type AccountLabelKey =
  | "nav_profile"
  | "nav_security"
  | "nav_connections"
  | "nav_sessions"
  | "nav_notifications"
  | "nav_integrations"
  | "nav_danger";

export type AccountSection = {
  id: AccountSectionId;
  labelKey: AccountLabelKey;
  groupKey: AccountGroupKey;
  Icon: ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
  todo?: boolean;
};

export const ACCOUNT_SECTIONS: readonly AccountSection[] = [
  { id: "profile", labelKey: "nav_profile", groupKey: "account", Icon: User },
  { id: "security", labelKey: "nav_security", groupKey: "account", Icon: ShieldCheck },
  { id: "connections", labelKey: "nav_connections", groupKey: "account", Icon: Globe, todo: true },
  { id: "sessions", labelKey: "nav_sessions", groupKey: "security_group", Icon: Monitor },
  { id: "notifications", labelKey: "nav_notifications", groupKey: "preferences", Icon: Bell, todo: true },
  { id: "integrations", labelKey: "nav_integrations", groupKey: "preferences", Icon: Unplug },
  { id: "danger", labelKey: "nav_danger", groupKey: "danger_zone", Icon: Trash2, danger: true, todo: true },
];

const ACCOUNT_SECTION_PATHS = {
  profile: ROUTE_PATH("/home/account/profile"),
  security: ROUTE_PATH("/home/account/security"),
  connections: ROUTE_PATH("/home/account/connections"),
  sessions: ROUTE_PATH("/home/account/sessions"),
  notifications: ROUTE_PATH("/home/account/notifications"),
  integrations: ROUTE_PATH("/home/account/integrations"),
  danger: ROUTE_PATH("/home/account/danger"),
} as const satisfies Record<AccountSectionId, string>;

export function ACCOUNT_SECTION_PATH(id: AccountSectionId): (typeof ACCOUNT_SECTION_PATHS)[AccountSectionId] {
  return ACCOUNT_SECTION_PATHS[id];
}
