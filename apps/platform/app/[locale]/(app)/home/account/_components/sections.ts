/**
 * Catalog of /home/account sections. Each section is a URL segment and a sidebar item.
 * Sections without a real backend are marked todo:true so the page can render a placeholder
 * instead of an unwired form.
 *
 * `labelKey` and `groupKey` are stable i18n keys resolved in sidebar.tsx. They are not
 * translated strings — sidebar.tsx owns all translations for this nav surface.
 */

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

export type AccountGroupKey = "account" | "security_group" | "development" | "danger_zone" | "preferences";

export type AccountLabelKey =
  | "nav_profile"
  | "nav_security"
  | "nav_connections"
  | "nav_sessions"
  | "nav_tokens"
  | "nav_notifications"
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
  { id: "tokens", labelKey: "nav_tokens", groupKey: "development", Icon: Key, todo: true },
  { id: "notifications", labelKey: "nav_notifications", groupKey: "preferences", Icon: Bell, todo: true },
  { id: "danger", labelKey: "nav_danger", groupKey: "danger_zone", Icon: Trash2, danger: true, todo: true },
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
