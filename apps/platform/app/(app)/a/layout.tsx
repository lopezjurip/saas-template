import { FloatingChrome } from "~/components/floating-chrome";

export default function AgencyLayout(props: LayoutProps<"/a">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
