import { getRosettaAssert } from "~/lib/i18n.server";

export async function GET(req: Request, props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { t } = getRosettaAssert(LOCALES, locale);
  return Response.json({
    name: t("name"),
    short_name: t("short_name"),
    description: t("description"),
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

const LOCALE_ES = {
  name: "SaaS Template",
  short_name: "SaaS Template",
  description: "Plantilla SaaS lista para producción",
};

const LOCALE_EN: typeof LOCALE_ES = {
  name: "SaaS Template",
  short_name: "SaaS Template",
  description: "Production-ready SaaS template",
};

const LOCALE_PT: typeof LOCALE_ES = {
  name: "SaaS Template",
  short_name: "SaaS Template",
  description: "Template SaaS pronto para produção",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
