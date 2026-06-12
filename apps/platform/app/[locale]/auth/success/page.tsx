import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getRosetta } from "~/hooks/get-rosetta";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";

export default async function AuthSuccessPage(props: PageProps<"/[locale]/auth/success">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const name = SINGLE(sp["name"])?.trim();

  const { t } = await getRosetta(LOCALES, locale);

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col items-center gap-4.5 text-center">
        <span className="inline-flex size-[76px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_8px_hsl(var(--primary)/0.08)]">
          <Check size={36} strokeWidth={2.8} />
        </span>
        <h1 className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-foreground">
          {name ? t("heading_name", { name }) : t("heading")}
        </h1>
        <p className="m-0 max-w-90 text-sm leading-normal text-muted-foreground text-pretty">{t("body")}</p>
        <div className="mt-2 flex w-full max-w-70 flex-col gap-2.5">
          <Button asChild className="h-10 w-full">
            <Link href={ROUTE("/[locale]/home", { locale })}>
              <span>{t("go_home")}</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 w-full text-[12.5px] text-muted-foreground">
            <Link href={ROUTE("/[locale]/home/account/security", { locale })}>{t("review_account")}</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading_name: "¡Listo, {{name}}!",
  heading: "¡Listo!",
  body: "Tu cuenta quedó lista. Ya puedes entrar a tus organizaciones o crear una nueva desde Inicio.",
  go_home: "Ir a Inicio",
  review_account: "Revisar mi cuenta primero",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading_name: "All set, {{name}}!",
  heading: "All set!",
  body: "Your account is ready. You can now join your organizations or create a new one from Home.",
  go_home: "Go to Home",
  review_account: "Review my account first",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading_name: "Pronto, {{name}}!",
  heading: "Pronto!",
  body: "A sua conta está pronta. Já pode entrar nas suas organizações ou criar uma nova a partir do Início.",
  go_home: "Ir para Início",
  review_account: "Verificar a minha conta primeiro",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
