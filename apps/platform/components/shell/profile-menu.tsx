"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Bell, ChevronsUpDown, CreditCard, KeyRound, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Avatar, INITIALS_FROM_NAME, Tip, useClickOutside } from "~/components/shell/atoms";
import type { ViewerProfileUseFragmentType } from "~/hooks/use-viewer-profile";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

export type ShellViewer = ViewerProfileUseFragmentType & { email: string };

export function ProfileMenu({ locale, viewer, compact }: { locale: string; viewer: ShellViewer; compact?: boolean }) {
  const { t } = useRosetta(LOCALES);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const display_name = viewer["profile_name_full"] || viewer["email"];
  const initials = INITIALS_FROM_NAME(display_name);
  const color = "bg-fuchsia-600 text-white";

  const trigger = compact ? (
    <Tip label={`${display_name} · ${viewer["email"]}`} disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-open={open}
        className="hover:bg-accent/70 data-[open=true]:bg-accent flex h-9 w-9 items-center justify-center rounded-md"
      >
        <Avatar initials={initials} color={color} size="md" />
      </button>
    </Tip>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      data-open={open}
      className="hover:bg-accent/70 data-[open=true]:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left"
    >
      <Avatar initials={initials} color={color} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">{display_name}</div>
        <div className="text-muted-foreground truncate text-xs leading-tight">{viewer["email"]}</div>
      </div>
      <ChevronsUpDown size={14} className="text-muted-foreground" />
    </button>
  );

  const items = [
    { Icon: User, label: t("account"), href: ROUTE("/[locale]/home/account/profile", { locale }) },
    { Icon: CreditCard, label: t("billing"), href: ROUTE("/[locale]/home/account/profile", { locale }) },
    { Icon: KeyRound, label: t("tokens"), href: ROUTE("/[locale]/home/account/tokens", { locale }) },
    { Icon: Bell, label: t("notifications"), href: ROUTE("/[locale]/home/account/notifications", { locale }) },
  ];

  return (
    <div className="relative" ref={ref}>
      {trigger}
      {open && (
        <div
          className={cn(
            "border-border bg-card text-card-foreground overflow-hidden rounded-md border shadow-lg",
            compact ? "absolute bottom-0 left-full z-40 ml-2 w-64" : "absolute bottom-full left-0 right-0 z-30 mb-1.5",
          )}
        >
          <div className="border-border flex items-center gap-2 border-b px-2 py-2">
            <Avatar initials={initials} color={color} size="md" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{display_name}</div>
              <div className="text-muted-foreground truncate text-xs">{viewer["email"]}</div>
            </div>
          </div>
          <div className="px-1 py-1">
            {items.map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
              >
                <Icon size={14} className="text-muted-foreground" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="border-border border-t px-1 py-1">
            <Link
              href={ROUTE("/[locale]/auth/logout", { locale })}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut size={14} />
              <span>{t("signOut")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  account: "Cuenta",
  billing: "Facturación",
  tokens: "Tokens de API",
  notifications: "Notificaciones",
  signOut: "Cerrar sesión",
};

const LOCALE_EN: typeof LOCALE_ES = {
  account: "Account",
  billing: "Billing",
  tokens: "API tokens",
  notifications: "Notifications",
  signOut: "Sign out",
};

const LOCALE_PT: typeof LOCALE_ES = {
  account: "Conta",
  billing: "Faturamento",
  tokens: "Tokens de API",
  notifications: "Notificações",
  signOut: "Sair",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
