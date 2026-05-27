import { RosettaImpl } from "@packages/rosetta/rosetta";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { AcceptForm } from "./accept-form";

const LOCALE_ES = {
  missing_token: "Falta el token de invitación.",
  not_found: "Invitación no encontrada.",
  revoked: "Esta invitación fue cancelada.",
  already_accepted: "Esta invitación ya fue aceptada. Inicia sesión normalmente.",
  expired: "Esta invitación expiró. Pide a tu empleador que te invite de nuevo.",
  back: "← Volver",
  go_home: "Ir al inicio",
  join: "Únete a {{org}}",
  default_org: "una organización",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    missing_token: "Missing invitation token.",
    not_found: "Invitation not found.",
    revoked: "This invitation was cancelled.",
    already_accepted: "This invitation was already accepted. Sign in normally.",
    expired: "This invitation expired. Ask your employer to invite you again.",
    back: "← Back",
    go_home: "Go to home",
    join: "Join {{org}}",
    default_org: "an organization",
  } satisfies typeof LOCALE_ES,
  pt: {
    missing_token: "Token de convite ausente.",
    not_found: "Convite não encontrado.",
    revoked: "Este convite foi cancelado.",
    already_accepted: "Este convite já foi aceito. Faça login normalmente.",
    expired: "Este convite expirou. Peça ao seu empregador para te convidar novamente.",
    back: "← Voltar",
    go_home: "Ir para o início",
    join: "Junte-se a {{org}}",
    default_org: "uma organização",
  } satisfies typeof LOCALE_ES,
};

type SearchParams = Promise<{ token?: string }>;
type Params = Promise<{ locale: string }>;

export default async function AcceptInvitationPage({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: Params;
}) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  const token = sp["token"];

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("missing_token")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("memberships")
    .select(
      "membership_id, profile_id, membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value, membership_invite_email, membership_invite_expires_at, membership_accepted_at, membership_rejected_at, membership_revoked_at, organizations(organization_name, tenants(tenant_name, tenant_slug))",
    )
    .eq("membership_invite_token", token)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("not_found")}</AlertDescription>
        </Alert>
        <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
          {t("back")}
        </Link>
      </div>
    );
  }

  if (data["membership_revoked_at"] || data["membership_rejected_at"]) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("revoked")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (data["membership_accepted_at"] || data["profile_id"]) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertDescription>{t("already_accepted")}</AlertDescription>
        </Alert>
        <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
          {t("go_home")}
        </Link>
      </div>
    );
  }

  if (data["membership_invite_expires_at"] && new Date(data["membership_invite_expires_at"]) <= new Date()) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("expired")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const orgName = data["organizations"]?.["organization_name"] ?? t("default_org");
  const tenantName = data["organizations"]?.["tenants"]?.["tenant_name"];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("join", { org: orgName })}</h2>
      {tenantName && <p className="text-muted-foreground text-center text-xs">{tenantName}</p>}
      <AcceptForm token={token} defaultEmail={data["membership_invite_email"] ?? ""} />
    </div>
  );
}
