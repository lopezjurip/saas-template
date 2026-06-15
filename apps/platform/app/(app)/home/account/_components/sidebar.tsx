"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ACCOUNT_SECTION_PATH, ACCOUNT_SECTIONS, type AccountGroupKey, type AccountSectionId } from "./sections";

function ACTIVE_SECTION(pathname: string): AccountSectionId {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "profile";
  return (ACCOUNT_SECTIONS.find((s) => s.id === last)?.id ?? "profile") as AccountSectionId;
}

export function AccountSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const active = ACTIVE_SECTION(pathname);
  const { t } = useRosetta(LOCALES);

  const groups: { key: AccountGroupKey; items: typeof ACCOUNT_SECTIONS }[] = [];
  let lastGroupKey: AccountGroupKey | null = null;
  for (const s of ACCOUNT_SECTIONS) {
    if (s.groupKey !== lastGroupKey) {
      groups.push({ key: s.groupKey, items: [] });
      lastGroupKey = s.groupKey;
    }
    (groups[groups.length - 1]!.items as unknown as (typeof ACCOUNT_SECTIONS)[number][]).push(s);
  }

  return (
    <nav className="bg-muted/22 flex h-full flex-col gap-1 border-r px-2.5 py-4">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="text-muted-foreground px-2.5 pt-4 pb-1.5 text-tiny font-semibold tracking-[0.08em] uppercase first:pt-1">
            {t(g.key)}
          </div>
          {g.items.map((s) => (
            <Link
              key={s.id}
              href={ROUTE(ACCOUNT_SECTION_PATH(s.id), { locale })}
              data-active={s.id === active ? "true" : "false"}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left text-sm/normal font-medium no-underline",
                "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:border-border data-[active=true]:shadow-sm",
                s.danger && "text-destructive",
              )}
            >
              <span className="inline-flex size-[18px] items-center justify-center text-current">
                <s.Icon size={15} />
              </span>
              <span>{t(s.labelKey)}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function AccountMobileNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const active = ACTIVE_SECTION(pathname);
  const { t } = useRosetta(LOCALES);
  return (
    <div className="flex gap-1 overflow-x-auto border-b px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {ACCOUNT_SECTIONS.map((s) => (
        <Link
          key={s.id}
          href={ROUTE(ACCOUNT_SECTION_PATH(s.id), { locale })}
          data-active={s.id === active ? "true" : "false"}
          className={cn(
            "text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap no-underline",
            "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground",
            s.danger && "text-destructive",
          )}
        >
          <s.Icon size={13} /> {t(s.labelKey)}
        </Link>
      ))}
    </div>
  );
}

const LOCALE_ES = {
  // section labels
  nav_profile: "Perfil",
  nav_security: "Inicio de sesión",
  nav_connections: "Conexiones",
  nav_sessions: "Dispositivos",
  nav_notifications: "Notificaciones",
  nav_integrations: "Integraciones",
  nav_danger: "Eliminar cuenta",
  // group names
  account: "Cuenta",
  security_group: "Seguridad",
  preferences: "Preferencias",
  danger_zone: "Zona de riesgo",
};

const LOCALE_EN: typeof LOCALE_ES = {
  nav_profile: "Profile",
  nav_security: "Sign in",
  nav_connections: "Connections",
  nav_sessions: "Devices",
  nav_notifications: "Notifications",
  nav_integrations: "Integrations",
  nav_danger: "Delete account",
  account: "Account",
  security_group: "Security",
  preferences: "Preferences",
  danger_zone: "Danger zone",
};

const LOCALE_PT: typeof LOCALE_ES = {
  nav_profile: "Perfil",
  nav_security: "Entrar",
  nav_connections: "Conexões",
  nav_sessions: "Dispositivos",
  nav_notifications: "Notificações",
  nav_integrations: "Integrações",
  nav_danger: "Excluir conta",
  account: "Conta",
  security_group: "Segurança",
  preferences: "Preferências",
  danger_zone: "Zona de risco",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
