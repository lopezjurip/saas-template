/**
 * Settings pages render inside the tenant shell. The settings navigation now lives in the main
 * sidebar as a collapsible tree (see components/shell/nav-tree.ts) — there is no separate
 * sub-sidebar here anymore. This layout only provides the content canvas.
 */
export default function SettingsLayout({ children }: LayoutProps<"/t/[tenant_slug]/[organization_id]/settings">) {
  // Light: muted canvas makes the bg-background cards read as elevated. Dark inverts that
  // lightness (muted > background), so fall back to the base bg — cards delineate by border.
  return <main className="bg-muted dark:bg-background h-full flex-1 overflow-y-auto">{children}</main>;
}
