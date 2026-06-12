import { FloatingChrome } from "~/components/floating-chrome";
import { LocaleProvider } from "~/components/use-locale";

export default async function AuthLayout(props: LayoutProps<"/[locale]/auth">) {
  const { locale } = await props.params;
  return (
    <LocaleProvider locale={locale}>
      <FloatingChrome />
      {props.children}
    </LocaleProvider>
  );
}
