import { FloatingChrome } from "~/components/floating-chrome";

export default function TenantsLayout(props: LayoutProps<"/tenants">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
