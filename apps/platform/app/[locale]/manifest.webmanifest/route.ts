import { assertLocale } from "~/lib/i18n.server";

export async function GET(_req: Request, props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  assertLocale(locale);
  return Response.json({
    name: "SaaS Template",
    short_name: "SaaS Template",
    description: "Production-ready SaaS template",
    start_url: `/${locale}`,
    display: "standalone",
    lang: locale,
    background_color: "#ffffff",
    theme_color: "#1d2138",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  });
}
