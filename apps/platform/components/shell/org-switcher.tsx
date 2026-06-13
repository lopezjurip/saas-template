"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { COLOR_HSL_FROM_NAME, INITIALS_OF, Tip, useClickOutside } from "~/components/shell/atoms";
import type { ViewerOrganizationUseFragmentType } from "~/hooks/use-viewer-organizations";
import type { ViewerTenantUseFragmentType } from "~/hooks/use-viewer-tenants";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

export type ShellOrganization = ViewerOrganizationUseFragmentType;
export type ShellTenant = ViewerTenantUseFragmentType;

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

  const initials = INITIALS_OF(current["organization_name"]);
  const colorStyle = COLOR_HSL_FROM_NAME(current["organization_name"]);

  const trigger = compact ? (
    <Tip label={`${current["organization_name"]} · ${tenant["tenant_name"]}`} disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-open={open}
        className="hover:bg-accent/70 data-[open=true]:bg-accent data-[open=true]:border-border flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-colors"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium tracking-tight"
          style={{
            backgroundColor: colorStyle.background,
            color: colorStyle.color,
            borderColor: colorStyle.borderColor,
          }}
        >
          {initials}
        </span>
      </button>
    </Tip>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      data-open={open}
      className="hover:bg-accent/70 data-[open=true]:bg-accent data-[open=true]:border-border flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium tracking-tight"
        style={{ backgroundColor: colorStyle.background, color: colorStyle.color, borderColor: colorStyle.borderColor }}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">{current["organization_name"]}</div>
        <div className="text-muted-foreground truncate text-xs leading-tight">{tenant["tenant_name"]}</div>
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
              const isCurrent = organization["organization_id"] === current["organization_id"];
              const orgColorStyle = COLOR_HSL_FROM_NAME(organization["organization_name"]);
              return (
                <Link
                  key={organization["organization_id"]}
                  href={ROUTE("/[locale]/t/[tenant_slug]/[organization_id]", {
                    locale,
                    tenant_slug: tenant["tenant_slug"],
                    organization_id: organization["organization_id"],
                  })}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-tiny font-medium tracking-tight"
                    style={{
                      backgroundColor: orgColorStyle.background,
                      color: orgColorStyle.color,
                      borderColor: orgColorStyle.borderColor,
                    }}
                  >
                    {INITIALS_OF(organization["organization_name"])}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{organization["organization_name"]}</div>
                    {organization["organization_slug"] ? (
                      <div className="text-muted-foreground truncate text-xs">{organization["organization_slug"]}</div>
                    ) : null}
                  </div>
                  {isCurrent ? <Check size={14} className="text-foreground" /> : null}
                </Link>
              );
            })}
          </div>
          <div className="border-border border-t px-1 py-1">
            <Link
              href={ROUTE("/[locale]/home", { locale })}
              onClick={() => setOpen(false)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <Plus size={14} className="text-muted-foreground" />
              <span>{t("switchTenant")}</span>
            </Link>
            <Link
              href={ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings", {
                locale,
                tenant_slug: tenant["tenant_slug"],
                organization_id: current["organization_id"],
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
