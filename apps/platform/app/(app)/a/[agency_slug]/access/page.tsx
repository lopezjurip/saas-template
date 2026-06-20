import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { Building2, Eye, Globe } from "lucide-react";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";

type AccessOrg = { organization_id: number; organization_name: string; organization_slug: string | null };

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyAccessPage(props: PageProps<"/a/[agency_slug]/access">) {
  const { agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);

  // Re-fetch the cached, RLS-scoped agency row (the layout already gated access).
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  // RLS `agencies_organizations_grants select` already scopes grants to the
  // viewer's agencies, so the authenticated client suffices — no service role.
  const supabase = await createSupabaseServerClient();
  const grantsRes = await supabase
    .from("agencies_organizations_grants")
    .select("organization_id, permission_id, organizations(organization_name, organization_slug)")
    .eq("agency_id", agency["agencyId"]);

  const grants = grantsRes.data ?? [];
  const isGlobal = grants.some((g) => g["organization_id"] === null && g["permission_id"] === "*");
  const orgs: AccessOrg[] = grants
    .filter((g) => g["organization_id"] !== null)
    .map((g) => ({
      organization_id: g["organization_id"] as number,
      organization_name: g["organizations"]?.["organization_name"] ?? String(g["organization_id"]),
      organization_slug: g["organizations"]?.["organization_slug"] ?? null,
    }));

  return (
    <div className="px-4 py-5 pb-8 @3xl:px-6 @3xl:py-6 @3xl:pb-10">
      <div className="mx-auto flex w-full max-w-205 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground m-0 text-lg font-semibold tracking-tight">{t("access_title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-xs leading-normal text-pretty">
            {t("access_desc")}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
            <span className="text-muted-foreground mt-px shrink-0">
              <Eye size={15} />
            </span>
            <span className="text-muted-foreground text-xs leading-normal text-pretty">{t("access_banner")}</span>
          </div>

          {isGlobal ? (
            <section className="flex flex-col gap-2.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {t("access_scope")}
              </span>
              <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/6 px-3.5 py-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <Globe size={17} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{t("access_global_title")}</span>
                    <span className="text-muted-foreground/80 font-mono text-tiny">org = NULL</span>
                  </div>
                  <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">
                    {t("access_global_desc")}
                  </span>
                  <div className="mt-0.5">
                    <AccessPill global label={t("read_access")} />
                  </div>
                </div>
              </div>
            </section>
          ) : orgs.length === 0 ? (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
              <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
                <Building2 size={22} />
              </span>
              <div className="flex max-w-[42ch] flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">{t("access_empty_title")}</span>
                <span className="text-xs leading-normal text-pretty">{t("access_empty_desc")}</span>
              </div>
            </div>
          ) : (
            <section className="flex flex-col gap-2.5">
              <div className="flex min-h-7 items-center justify-between gap-2.5">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t("access_group")}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">{orgs.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {orgs.map((org) => (
                  <div
                    key={org.organization_id}
                    className="border-border bg-background grid items-start gap-3 rounded-lg border px-3.5 py-3"
                    style={{ gridTemplateColumns: "36px 1fr" }}
                  >
                    <span className="bg-muted text-foreground border-border inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold">
                      {INITIALS_OF(org.organization_name)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-sm font-medium">{org.organization_name}</span>
                        {org.organization_slug ? (
                          <code className="text-muted-foreground/80 font-mono text-tiny">{org.organization_slug}</code>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <AccessPill global={false} label={t("read_access")} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline read-access pill scoped to the access page. */
function AccessPill({ global, label }: { global: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium leading-[1.3]",
        global
          ? "border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "border-border text-foreground bg-background border",
      )}
    >
      <Eye size={10.5} /> {label}
    </span>
  );
}

const LOCALE_ES = {
  page_title: "Accesos recibidos",
  access_title: "Accesos recibidos",
  access_desc: "Lo que cada organización compartió con tu agencia. Solo lectura — no se edita aquí.",
  read_access: "Acceso de lectura",
  access_banner:
    "No puedes cambiar estos accesos desde aquí. Cada organización decide qué te comparte — si necesitas más, pídeselo a su administrador. Todo lo que ves es de solo lectura.",
  access_scope: "Alcance",
  access_global_title: "Todas las organizaciones",
  access_global_desc:
    "Como equipo interno, tienes acceso global de solo lectura a todos los tenants y organizaciones — actuales y futuros.",
  access_empty_title: "Ninguna organización te dio acceso",
  access_empty_desc:
    "Cuando el administrador de una organización habilite a tu agencia, aparecerá aquí con acceso de lectura.",
  access_group: "Organizaciones que te dieron acceso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Received access",
  access_title: "Received access",
  access_desc: "What each organization shared with your agency. Read-only — not edited here.",
  read_access: "Read access",
  access_banner:
    "You can't change this access here. Each organization decides what to share with you — if you need more, ask its admin. Everything you see is read-only.",
  access_scope: "Scope",
  access_global_title: "All organizations",
  access_global_desc:
    "As an internal team, you have global read-only access to every tenant and organization — current and future.",
  access_empty_title: "No organization gave you access",
  access_empty_desc: "When an organization's admin enables your agency, it will appear here with read access.",
  access_group: "Organizations that gave you access",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Acessos recebidos",
  access_title: "Acessos recebidos",
  access_desc: "O que cada organização compartilhou com sua agência. Somente leitura — não se edita aqui.",
  read_access: "Acesso de leitura",
  access_banner:
    "Você não pode alterar esses acessos aqui. Cada organização decide o que compartilhar com você — se precisar de mais, peça ao administrador dela. Tudo o que você vê é somente leitura.",
  access_scope: "Alcance",
  access_global_title: "Todas as organizações",
  access_global_desc:
    "Como equipe interna, você tem acesso global somente leitura a todos os tenants e organizações — atuais e futuros.",
  access_empty_title: "Nenhuma organização lhe deu acesso",
  access_empty_desc:
    "Quando o administrador de uma organização habilitar sua agência, ela aparecerá aqui com acesso de leitura.",
  access_group: "Organizações que lhe deram acesso",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
