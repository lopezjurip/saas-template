import { FloatingChrome } from "~/components/floating-chrome";

export default function AdminLayout(props: LayoutProps<"/[locale]/admin">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
