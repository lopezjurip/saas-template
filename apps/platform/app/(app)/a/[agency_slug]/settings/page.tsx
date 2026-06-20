import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencySettingsPage(props: PageProps<"/a/[agency_slug]/settings">) {
  const { agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);

  // viewer_agency_by_slug is RLS-scoped — returns the agency only for an accepted member.
  const supabase = await createSupabaseServerClient();
  const { data: agency } = await supabase.rpc("viewer_agency_by_slug", { agency_slug }).maybeSingle();
  if (!agency) notFound();

  const logoResult = await supabase
    .from("storage_agencies")
    .select("src")
    .eq("agency_id", agency["agency_id"])
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const logoSrc = logoResult.data?.["src"]
    ? new URL(logoResult.data["src"], process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString()
    : null;

  return (
    <div className="bg-muted dark:bg-background min-h-svh w-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
        <Link
          href={ROUTE("/a/[agency_slug]", { agency_slug })}
          className="text-muted-foreground hover:text-foreground -ml-1.5 inline-flex w-fit items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft size={14} /> {t("back")}
        </Link>
        <header className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
            {agency["agency_name"]} · {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
        </header>

        <section className="border-border bg-background flex flex-col gap-4 rounded-xl border p-5">
          <EntityLogoControls
            bucket="agencies"
            ownerKey={String(agency["agency_id"])}
            name={agency["agency_name"]}
            src={logoSrc}
            shape="square"
            helpText={t("logo_hint")}
          />
        </section>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  page_title: "Agencia",
  eyebrow: "Agencia",
  title: "Ajustes de la agencia",
  subtitle: "El logo de la agencia. Aparece en el selector de inicio y en la consola.",
  logo_hint: "Usa una imagen cuadrada. Si no subes una, mostramos las iniciales.",
  back: "Volver a la consola",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency",
  eyebrow: "Agency",
  title: "Agency settings",
  subtitle: "The agency logo. It shows in the home picker and the console.",
  logo_hint: "Use a square image. If you don't upload one, we show the initials.",
  back: "Back to the console",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Agência",
  eyebrow: "Agência",
  title: "Configurações da agência",
  subtitle: "O logo da agência. Aparece no seletor inicial e no console.",
  logo_hint: "Use uma imagem quadrada. Se você não enviar uma, mostramos as iniciais.",
  back: "Voltar ao console",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
