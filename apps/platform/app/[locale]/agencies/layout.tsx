import { FloatingChrome } from "~/components/floating-chrome";

export default function AgenciesLayout(props: LayoutProps<"/[locale]/agencies">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
