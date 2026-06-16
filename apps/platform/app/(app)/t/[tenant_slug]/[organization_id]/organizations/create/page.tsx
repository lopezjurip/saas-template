import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { CreateOrganizationForm } from "./create-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("heading") };
}

export default async function CreateOrganizationPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/organizations/create">,
) {
  const { tenant_slug, organization_id } = await props.params;
  const { t } = await getRosetta(LOCALES);

  const { data } = await getViewerTenantBySlug(tenant_slug);
  const tenant = data?.["tenant"];
  if (!tenant) notFound();

  const backHref = ROUTE("/t/[tenant_slug]/[organization_id]", { tenant_slug, organization_id });

  return (
    <div className="flex h-full w-full items-start justify-center overflow-y-auto px-5 py-10">
      <div className="flex w-full max-w-110 flex-col gap-5 rounded-2xl border bg-card p-6 text-card-foreground shadow-card">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
            <Building2 size={20} strokeWidth={2.25} />
          </span>
          <h1 className="m-0 mt-1 text-xl/normal font-semibold tracking-[-0.01em] text-foreground">{t("heading")}</h1>
          <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">
            {t("subtitle", { tenant: tenant["tenantName"] })}
          </p>
        </div>
        <CreateOrganizationForm tenantId={tenant["tenantId"]} tenantSlug={tenant_slug} backHref={backHref} />
      </div>
    </div>
  );
}

const LOCALE_ES = {
  heading: "Crea una organización",
  subtitle: "Una nueva unidad operativa dentro de {{tenant}}. Tú quedas como administrador.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create an organization",
  subtitle: "A new operating unit inside {{tenant}}. You'll be its administrator.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Crie uma organização",
  subtitle: "Uma nova unidade operacional dentro de {{tenant}}. Você ficará como administrador.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
