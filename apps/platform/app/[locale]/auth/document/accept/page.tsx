import { createServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { SINGLE } from "@packages/utils/array";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { AcceptForm } from "./accept-form";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        {children}
      </div>
    </AuthCard>
  );
}

export default async function AcceptInvitationPage(props: PageProps<"/[locale]/auth/document/accept">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const token = SINGLE(sp["token"]);

  if (!token) {
    return (
      <Shell>
        <Alert variant="destructive">
          <AlertDescription>Falta el token de invitación.</AlertDescription>
        </Alert>
      </Shell>
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
      <Shell>
        <Alert variant="destructive">
          <AlertDescription>Invitación no encontrada.</AlertDescription>
        </Alert>
        <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
          ← Volver
        </Link>
      </Shell>
    );
  }

  if (data["membership_revoked_at"] || data["membership_rejected_at"]) {
    return (
      <Shell>
        <Alert variant="destructive">
          <AlertDescription>Esta invitación fue cancelada.</AlertDescription>
        </Alert>
      </Shell>
    );
  }

  if (data["membership_accepted_at"] || data["profile_id"]) {
    return (
      <Shell>
        <Alert>
          <AlertDescription>Esta invitación ya fue aceptada. Inicia sesión normalmente.</AlertDescription>
        </Alert>
        <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
          Ir al inicio
        </Link>
      </Shell>
    );
  }

  if (data["membership_invite_expires_at"] && new Date(data["membership_invite_expires_at"]) <= new Date()) {
    return (
      <Shell>
        <Alert variant="destructive">
          <AlertDescription>Esta invitación expiró. Pide a tu empleador que te invite de nuevo.</AlertDescription>
        </Alert>
      </Shell>
    );
  }

  const orgName = data["organizations"]?.["organization_name"] ?? "una organización";
  const tenantName = data["organizations"]?.["tenants"]?.["tenant_name"];

  return (
    <Shell>
      <h2 className="text-center text-sm font-medium">Únete a {orgName}</h2>
      {tenantName && <p className="text-muted-foreground text-center text-xs">{tenantName}</p>}
      <AcceptForm token={token} defaultEmail={data["membership_invite_email"] ?? ""} />
    </Shell>
  );
}
