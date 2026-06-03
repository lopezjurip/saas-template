import { Toaster } from "@packages/ui-common/shadcn/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { GraphyClientProvider } from "~/components/graphy-provider";
import { ThemeProvider } from "~/components/theme-provider";
import { APP_HOST } from "~/lib/constants";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import "~/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#24232b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://${APP_HOST}`),
  title: { default: "Humane", template: "%s | Humane" },
  description: "HR y Nómina para empresas chilenas",
  applicationName: "Humane",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Humane",
  },
  openGraph: {
    type: "website",
    siteName: "Humane",
  },
};

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;
  const locale = await getServerLocale();

  return (
    <html lang={LOCALE_TO_BCP47[locale]} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GraphyClientProvider>{children}</GraphyClientProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
