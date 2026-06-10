import { FloatingChrome } from "~/components/floating-chrome";

export default function AgencyLayout(props: LayoutProps<"/[locale]/a">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
