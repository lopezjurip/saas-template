import { CreditCard, ExternalLink, Settings, Users } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SubSidebar, type SubSidebarItem } from "~/components/sub-sidebar";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string }>;
}) {
  const { locale, tenant_slug, organization_id } = await params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  const { t } = ROSETTA(LOCALES, locale);

  const base = `/${locale}/${tenant_slug}/${organization_id}/settings`;

  const items: SubSidebarItem[] = [
    {
      kind: "node",
      label: t("section_organization"),
      defaultOpen: true,
      children: [
        {
          kind: "leaf",
          label: t("nav_general"),
          href: `${base}/general`,
          icon: Settings,
        },
        {
          kind: "leaf",
          label: t("nav_members"),
          href: `${base}/members`,
          icon: Users,
        },
        {
          kind: "leaf",
          label: t("nav_billing"),
          href: `${base}/billing`,
          icon: CreditCard,
        },
        {
          kind: "leaf",
          label: t("nav_external_access"),
          href: `${base}/external-access`,
          icon: ExternalLink,
        },
      ],
    },
  ];

  return (
    <div className="flex h-full">
      <SubSidebar title={t("title")} items={items} />
      <main className="bg-muted flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

const LOCALE_ES = {
  title: "Configuración",
  section_organization: "Organización",
  nav_general: "General",
  nav_members: "Miembros",
  nav_billing: "Facturación",
  nav_external_access: "Acceso externo",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Settings",
  section_organization: "Organization",
  nav_general: "General",
  nav_members: "Members",
  nav_billing: "Billing",
  nav_external_access: "External access",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Configurações",
  section_organization: "Organização",
  nav_general: "General",
  nav_members: "Membros",
  nav_billing: "Cobrança",
  nav_external_access: "Acesso externo",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
