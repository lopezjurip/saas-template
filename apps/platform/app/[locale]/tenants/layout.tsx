/**
 * /tenants/* pages own their own AuthCard chrome (same as /auth), so this layout is a
 * passthrough. Kept so the segment can grow shared providers later if needed.
 */
export default function TenantsLayout(props: LayoutProps<"/[locale]/tenants">) {
  return props.children;
}
