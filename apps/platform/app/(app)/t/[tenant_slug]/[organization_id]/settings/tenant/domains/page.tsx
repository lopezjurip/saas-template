import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Check, Globe, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";

type DomainRow = { domain: string; verified: boolean; meta: "domain_members" | "domain_dns" };

/** Mock domains — `public.tenant_domains` is staged in the schema but not yet wired (phase 2). */
const DOMAINS: DomainRow[] = /*#__PURE__*/ [
  { domain: "empresa.com", verified: true, meta: "domain_members" },
  { domain: "studio.cl", verified: false, meta: "domain_dns" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function TenantDomainsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/tenant/domains">,
) {
  const { tenant_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          {tenant["tenantName"]} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            {t("domains")}
          </span>
          <Button variant="outline" size="sm">
            <Plus size={13} /> {t("add_domain")}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {DOMAINS.map((row) => (
            <div
              key={row.domain}
              className={cn(
                "border-border bg-background grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3",
                !row.verified && "bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "bg-muted text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                  !row.verified && "text-muted-foreground border-border border",
                )}
              >
                <Globe size={16} />
              </span>
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
                  {row.domain}
                  {row.verified ? (
                    <Badge className="gap-1 border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <Check size={10} strokeWidth={3} /> {t("verified")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t("pending_dns")}
                    </Badge>
                  )}
                </span>
                <span className="text-muted-foreground text-xs">{t(row.meta)}</span>
              </div>
              {row.verified ? (
                <Button variant="ghost" size="sm" className="text-destructive">
                  {t("remove")}
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  {t("view_record")}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const LOCALE_ES = {
  page_title: "Dominios",
  eyebrow: "Empresa",
  title: "Dominios",
  subtitle: "Los dominios verificados de la empresa. Próximamente podrás verificarlos y auto-unir personas por correo.",
  domains: "Dominios",
  add_domain: "Agregar dominio",
  verified: "Verificado",
  pending_dns: "Pendiente · DNS",
  domain_members: "12 personas usan este dominio",
  domain_dns: "Agrega el registro TXT para verificar",
  view_record: "Ver registro",
  remove: "Quitar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Domains",
  eyebrow: "Company",
  title: "Domains",
  subtitle: "The company's verified domains. Soon you'll be able to verify them and auto-join people by email.",
  domains: "Domains",
  add_domain: "Add domain",
  verified: "Verified",
  pending_dns: "Pending · DNS",
  domain_members: "12 people use this domain",
  domain_dns: "Add the TXT record to verify",
  view_record: "View record",
  remove: "Remove",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Domínios",
  eyebrow: "Empresa",
  title: "Domínios",
  subtitle:
    "Os domínios verificados da empresa. Em breve você poderá verificá-los e auto-adicionar pessoas por e-mail.",
  domains: "Domínios",
  add_domain: "Adicionar domínio",
  verified: "Verificado",
  pending_dns: "Pendente · DNS",
  domain_members: "12 pessoas usam este domínio",
  domain_dns: "Adicione o registro TXT para verificar",
  view_record: "Ver registro",
  remove: "Remover",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
