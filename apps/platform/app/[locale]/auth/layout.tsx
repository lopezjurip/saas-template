import { FloatingChrome } from "~/components/floating-chrome";

export default function AuthLayout(props: LayoutProps<"/[locale]/auth">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
