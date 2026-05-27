import { RosettaImpl } from "@packages/rosetta/rosetta";
import { createServerClient } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountries } from "~/hooks/get-countries";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47 } from "~/lib/i18n";
import { InviteMemberForm } from "./invite-form";

const LOCALE_ES = {
  back: "Volver a miembros",
  page_title: "Invitar miembro",
  description:
    "Por email: enviaremos un magic-link. Por documento: te daremos un link que compartes manualmente (WhatsApp, etc.).",
  no_permission_alert: "No tienes permiso para invitar miembros en esta organización.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    back: "Back to members",
    page_title: "Invite member",
    description: "By email: we'll send a magic-link. By document: we'll give you a link to share manually.",
    no_permission_alert: "You don't have permission to invite members in this organization.",
  } satisfies typeof LOCALE_ES,
  pt: {
    back: "Voltar para membros",
    page_title: "Convidar membro",
    description:
      "Por e-mail: enviaremos um magic-link. Por documento: você receberá um link para compartilhar manualmente.",
    no_permission_alert: "Você não tem permissão para convidar membros nesta organização.",
  } satisfies typeof LOCALE_ES,
};

export default async function NewMemberInvitePage({
  params,
}: {
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string }>;
}) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale]);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const [{ data: orgData }, { data: countriesData }] = await Promise.all([
    getViewerOrganization(organization_id),
    getCountries(),
  ]);
  const organization = orgData?.["viewer_organization_by_id"];
  if (!organization) notFound();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];

  const membersHref = `/${locale}/${tenant_slug}/${organization_id}/settings/members`;

  const supabase = await createServerClient();
  // viewer_has_permission is SECURITY DEFINER and honors '*' as a match.
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    target_organization_id: organization_id,
    target_permission_id: "members_manage",
  });

  if (!canManage) {
    return (
      <main className="bg-muted flex min-h-svh items-start justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
              <Link href={membersHref}>
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </Link>
            </Button>
            <CardTitle>{t("page_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{t("no_permission_alert")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    );
  }

  const editHrefBase = `/${locale}/${tenant_slug}/${organization_id}/settings/members`;

  return (
    <main className="bg-muted flex min-h-svh items-start justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
            <Link href={membersHref}>
              <ChevronLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
          <CardTitle>{t("page_title")}</CardTitle>
          <CardDescription>
            {organization["organization_name"]} · {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm
            organization_id={organization_id}
            countries={countries}
            membersHref={membersHref}
            editHrefBase={editHrefBase}
          />
        </CardContent>
      </Card>
    </main>
  );
}
