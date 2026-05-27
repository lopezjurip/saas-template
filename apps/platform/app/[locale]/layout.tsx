import { notFound } from "next/navigation";
import { FloatingChrome } from "~/components/floating-chrome";
import { LocaleProvider } from "~/components/locale-provider";
import { IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";

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
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  return (
    <LocaleProvider locale={LOCALE_TO_BCP47[locale]}>
      <FloatingChrome />
      {children}
    </LocaleProvider>
  );
}
