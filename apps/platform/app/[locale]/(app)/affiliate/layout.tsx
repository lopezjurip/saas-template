import { FloatingChrome } from "~/components/floating-chrome";

export default function AffiliateLayout(props: LayoutProps<"/[locale]/affiliate">) {
  return (
    <>
      <FloatingChrome />
      {props.children}
    </>
  );
}
