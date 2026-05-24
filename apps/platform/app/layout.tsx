import type { Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Humane",
  description: "HR y Nómina para empresas chilenas",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={LOCALE_TO_BCP47[locale]} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
