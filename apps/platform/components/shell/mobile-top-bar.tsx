"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import { ChevronDown, Menu, Search } from "lucide-react";
import type { ComponentProps } from "react";

import { InitialsAvatar } from "~/components/shell/atoms";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";

export function MobileTopBar({
  tenant,
  organization,
  viewer,
  title,
  onMenu,
  onSearch,
  onOrg,
  onProfile,
  className,
  ...props
}: {
  tenant: ShellTenant;
  organization: ShellOrganization;
  viewer: ShellViewer;
  title: string;
  onMenu: () => void;
  onSearch: () => void;
  onOrg: () => void;
  onProfile: () => void;
} & ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "border-border bg-background/95 supports-backdrop-filter:bg-background/80 flex shrink-0 flex-col border-b pt-safe backdrop-blur",
        className,
      )}
    >
      <div className="flex h-12 items-center gap-1 px-1.5">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Menu"
          className="text-foreground/80 active:bg-accent flex h-9 w-9 items-center justify-center rounded-md"
        >
          <Menu size={18} />
        </button>

        <button
          type="button"
          onClick={onOrg}
          className="active:bg-accent flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left"
        >
          <InitialsAvatar
            initials={INITIALS_OF(organization["organizationName"])}
            style={COLOR_HSL_FROM_STRING(organization["organizationName"])}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm/normal font-semibold leading-none">
                {organization["organizationName"]}
              </span>
              <ChevronDown size={12} className="text-muted-foreground shrink-0" />
            </div>
            <div className="text-muted-foreground mt-0.5 truncate text-tiny leading-none">
              {title || tenant["tenantName"]}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="text-foreground/80 active:bg-accent flex h-9 w-9 items-center justify-center rounded-md"
        >
          <Search size={17} />
        </button>
        <button
          type="button"
          onClick={onProfile}
          aria-label="Profile"
          className="flex h-9 w-9 items-center justify-center rounded-md"
        >
          <InitialsAvatar
            initials={INITIALS_OF(viewer["profileNameFull"] || viewer["email"])}
            color="bg-fuchsia-600 text-white"
            size="sm"
          />
        </button>
      </div>
    </div>
  );
}
