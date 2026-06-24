import { Building2, ExternalLink, Globe, Home, type LucideIcon, Settings, Shield, Users } from "lucide-react";
import type { Route } from "next";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

/**
 * Unified navigation tree for the tenant shell. Single source of truth that drives BOTH the
 * desktop shadcn sidebar (flat leaves + collapsible groups) AND the mobile drawer — replacing
 * the old flat `BUILD_NAV` plus the separate settings sub-sidebar.
 */
export type NavLeaf = {
  id: string;
  label: string;
  href: Route;
  /** Pre-resolved href string, used for pure (server- or client-safe) active-state matching. */
  path: string;
  Icon: LucideIcon;
  badge?: number;
  /** Index routes (e.g. the org root) match exactly so they don't light up on every nested page. */
  exact?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  Icon: LucideIcon;
  defaultOpen?: boolean;
  children: NavLeaf[];
};

export type NavItem = NavLeaf | NavGroup;

export type NavLabels = {
  navHome: string;
  navOrganization: string;
  navCompany: string;
  navGeneral: string;
  navMembers: string;
  navExternalAccess: string;
  navDomains: string;
  navSso: string;
};

/**
 * Narrows a {@link NavItem} to a {@link NavGroup} (presence of `children`).
 * @example if (IS_NAV_GROUP(item)) item.children.forEach(...)
 */
export function IS_NAV_GROUP(item: NavItem): item is NavGroup {
  return "children" in item;
}

/**
 * Builds the tenant navigation tree. Locale is no longer a route segment, so it is not threaded.
 * @example BUILD_NAV_TREE("acme", 42, labels) // [Home leaf, Settings group → General/Members/…]
 */
export function BUILD_NAV_TREE(tenant_slug: string, organization_id: number, labels: NavLabels): NavItem[] {
  const params = { tenant_slug, organization_id };
  const home = ROUTE("/t/[tenant_slug]/[organization_id]", params);
  const general = ROUTE("/t/[tenant_slug]/[organization_id]/settings/general", params);
  const members = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members", params);
  const external = ROUTE("/t/[tenant_slug]/[organization_id]/settings/external-access", params);
  const tenantGeneral = ROUTE("/t/[tenant_slug]/[organization_id]/settings/tenant/general", params);
  const domains = ROUTE("/t/[tenant_slug]/[organization_id]/settings/tenant/domains", params);
  const sso = ROUTE("/t/[tenant_slug]/[organization_id]/settings/tenant/sso", params);

  return [
    { id: "home", label: labels.navHome, href: home, path: ROUTE_HREF(home), Icon: Home, exact: true },
    {
      id: "organization",
      label: labels.navOrganization,
      Icon: Settings,
      children: [
        { id: "general", label: labels.navGeneral, href: general, path: ROUTE_HREF(general), Icon: Settings },
        { id: "members", label: labels.navMembers, href: members, path: ROUTE_HREF(members), Icon: Users },
        {
          id: "external",
          label: labels.navExternalAccess,
          href: external,
          path: ROUTE_HREF(external),
          Icon: ExternalLink,
        },
      ],
    },
    {
      id: "company",
      label: labels.navCompany,
      Icon: Building2,
      children: [
        {
          id: "tenant-general",
          label: labels.navGeneral,
          href: tenantGeneral,
          path: ROUTE_HREF(tenantGeneral),
          Icon: Building2,
        },
        { id: "domains", label: labels.navDomains, href: domains, path: ROUTE_HREF(domains), Icon: Globe },
        { id: "sso", label: labels.navSso, href: sso, path: ROUTE_HREF(sso), Icon: Shield },
      ],
    },
  ];
}

/**
 * Whether a leaf is the active route. Exact match for index routes, prefix match otherwise.
 * @example LEAF_IS_ACTIVE("/t/acme/42/settings/members", membersLeaf) // true
 */
export function LEAF_IS_ACTIVE(pathname: string, leaf: NavLeaf): boolean {
  if (leaf.exact) {
    return pathname === leaf.path || pathname === `${leaf.path}/`;
  }
  return pathname === leaf.path || pathname.startsWith(`${leaf.path}/`);
}

/**
 * Whether any leaf in a group is active (drives the collapsible's default-open state).
 * @example GROUP_CONTAINS_ACTIVE(pathname, settingsGroup) // true on any /settings/* page
 */
export function GROUP_CONTAINS_ACTIVE(pathname: string, group: NavGroup): boolean {
  return group.children.some((leaf) => LEAF_IS_ACTIVE(pathname, leaf));
}

/**
 * Picks the single active leaf id (longest matching path wins), for highlight.
 * @example PICK_ACTIVE_LEAF_ID(items, "/t/acme/42/settings/members") // "members"
 */
export function PICK_ACTIVE_LEAF_ID(items: NavItem[], pathname: string): string | null {
  let bestId: string | null = null;
  let bestLength = -1;
  for (const item of items) {
    const leaves = IS_NAV_GROUP(item) ? item.children : [item];
    for (const leaf of leaves) {
      if (LEAF_IS_ACTIVE(pathname, leaf) && leaf.path.length > bestLength) {
        bestId = leaf.id;
        bestLength = leaf.path.length;
      }
    }
  }
  return bestId;
}
