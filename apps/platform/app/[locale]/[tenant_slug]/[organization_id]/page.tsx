import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  const base = `/${locale}/${tenant_slug}/${organization_id}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{organization["organization_name"]}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {profile_name_full ? `Hola, ${profile_name_full}.` : "Bienvenido."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
          <CardDescription>Atajos a las áreas principales de la organización.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href={`${base}/settings/members`}>
              <Users className="h-4 w-4" />
              Miembros y permisos
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start" disabled>
            <Link href={`${base}/settings`}>
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
