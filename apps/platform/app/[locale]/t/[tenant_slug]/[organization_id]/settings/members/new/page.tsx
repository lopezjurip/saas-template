import { createServerClient } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountries } from "~/hooks/get-countries";
import { getRosetta } from "~/hooks/get-rosetta";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale } from "~/lib/i18n.server";
import { InviteMemberForm } from "./invite-form";

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/new">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function NewMemberInvitePage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/members/new">,
) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const [
    {
      data: { organization },
    },
    { data: countriesData },
  ] = await Promise.all([getViewerOrganizationByIdAssert(organization_id), getCountries()]);
  const countries = countriesData?.["addresses_level0"]?.["edges"]?.map((e) => e["node"]) ?? [];

  const membersHref = `/${locale}/t/${tenant_slug}/${organization_id}/settings/members`;
  const editHrefBase = membersHref;

  const supabase = await createServerClient();
  // viewer_has_permission is SECURITY DEFINER and honors '*' as a match.
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    organization_id: organization_id,
    permission_id: "members_manage",
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <Link
        href={membersHref}
        className="text-muted-foreground hover:text-foreground -ml-1.5 inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium"
      >
        <ArrowLeft size={14} /> {t("back")}
      </Link>
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
          {organization["organization_name"]} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("page_title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
          {t("description")}
        </p>
      </header>

      {canManage ? (
        <InviteMemberForm
          organization_id={organization_id}
          countries={countries}
          membersHref={membersHref}
          editHrefBase={editHrefBase}
        />
      ) : (
        <Alert variant="destructive">
          <AlertDescription>{t("no_permission_alert")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

const LOCALE_ES = {
  back: "Volver a miembros",
  page_title: "Invitar a la organización",
  eyebrow: "Equipo",
  description:
    "Elige cómo identificar a la persona. Después de crear la invitación configurarás sus permisos en una pantalla aparte.",
  no_permission_alert: "No tienes permiso para invitar miembros en esta organización.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  back: "Back to members",
  page_title: "Invite to the organization",
  eyebrow: "Team",
  description:
    "Choose how to identify the person. After creating the invitation you'll set their permissions on a separate screen.",
  no_permission_alert: "You don't have permission to invite members in this organization.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  back: "Voltar para membros",
  page_title: "Convidar para a organização",
  eyebrow: "Equipe",
  description:
    "Escolha como identificar a pessoa. Depois de criar o convite você configurará as permissões em uma tela separada.",
  no_permission_alert: "Você não tem permissão para convidar membros nesta organização.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
