import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { BadgeCheck, Building2, Eye, Globe, Hourglass, ShieldCheck, UserPlus, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRosetta } from "~/hooks/get-rosetta";
import { AFFILIATION_STATE, type AffiliationState, INITIALS_OF } from "~/lib/agencies";
import { assertLocale } from "~/lib/i18n.server";

export async function generateMetadata(props: PageProps<"/[locale]/admin/agencies/[slug]">): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const admin = createServiceRoleClient();
  const { data } = await admin.from("agencies").select("agency_name").eq("agency_slug", slug).maybeSingle();
  return { title: data?.agency_name ?? t("page_title") };
}

export default async function AdminAgencyDetailPage(props: PageProps<"/[locale]/admin/agencies/[slug]">) {
  const { locale, slug } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const admin = createServiceRoleClient();

  const agencyRes = await admin
    .from("agencies")
    .select("agency_id, agency_name, agency_slug, agency_disabled_at")
    .eq("agency_slug", slug)
    .maybeSingle();
  if (!agencyRes.data) notFound();
  const agency = agencyRes.data;

  const [membershipsRes, grantsRes, usersRes] = await Promise.all([
    admin
      .from("agency_memberships")
      .select(
        "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at, agency_membership_created_at, profiles(profile_name_full)",
      )
      .eq("agency_id", agency.agency_id)
      .order("agency_membership_created_at", { ascending: true }),
    admin
      .from("agencies_organizations_grants")
      .select("agency_id, organization_id, permission_id, organizations(organization_name, organization_slug)")
      .eq("agency_id", agency.agency_id),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const emailByProfileId = new Map<string, string | null>();
  if (!usersRes.error) {
    for (const u of usersRes.data.users) emailByProfileId.set(u.id, u.email ?? null);
  }

  const affiliates = (membershipsRes.data ?? []).map((m) => ({
    agency_membership_id: m.agency_membership_id,
    state: AFFILIATION_STATE(m),
    name: m.profiles?.profile_name_full ?? emailByProfileId.get(m.profile_id) ?? m.profile_id.slice(0, 8),
    email: emailByProfileId.get(m.profile_id) ?? null,
  }));
  const activeCount = affiliates.filter((a) => a.state === "accepted").length;

  const grants = grantsRes.data ?? [];
  const globalGrant = grants.find((g) => g.organization_id === null && g.permission_id === "*");
  const orgGrants = grants.filter((g) => g.organization_id !== null);
  const isGlobal = Boolean(globalGrant);

  const base = `/${locale}/admin/agencies`;

  return (
    <div className="@container mx-auto flex w-full max-w-3xl flex-col gap-7 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <Link href={base}>← {t("back")}</Link>
        </Button>
        <Button asChild size="sm" className="h-9">
          <Link href={`${base}/${agency.agency_slug}/affiliates/new`}>
            <UserPlus size={15} strokeWidth={2} /> {t("invite")}
          </Link>
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
          {t("eyebrow")}
        </span>
        <div className="flex items-start gap-3.5">
          <span className="border-border bg-muted text-foreground inline-flex size-12 shrink-0 items-center justify-center rounded-lg border">
            <Building2 size={22} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground m-0 text-[20px] font-semibold tracking-[-0.02em]">{agency.agency_name}</h1>
              <ScopeBadge
                global={isGlobal}
                label={isGlobal ? t("scope_global") : t("scope_orgs", { count: orgGrants.length })}
              />
            </div>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[12.5px]">
              <code className="font-mono text-[11px]">{agency.agency_slug}</code>
              {agency.agency_disabled_at ? (
                <>
                  <span className="opacity-40">·</span>
                  <span>{t("disabled")}</span>
                </>
              ) : null}
            </span>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("affiliates")}
          </span>
          <span className="text-muted-foreground text-[11.5px] tabular-nums">
            {t("affiliates_count", { active: activeCount, total: affiliates.length })}
          </span>
        </div>
        {affiliates.length === 0 ? (
          <p className="text-muted-foreground px-1 text-[12.5px]">{t("affiliates_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {affiliates.map((aff) => (
              <AffiliateRow
                key={aff.agency_membership_id}
                name={aff.name}
                email={aff.email}
                state={aff.state}
                stateLabel={t(`state_${aff.state}`)}
              />
            ))}
          </div>
        )}
        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-[11.5px] leading-[1.5]">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <ShieldCheck size={13} />
          </span>
          <span className="[text-wrap:pretty]">{t("affiliates_note")}</span>
        </p>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">{t("grants")}</span>
          {!isGlobal ? (
            <span className="text-muted-foreground text-[11.5px] tabular-nums">
              {t("scope_orgs", { count: orgGrants.length })}
            </span>
          ) : null}
        </div>
        {isGlobal ? (
          <GlobalGrantCard title={t("global_title")} desc={t("global_desc")} accessLabel={t("read_access")} />
        ) : orgGrants.length === 0 ? (
          <p className="text-muted-foreground px-1 text-[12.5px]">{t("grants_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {orgGrants.map((g) => (
              <OrgGrantCard
                key={`${g.organization_id}`}
                orgName={g.organizations?.organization_name ?? String(g.organization_id)}
                orgSlug={g.organizations?.organization_slug ?? null}
                accessLabel={t("read_access")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Inline atoms (scoped to this surface to honor the file-list constraint) ──

function ScopeBadge({ global, label }: { global: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.01em]",
        global
          ? "border border-emerald-600/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300"
          : "border-border text-foreground bg-background border tabular-nums",
      )}
    >
      {global ? <Globe size={11} strokeWidth={2.25} /> : null}
      {label}
    </span>
  );
}

function AffiliationBadge({ state, label }: { state: AffiliationState; label: string }) {
  const base =
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.01em]";
  if (state === "accepted") {
    return (
      <span
        className={cn(
          base,
          "border border-emerald-600/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300",
        )}
      >
        <BadgeCheck size={11} strokeWidth={2.25} /> {label}
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className={cn(base, "border-border text-muted-foreground border border-dashed bg-transparent")}>
        <Hourglass size={10} /> {label}
      </span>
    );
  }
  if (state === "rejected") {
    return (
      <span className={cn(base, "border-destructive/35 text-destructive bg-destructive/[0.06] border")}>
        <X size={10} strokeWidth={2.5} /> {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        "border-border text-muted-foreground bg-muted/50 decoration-muted-foreground/40 border line-through",
      )}
    >
      {label}
    </span>
  );
}

function AffiliateRow({
  name,
  email,
  state,
  stateLabel,
}: {
  name: string;
  email: string | null;
  state: AffiliationState;
  stateLabel: string;
}) {
  const dim = state === "revoked" || state === "rejected";
  return (
    <div
      className={cn(
        "border-border grid w-full items-center gap-3 rounded-md border px-3.5 py-2.5",
        dim ? "bg-muted/30" : "bg-background",
      )}
      style={{ gridTemplateColumns: "34px 1fr auto" }}
    >
      <span
        className={cn(
          "bg-muted text-foreground inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tracking-[-0.01em]",
          dim && "opacity-60",
        )}
      >
        {INITIALS_OF(name)}
      </span>
      <span className="flex min-w-0 flex-col gap-[1px]">
        <span
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium",
            dim ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {name}
        </span>
        {email && email !== name ? (
          <span className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap text-[12px]">
            {email}
          </span>
        ) : null}
      </span>
      <AffiliationBadge state={state} label={stateLabel} />
    </div>
  );
}

function GlobalGrantCard({ title, desc, accessLabel }: { title: string; desc: string; accessLabel: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.06] px-3.5 py-3">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
        <Globe size={17} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[13.5px] font-semibold">{title}</span>
          <span className="text-muted-foreground/80 font-mono text-[10.5px]">org = NULL</span>
        </div>
        <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">{desc}</span>
        <div className="mt-0.5">
          <AccessPill global label={accessLabel} />
        </div>
      </div>
    </div>
  );
}

function OrgGrantCard({
  orgName,
  orgSlug,
  accessLabel,
}: {
  orgName: string;
  orgSlug: string | null;
  accessLabel: string;
}) {
  return (
    <div
      className="border-border bg-background grid items-start gap-3 rounded-lg border px-3.5 py-3"
      style={{ gridTemplateColumns: "36px 1fr" }}
    >
      <span className="bg-muted text-foreground border-border inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-[12.5px] font-semibold">
        {INITIALS_OF(orgName)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[13.5px] font-medium">{orgName}</span>
          {orgSlug ? <code className="text-muted-foreground/80 font-mono text-[10.5px]">{orgSlug}</code> : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <AccessPill global={false} label={accessLabel} />
        </div>
      </div>
    </div>
  );
}

function AccessPill({ global, label }: { global: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium leading-[1.3]",
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
  page_title: "Agencia",
  back: "Agencias",
  invite: "Afiliar persona",
  eyebrow: "SaaS Template · Agencia",
  disabled: "Deshabilitada",
  scope_global: "Acceso global",
  scope_orgs: "{{count}} organizaciones",
  affiliates: "Afiliados",
  affiliates_count: "{{active}} activos · {{total}} total",
  affiliates_empty: "Esta agencia aún no tiene afiliados.",
  affiliates_note:
    "Los afiliados son personas externas, no miembros de ninguna organización. Su sesión lleva la agencia — heredan los accesos de abajo y nunca pueden escribir.",
  grants: "Accesos",
  grants_empty: "Ninguna organización le ha dado acceso a esta agencia todavía.",
  read_access: "Acceso de lectura",
  global_title: "Todas las organizaciones",
  global_desc:
    "Acceso global de solo lectura a todos los tenants y organizaciones de la plataforma, actuales y futuros.",
  state_accepted: "Activo",
  state_pending: "Pendiente",
  state_revoked: "Revocado",
  state_rejected: "Rechazado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency",
  back: "Agencies",
  invite: "Affiliate a person",
  eyebrow: "SaaS Template · Agency",
  disabled: "Disabled",
  scope_global: "Global access",
  scope_orgs: "{{count}} organizations",
  affiliates: "Affiliates",
  affiliates_count: "{{active}} active · {{total}} total",
  affiliates_empty: "This agency has no affiliates yet.",
  affiliates_note:
    "Affiliates are external people, not members of any organization. Their session carries the agency — they inherit the access below and can never write.",
  grants: "Access",
  grants_empty: "No organization has given this agency access yet.",
  read_access: "Read access",
  global_title: "All organizations",
  global_desc: "Global read-only access to every tenant and organization on the platform, current and future.",
  state_accepted: "Active",
  state_pending: "Pending",
  state_revoked: "Revoked",
  state_rejected: "Rejected",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Agência",
  back: "Agências",
  invite: "Afiliar uma pessoa",
  eyebrow: "SaaS Template · Agência",
  disabled: "Desabilitada",
  scope_global: "Acesso global",
  scope_orgs: "{{count}} organizações",
  affiliates: "Afiliados",
  affiliates_count: "{{active}} ativos · {{total}} total",
  affiliates_empty: "Esta agência ainda não tem afiliados.",
  affiliates_note:
    "Os afiliados são pessoas externas, não membros de nenhuma organização. Sua sessão carrega a agência — herdam os acessos abaixo e nunca podem escrever.",
  grants: "Acessos",
  grants_empty: "Nenhuma organização deu acesso a esta agência ainda.",
  read_access: "Acesso de leitura",
  global_title: "Todas as organizações",
  global_desc: "Acesso global somente leitura a todos os tenants e organizações da plataforma, atuais e futuros.",
  state_accepted: "Ativo",
  state_pending: "Pendente",
  state_revoked: "Revogado",
  state_rejected: "Rejeitado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
