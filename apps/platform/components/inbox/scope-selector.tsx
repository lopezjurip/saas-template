"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Building2, ChevronDown, Globe, Landmark } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { InboxScope } from "~/components/inbox/scope";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";

const ScopeSelectorOrgsQuery = /*#__PURE__*/ gql(`
  query ScopeSelectorOrgsQuery {
    viewer_organizations(
      filter: { organization_disabled_at: { is: NULL } }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          organization_id
          organization_name
          tenants {
            tenant_slug
          }
        }
      }
    }
  }
`);

const ScopeSelectorAgenciesQuery = /*#__PURE__*/ gql(`
  query ScopeSelectorAgenciesQuery {
    agencies: viewer_agencies(
      orderBy: [{ agency_name: AscNullsLast }]
    ) {
      edges {
        node {
          agency_id
          agency_slug
          agency_name
        }
      }
    }
  }
`);

type ScopeOrg = {
  organization_id: number;
  organization_name: string;
  tenant_slug: string;
};

type ScopeAgency = {
  agency_id: string;
  agency_slug: string;
  agency_name: string;
};

function IS_SCOPE_ACTIVE(current: InboxScope, candidate: InboxScope): boolean {
  if (current.kind !== candidate.kind) return false;
  if (current.kind === "personal") return true;
  if (current.kind === "organization" && candidate.kind === "organization") {
    return current.organization_id === candidate.organization_id;
  }
  if (current.kind === "agency" && candidate.kind === "agency") {
    return current.agency_id === candidate.agency_id;
  }
  return false;
}

function SCOPE_LABEL(scope: InboxScope, t: Translate): string {
  if (scope.kind === "personal") return t("personal");
  if (scope.kind === "organization") return scope.tenant_slug;
  return scope.agency_slug;
}

type Translate = (key: keyof typeof LOCALE_EN) => string;

/**
 * Dropdown control listing all inbox scopes the viewer can access.
 * Each option is a Link to that scope's inbox. Highlights the current scope.
 * Fetches org + agency lists client-side via GraphQL.
 *
 * @example
 * <ScopeSelector currentScope={{ kind: "personal" }} />
 * <ScopeSelector currentScope={{ kind: "organization", tenant_slug: "acme", organization_id: 42 }} />
 */
export function ScopeSelector({ currentScope }: { currentScope: InboxScope }) {
  const { t } = useRosetta(LOCALES);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const { data: user } = useSupabaseUser();
  const { data: orgsData } = useGraphyQuery(user ? { query: ScopeSelectorOrgsQuery } : null);
  const { data: agenciesData } = useGraphyQuery(user ? { query: ScopeSelectorAgenciesQuery } : null);

  const orgEdges = orgsData?.["viewer_organizations"]?.["edges"] ?? [];
  const agencyEdges = agenciesData?.["agencies"]?.["edges"] ?? [];

  const orgs: ScopeOrg[] = orgEdges.flatMap(
    (edge: NonNullable<ResultOf<typeof ScopeSelectorOrgsQuery>["viewer_organizations"]>["edges"][number]) => {
      const node = edge["node"];
      const tenant_slug = node?.["tenants"]?.["tenant_slug"];
      if (!tenant_slug || !node) return [];
      return [{ organization_id: node["organization_id"], organization_name: node["organization_name"], tenant_slug }];
    },
  );

  const agencies: ScopeAgency[] = agencyEdges.map(
    (edge: NonNullable<ResultOf<typeof ScopeSelectorAgenciesQuery>["agencies"]>["edges"][number]) => {
      const node = edge["node"];
      return { agency_id: node["agency_id"], agency_slug: node["agency_slug"], agency_name: node["agency_name"] };
    },
  );

  const currentLabel = SCOPE_LABEL(currentScope, t);

  return (
    <div className="relative" ref={ref}>
      <Tip label={t("switchScope")} disabled={open}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-open={open}
          className="hover:bg-accent/70 data-[open=true]:bg-accent data-[open=true]:border-border flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-colors"
        >
          <span className="truncate max-w-32">{currentLabel}</span>
          <ChevronDown size={13} className="text-muted-foreground shrink-0" />
        </button>
      </Tip>

      {open && (
        <div className="border-border bg-card text-card-foreground absolute left-0 top-full z-30 mt-1.5 min-w-52 overflow-hidden rounded-md border shadow-lg">
          {/* Personal */}
          <div className="px-2 pb-1 pt-2">
            <ScopeOption
              scope={{ kind: "personal" }}
              label={t("personal")}
              description={t("personalDesc")}
              Icon={Globe}
              isActive={IS_SCOPE_ACTIVE(currentScope, { kind: "personal" })}
              onSelect={() => setOpen(false)}
            />
          </div>

          {/* Organizations */}
          {orgs.length > 0 && (
            <>
              <div className="border-border border-t px-2 pb-1 pt-2">
                <span className="text-muted-foreground px-1 text-tiny font-semibold uppercase tracking-wider">
                  {t("orgsLabel")}
                </span>
              </div>
              <div className="px-2 pb-1">
                {orgs.map((org) => {
                  const scope: InboxScope = {
                    kind: "organization",
                    tenant_slug: org.tenant_slug,
                    organization_id: org.organization_id,
                  };
                  return (
                    <ScopeOption
                      key={org.organization_id}
                      scope={scope}
                      label={org.organization_name}
                      description={org.tenant_slug}
                      Icon={Building2}
                      isActive={IS_SCOPE_ACTIVE(currentScope, scope)}
                      onSelect={() => setOpen(false)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* Agencies */}
          {agencies.length > 0 && (
            <>
              <div className="border-border border-t px-2 pb-1 pt-2">
                <span className="text-muted-foreground px-1 text-tiny font-semibold uppercase tracking-wider">
                  {t("agenciesLabel")}
                </span>
              </div>
              <div className="px-2 pb-2">
                {agencies.map((agency) => {
                  const scope: InboxScope = {
                    kind: "agency",
                    agency_slug: agency.agency_slug,
                    agency_id: agency.agency_id,
                  };
                  return (
                    <ScopeOption
                      key={agency.agency_id}
                      scope={scope}
                      label={agency.agency_name}
                      description={agency.agency_slug}
                      Icon={Landmark}
                      isActive={IS_SCOPE_ACTIVE(currentScope, scope)}
                      onSelect={() => setOpen(false)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Local — renders a single scope option as a Link inside the dropdown.
function ScopeOption({
  scope,
  label,
  description,
  Icon,
  isActive,
  onSelect,
}: {
  scope: InboxScope;
  label: string;
  description?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={SCOPE_INBOX_HREF(scope) as string}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent",
      )}
    >
      <Icon size={14} className={cn("shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-sm", isActive && "font-medium")}>{label}</div>
        {description && !isActive && <div className="text-muted-foreground truncate text-xs">{description}</div>}
      </div>
    </Link>
  );
}

const LOCALE_ES = {
  switchScope: "Cambiar bandeja",
  personal: "Personal",
  personalDesc: "Tu bandeja personal",
  orgsLabel: "Organizaciones",
  agenciesLabel: "Agencias",
};

const LOCALE_EN: typeof LOCALE_ES = {
  switchScope: "Switch inbox",
  personal: "Personal",
  personalDesc: "Your personal inbox",
  orgsLabel: "Organizations",
  agenciesLabel: "Agencies",
};

const LOCALE_PT: typeof LOCALE_ES = {
  switchScope: "Trocar caixa",
  personal: "Pessoal",
  personalDesc: "Sua caixa pessoal",
  orgsLabel: "Organizações",
  agenciesLabel: "Agências",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
