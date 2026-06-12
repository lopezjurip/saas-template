import { FloatingChrome } from "~/components/floating-chrome";

export default function TenantsLayout(props: LayoutProps<"/[locale]/tenants">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
