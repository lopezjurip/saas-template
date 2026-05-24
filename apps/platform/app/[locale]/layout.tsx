import { notFound } from "next/navigation";
import { LocaleProvider } from "~/components/locale-provider";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
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
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LocaleToggle />
        <ThemeToggle />
      </div>
      {children}
    </LocaleProvider>
  );
}
