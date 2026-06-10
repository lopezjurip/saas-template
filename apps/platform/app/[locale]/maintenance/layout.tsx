import { FloatingChrome } from "~/components/floating-chrome";

export default function MaintenanceLayout(props: LayoutProps<"/[locale]/maintenance">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
