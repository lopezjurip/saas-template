import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import type { Metadata } from "next";
import Link from "next/link";
import { ROSETTA } from "~/lib/i18n";
import { checkPhone } from "./actions";

type SearchParams = Promise<{ next?: string; error?: string }>;
type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("title") };
}

export default async function PhoneEntryPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const error = sp["error"];
  const next = sp["next"] ?? "/";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("title")}</h2>
      <form action={checkPhone} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("label")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder={t("placeholder")}
            autoComplete="tel"
            required
            aria-invalid={error === "invalid_phone" ? "true" : undefined}
          />
          {error === "invalid_phone" && <p className="text-destructive text-xs">{t("invalid")}</p>}
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
  title: "Ingresa tu teléfono",
  label: "Teléfono",
  placeholder: "+56 9 ...",
  submit: "Continuar",
  invalid: "Teléfono inválido.",
  back: "← Cambiar método de ingreso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Enter your phone",
  label: "Phone number",
  placeholder: "+1 555 ...",
  submit: "Continue",
  invalid: "Invalid phone.",
  back: "← Change sign-in method",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Digite seu telefone",
  label: "Telefone",
  placeholder: "+55 11 ...",
  submit: "Continuar",
  invalid: "Telefone inválido.",
  back: "← Trocar método de entrada",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
