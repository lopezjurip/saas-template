import { FloatingChrome } from "~/components/floating-chrome";
import { LocaleProvider } from "~/lib/i18n.client";

export default async function AuthLayout(props: LayoutProps<"/[locale]/auth">) {
  const { locale } = await props.params;
  return (
    <LocaleProvider locale={locale}>
      <FloatingChrome />
      {props.children}
    </LocaleProvider>
  );
}
