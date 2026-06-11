import { SubSidebar, type SubSidebarItem } from "~/components/shell/sidebar-sub";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";

export default async function SettingsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings">) {
  const { locale, tenant_slug, organization_id } = await params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

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
          icon: "Settings",
        },
        {
          kind: "leaf",
          label: t("nav_members"),
          href: `${base}/members`,
          icon: "Users",
        },
        {
          kind: "leaf",
          label: t("nav_billing"),
          href: `${base}/billing`,
          icon: "CreditCard",
        },
        {
          kind: "leaf",
          label: t("nav_external_access"),
          href: `${base}/external-access`,
          icon: "ExternalLink",
        },
      ],
    },
  ];

  return (
    <div className="flex h-full">
      <SubSidebar title={t("title")} items={items} />
      {/* Light: muted canvas makes the bg-background cards read as elevated. Dark inverts
          that lightness (muted > background), so fall back to the base bg — cards delineate
          by border, matching the rest of the shell. */}
      <main className="bg-muted dark:bg-background flex-1 overflow-y-auto">{children}</main>
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
