import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { Settings, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { getViewerProfile } from "~/hooks/get-viewer-profile";

export default async function OrganizationHomePage({
  params,
}: {
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string }>;
}) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await params;
  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const [{ data: orgData }, { data: profileData }] = await Promise.all([
    getViewerOrganization(organization_id),
    getViewerProfile(),
  ]);
  const organization = orgData?.["organizationsCollection"]?.["edges"]?.[0]?.["node"];
  if (!organization) notFound();

  const profile_name_full = profileData?.["profile"]?.["profile_name_full"] ?? null;

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{organization["organization_name"]}</CardTitle>
          <CardDescription>{tenant_slug}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {profile_name_full ? <p className="text-sm">Hola, {profile_name_full}.</p> : null}
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/${tenant_slug}/${organization_id}/settings/members`}>
                <Users className="h-4 w-4" />
                Miembros y permisos
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" disabled>
              <Link href={`/${locale}/${tenant_slug}/${organization_id}/settings`}>
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/${tenant_slug}`}>Cambiar de organización</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/auth/logout`}>Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
