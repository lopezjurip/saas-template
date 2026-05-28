import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import type { Metadata } from "next";
import Link from "next/link";
import { OAUTH_PROVIDERS } from "~/app/[locale]/auth/providers";
import { ROSETTA } from "~/lib/i18n";
import { MethodButton } from "./_components/method-button";
import { signInWithOAuth } from "./actions";

type SearchParams = Promise<{ next?: string; error?: string }>;
type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("meta_title") };
}

export default async function AuthEntryPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const next = sp["next"] ?? "/";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <MethodButton
          method="email"
          href={`/${locale}/auth/email?next=${encodeURIComponent(next)}`}
          label={t("email")}
          recentLabel={t("recent")}
          variant="default"
        />
        <MethodButton
          method="phone"
          href={`/${locale}/auth/phone?next=${encodeURIComponent(next)}`}
          label={t("phone")}
          recentLabel={t("recent")}
        />
        <MethodButton
          method="document"
          href={`/${locale}/auth/document?next=${encodeURIComponent(next)}`}
          label={t("document")}
          recentLabel={t("recent")}
        />
      </div>

      {OAUTH_PROVIDERS.length > 0 && (
        <>
          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
              {t("divider_or")}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {OAUTH_PROVIDERS.map((provider) => (
              <form key={provider.id} action={signInWithOAuth}>
                <input type="hidden" name="provider" value={provider.id} />
                <input type="hidden" name="next" value={next} />
                <Button type="submit" variant="outline" className="w-full">
                  {t("oauth_with", { provider: provider.label })}
                </Button>
              </form>
            ))}
          </div>
        </>
      )}

      <p className="text-muted-foreground text-center text-xs">
        <Link href={`/${locale}/legal`} className="hover:underline">
          {t("terms")}
        </Link>
      </p>
    </div>
  );
}

const LOCALE_ES = {
  meta_title: "Iniciar sesión",
  email: "Continuar con email",
  phone: "Continuar con teléfono",
  document: "Continuar con documento",
  oauth_with: "Continuar con {{provider}}",
  divider_or: "o",
  terms: "Al continuar aceptas los términos y la política de privacidad.",
  recent: "Reciente",
};

const LOCALE_EN: typeof LOCALE_ES = {
  meta_title: "Sign in",
  email: "Continue with email",
  phone: "Continue with phone",
  document: "Continue with document",
  oauth_with: "Continue with {{provider}}",
  divider_or: "or",
  terms: "By continuing you accept the terms and privacy policy.",
  recent: "Recent",
};

const LOCALE_PT: typeof LOCALE_ES = {
  meta_title: "Entrar",
  email: "Continuar com e-mail",
  phone: "Continuar com telefone",
  document: "Continuar com documento",
  oauth_with: "Continuar com {{provider}}",
  divider_or: "ou",
  terms: "Ao continuar você aceita os termos e a política de privacidade.",
  recent: "Recente",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
