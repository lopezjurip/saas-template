import { LocaleProvider } from "~/components/locale-provider";
import { LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";
import { assertLocale } from "~/lib/i18n.server";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  assertLocale(locale);

  return <LocaleProvider locale={LOCALE_TO_BCP47[locale]}>{children}</LocaleProvider>;
}
