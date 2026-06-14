import { Toaster } from "@packages/ui-common/shadcn/components/ui/sonner";
import { TooltipProvider } from "@packages/ui-common/shadcn/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { GraphyClientProvider } from "~/components/graphy-provider";
import { PostHogIdentify } from "~/components/posthog-identify";
import { PostHogProvider } from "~/components/posthog-provider";
import { PwaRegister } from "~/components/pwa-register";
import { ThemeProvider } from "~/components/theme-provider";
import { APP_URL } from "~/lib/constants";
import { LocaleProvider } from "~/lib/i18n.client";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return {
    metadataBase: APP_URL,
    title: { default: t("title"), template: t("template") },
    description: t("description"),
    applicationName: t("title"),
    manifest: "/manifest.webmanifest",
    formatDetection: { telephone: false, email: false, address: false },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: t("title"),
    },
    openGraph: {
      type: "website",
      siteName: t("title"),
    },
  };
}

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;
  const locale = await getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <LocaleProvider locale={locale}>
          <PostHogProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <TooltipProvider delayDuration={0}>
                <GraphyClientProvider>
                  <PostHogIdentify />
                  {children}
                </GraphyClientProvider>
                <Toaster richColors closeButton />
              </TooltipProvider>
            </ThemeProvider>
          </PostHogProvider>
        </LocaleProvider>
        <PwaRegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

const LOCALE_ES = {
  title: "SaaS Template",
  template: "%s | SaaS Template",
  description: "Plantilla SaaS lista para producción",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "SaaS Template",
  template: "%s | SaaS Template",
  description: "Production-ready SaaS template",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "SaaS Template",
  template: "%s | SaaS Template",
  description: "Template SaaS pronto para produção",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
