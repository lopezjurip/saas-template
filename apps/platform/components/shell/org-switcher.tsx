"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowLeftRight, Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { EntityAvatar } from "~/components/entity-avatar";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import type { ViewerOrganizationUseFragmentType } from "~/hooks/use-viewer-organizations";
import type { ViewerTenantUseFragmentType } from "~/hooks/use-viewer-tenants";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

export type ShellOrganization = ViewerOrganizationUseFragmentType;
export type ShellTenant = ViewerTenantUseFragmentType;

/** Stable avatar URL for an org — the route resolves the latest logo or 404s to initials. */
function ORG_AVATAR_SRC(organizationId: number): string {
  return `/api/v1/organizations/${organizationId}/avatar`;
}

export function OrgSwitcher({
  locale,
  tenant,
  organizations,
  current,
  compact,
}: {
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  compact?: boolean;
}) {
  const { t } = useRosetta(LOCALES);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const trigger = compact ? (
    <Tip label={`${current["organizationName"]} · ${tenant["tenantName"]}`} disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-open={open}
        className="hover:bg-accent/70 data-[open=true]:bg-accent data-[open=true]:border-border flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-colors"
      >
        <EntityAvatar
          name={current["organizationName"]}
          src={ORG_AVATAR_SRC(current["organizationId"])}
          className="h-8 w-8 text-xs"
        />
      </button>
    </Tip>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      data-open={open}
      className="hover:bg-accent/70 data-[open=true]:bg-accent data-[open=true]:border-border flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors"
    >
      <EntityAvatar
        name={current["organizationName"]}
        src={ORG_AVATAR_SRC(current["organizationId"])}
        className="h-8 w-8 text-xs"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">{current["organizationName"]}</div>
        <div className="text-muted-foreground truncate text-xs leading-tight">{tenant["tenantName"]}</div>
      </div>
      <ChevronsUpDown size={14} className="text-muted-foreground" />
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      {trigger}
      {open && (
        <div
          className={cn(
            "border-border bg-card text-card-foreground overflow-hidden rounded-md border shadow-lg",
            compact ? "absolute left-full top-0 z-40 ml-2 w-64" : "absolute left-0 right-0 top-full z-30 mt-1.5",
          )}
        >
          <div className="text-muted-foreground px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wider">
            {t("heading")}
          </div>
          <div className="px-1 pb-1">
            {organizations.map((organization) => {
              const isCurrent = organization["organizationId"] === current["organizationId"];
              return (
                <Link
                  key={organization["organizationId"]}
                  href={ROUTE("/t/[tenant_slug]/[organization_id]", {
                    tenant_slug: tenant["tenantSlug"],
                    organization_id: organization["organizationId"],
                  })}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                >
                  <EntityAvatar
                    name={organization["organizationName"]}
                    src={ORG_AVATAR_SRC(organization["organizationId"])}
                    className="h-6 w-6 text-tiny"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{organization["organizationName"]}</div>
                    {organization["organizationSlug"] ? (
                      <div className="text-muted-foreground truncate text-xs">{organization["organizationSlug"]}</div>
                    ) : null}
                  </div>
                  {isCurrent ? <Check size={14} className="text-foreground" /> : null}
                </Link>
              );
            })}
          </div>
          <div className="border-border border-t px-1 py-1">
            <Link
              href={ROUTE("/t/[tenant_slug]/[organization_id]/organizations/create", {
                tenant_slug: tenant["tenantSlug"],
                organization_id: current["organizationId"],
              })}
              onClick={() => setOpen(false)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <Plus size={14} className="text-muted-foreground" />
              <span>{t("create")}</span>
            </Link>
            <Link
              href={ROUTE("/home")}
              onClick={() => setOpen(false)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <ArrowLeftRight size={14} className="text-muted-foreground" />
              <span>{t("switchTenant")}</span>
            </Link>
            <Link
              href={ROUTE("/t/[tenant_slug]/[organization_id]/settings", {
                tenant_slug: tenant["tenantSlug"],
                organization_id: current["organizationId"],
              })}
              onClick={() => setOpen(false)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <Settings size={14} className="text-muted-foreground" />
              <span>{t("orgSettings")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  heading: "Organizaciones",
  create: "Crear organización",
  switchTenant: "Cambiar de empresa",
  orgSettings: "Configuración de la organización",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Organizations",
  create: "Create organization",
  switchTenant: "Switch company",
  orgSettings: "Organization settings",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Organizações",
  create: "Criar organização",
  switchTenant: "Trocar de empresa",
  orgSettings: "Configurações da organização",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
