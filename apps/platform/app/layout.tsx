import type { Metadata, Viewport } from "next";
import { GraphyClientProvider } from "~/components/graphy-provider";
import { ThemeProvider } from "~/components/theme-provider";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import "~/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#24232b" },
  ],
};

export const metadata: Metadata = {
  title: "Humane",
  description: "HR y Nómina para empresas chilenas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Humane",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={LOCALE_TO_BCP47[locale]} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GraphyClientProvider>{children}</GraphyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
