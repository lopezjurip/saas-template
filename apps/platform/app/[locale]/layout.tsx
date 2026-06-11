import { LocaleProvider } from "~/components/locale-provider";
import { SUPPORTED_LOCALES } from "~/lib/i18n";
import { assertLocale } from "~/lib/i18n.server";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  assertLocale(locale);

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
