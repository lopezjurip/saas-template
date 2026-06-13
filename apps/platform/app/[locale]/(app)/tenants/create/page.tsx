import { Logo } from "@packages/ui-common/logo";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { CreateTenantForm } from "./create-form";

export async function generateMetadata(props: PageProps<"/[locale]/tenants/create">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("heading") };
}

export default async function CreateTenantPage(props: PageProps<"/[locale]/tenants/create">) {
  const { t, locale } = await getRosetta(LOCALES);
  return (
    <div
      className="relative flex min-h-dvh w-full items-center justify-center px-5 py-10"
      style={{
        background: "radial-gradient(ellipse at top, hsl(var(--muted) / 0.6), transparent 60%), hsl(var(--background))",
      }}
    >
      <Link
        href={ROUTE("/[locale]/home", { locale })}
        aria-label="Inicio"
        className="absolute left-6 top-5 transition-opacity hover:opacity-80"
      >
        <Logo />
      </Link>

      <div className="flex w-full max-w-110 flex-col gap-5 rounded-2xl border bg-card p-6 text-card-foreground shadow-card">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
            <Building2 size={20} strokeWidth={2.25} />
          </span>
          <h1 className="m-0 mt-1 text-xl/normal font-semibold tracking-[-0.01em] text-foreground">{t("heading")}</h1>
          <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{t("subtitle")}</p>
        </div>
        <CreateTenantForm />
      </div>
    </div>
  );
}

const LOCALE_ES = {
  heading: "Crea tu empresa",
  subtitle: "Un espacio para tu equipo. Podrás invitar personas y configurar permisos en cuanto entres.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create your company",
  subtitle: "A space for your team. You can invite people and set permissions as soon as you're in.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Crie sua empresa",
  subtitle: "Um espaço para sua equipe. Você poderá convidar pessoas e configurar permissões assim que entrar.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
