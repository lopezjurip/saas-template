import { FloatingChrome } from "~/components/floating-chrome";
import { LocaleProvider } from "~/lib/i18n.client";
import { getServerLocale } from "~/lib/i18n.server";

export default async function AuthLayout(props: LayoutProps<"/auth">) {
  const locale = await getServerLocale();
  return (
    <LocaleProvider locale={locale}>
      <FloatingChrome />
      {props.children}
    </LocaleProvider>
  );
}
