import { RosettaImpl } from "@packages/rosetta/rosetta";
import { Logo } from "@packages/ui-common/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  title: "Documentos legales",
  subtitle: "Términos y políticas de Humane",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Legal documents",
    subtitle: "Humane's terms and policies",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Documentos legais",
    subtitle: "Termos e políticas da Humane",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  return (
    <main className="bg-muted flex min-h-svh justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-col items-center text-center">
          <Link href={`/${locale}`} aria-label="Inicio" className="inline-block transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="prose prose-sm max-w-none py-6">{children}</CardContent>
      </Card>
    </main>
  );
}
