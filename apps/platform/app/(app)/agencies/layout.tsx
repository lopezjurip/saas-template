import { FloatingChrome } from "~/components/floating-chrome";

export default function AgenciesLayout(props: LayoutProps<"/agencies">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
