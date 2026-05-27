import { createServerClient } from "@packages/supabase/client.server";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${base}/${safeLocale}`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}`])),
        "x-default": `${base}/${DEFAULT_LOCALE}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title: t("title"),
      description: t("description"),
      siteName: "Humane",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        {user ? (
          <CardContent>
            <p className="text-sm">{t("user.greeting", { email: user.email })}</p>
          </CardContent>
        ) : null}
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={user ? `/${locale}/dashboard` : `/${locale}/auth`}>
              {user ? t("cta.dashboard") : t("cta.signin")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

const LOCALE_ES = {
  title: "Humane",
  description: "HR y Nómina para empresas chilenas",
  "user.greeting": "Hola, {{email}}",
  "cta.dashboard": "Ir al dashboard",
  "cta.signin": "Ir a la plataforma",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Humane",
  description: "HR & Payroll for Chilean companies",
  "user.greeting": "Hello, {{email}}",
  "cta.dashboard": "Go to dashboard",
  "cta.signin": "Sign in",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Humane",
  description: "RH e Folha de Pagamento para empresas chilenas",
  "user.greeting": "Olá, {{email}}",
  "cta.dashboard": "Ir para o painel",
  "cta.signin": "Entrar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
