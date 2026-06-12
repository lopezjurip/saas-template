import { Toaster } from "@packages/ui-common/shadcn/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { GraphyClientProvider } from "~/components/graphy-provider";
import { ThemeProvider } from "~/components/theme-provider";
import { APP_HOST } from "~/lib/constants";
import { assertLocale } from "~/lib/i18n.server";
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
  title: { default: "SaaS Template", template: "%s | SaaS Template" },
  description: "Production-ready SaaS template",
  applicationName: "SaaS Template",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SaaS Template",
  },
  openGraph: {
    type: "website",
    siteName: "SaaS Template",
  },
};

export default async function RootLayout(props: LayoutProps<"/[locale]">) {
  const { children } = props;
  const { locale } = await props.params;
  assertLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GraphyClientProvider>{children}</GraphyClientProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
