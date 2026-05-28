import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import type { Metadata } from "next";
import Link from "next/link";
import { ROSETTA } from "~/lib/i18n";
import { checkEmail } from "./actions";

type SearchParams = Promise<{ next?: string; error?: string }>;
type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("title") };
}

export default async function EmailEntryPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const error = sp["error"];
  const next = sp["next"] ?? "/";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("title")}</h2>
      <form action={checkEmail} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("label")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("placeholder")}
            autoComplete="email"
            required
            aria-invalid={error === "invalid_email" ? "true" : undefined}
          />
          {error === "invalid_email" && <p className="text-destructive text-xs">{t("invalid")}</p>}
        </div>
        <Button type="submit" className="w-full">
          {t("submit")}
        </Button>
      </form>
      <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
        {t("back")}
      </Link>
    </div>
  );
}

const LOCALE_ES = {
  title: "Ingresa tu email",
  label: "Correo electrónico",
  placeholder: "tu@empresa.cl",
  submit: "Continuar",
  invalid: "Correo inválido.",
  back: "← Cambiar método de ingreso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Enter your email",
  label: "Email address",
  placeholder: "you@company.com",
  submit: "Continue",
  invalid: "Invalid email.",
  back: "← Change sign-in method",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Digite seu e-mail",
  label: "Endereço de e-mail",
  placeholder: "voce@empresa.com",
  submit: "Continuar",
  invalid: "E-mail inválido.",
  back: "← Trocar método de entrada",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
