import { FloatingChrome } from "~/components/floating-chrome";

export default function MaintenanceLayout(props: LayoutProps<"/maintenance">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
