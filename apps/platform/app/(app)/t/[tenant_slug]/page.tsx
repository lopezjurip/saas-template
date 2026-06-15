import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { SINGLE } from "@packages/utils/array";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

export default async function TenantHomePage(props: PageProps<"/t/[tenant_slug]">) {
  const { tenant_slug } = await props.params;
  const { redirect: redirectParams } = await props.searchParams;
  const redirectParam = SINGLE(redirectParams);

  const locale = await getServerLocale();
  const { t } = await getRosetta(LOCALES);

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);
  const tenant_id = tenant["tenantId"];

  const { data } = await getViewerOrganizations({
    filter: { tenantId: { eq: tenant_id } },
  });
  const organizations = data?.["organizations"]?.["edges"] || [];

  if (organizations.length === 0) {
    return (
      <main className="bg-muted flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{tenant["tenantName"]}</CardTitle>
            <CardDescription>{tenant_slug}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("noOrgs")}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href={ROUTE("/auth/logout", { locale })}>{t("signOut")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (redirectParam !== "false" && organizations.length === 1) {
    const only = organizations[0]!["node"];
    redirect(
      ROUTE_HREF(
        ROUTE("/t/[tenant_slug]/[organization_id]", {
          locale,
          tenant_slug,
          organization_id: only["organizationId"],
        }),
      ),
    );
  }

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tenant["tenantName"]}</CardTitle>
          <CardDescription>{t("pickOrg")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {organizations.map(({ ["node"]: organization }) => {
            return (
              <Button
                asChild
                key={organization["organizationId"]}
                data-organization_id={organization["organizationId"]}
                variant="outline"
                className="w-full justify-between"
              >
                <Link
                  href={ROUTE("/t/[tenant_slug]/[organization_id]", {
                    locale,
                    tenant_slug,
                    organization_id: organization["organizationId"],
                  })}
                >
                  <span>{organization["organizationName"]}</span>
                  <span className="text-xs text-muted-foreground">{organization["organizationSlug"]}</span>
                </Link>
              </Button>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <Link href={ROUTE("/auth/logout", { locale })}>{t("signOut")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

const LOCALE_ES = {
  noOrgs: "No tienes organizaciones activas en esta empresa.",
  signOut: "Cerrar sesión",
  pickOrg: "Elige una organización para continuar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  noOrgs: "You have no active organizations in this company.",
  signOut: "Sign out",
  pickOrg: "Choose an organization to continue",
};

const LOCALE_PT: typeof LOCALE_ES = {
  noOrgs: "Você não tem organizações ativas nesta empresa.",
  signOut: "Sair",
  pickOrg: "Escolha uma organização para continuar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
