import { RosettaImpl } from "@packages/rosetta/rosetta";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { checkPhone } from "./actions";

const LOCALE_ES = {
  title: "Ingresa tu teléfono",
  label: "Teléfono",
  placeholder: "+56 9 ...",
  submit: "Continuar",
  invalid: "Teléfono inválido.",
  back: "← Cambiar método de ingreso",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Enter your phone",
    label: "Phone number",
    placeholder: "+1 555 ...",
    submit: "Continue",
    invalid: "Invalid phone.",
    back: "← Change sign-in method",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Digite seu telefone",
    label: "Telefone",
    placeholder: "+55 11 ...",
    submit: "Continuar",
    invalid: "Telefone inválido.",
    back: "← Trocar método de entrada",
  } satisfies typeof LOCALE_ES,
};

type SearchParams = Promise<{ next?: string; error?: string }>;
type Params = Promise<{ locale: string }>;

export default async function PhoneEntryPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
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
