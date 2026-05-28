import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { ArrowRight, Check, Fingerprint, IdCard, Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { EmailForm } from "./email-form";
import { PasskeysList } from "./passkeys-list";
import { PasswordForm } from "./password-form";
import { PhoneForm } from "./phone-form";

const SecuritySectionPageQuery = gql(`
  query SecuritySectionPageQuery {
    profile: viewer_profile {
      profile_id
      webauthn_credentialsCollection(
        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]
      ) {
        edges {
          node {
            webauthn_credential_id
            webauthn_credential_friendly_name
            webauthn_credential_device_type
            webauthn_credential_backup_state
            webauthn_credential_created_at
            webauthn_credential_last_used_at
          }
        }
      }
    }
  }
`);

export default async function SecurityPage(props: PageProps<"/[locale]/home/account/security">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth`);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: SecuritySectionPageQuery });
  const passkeys = data?.["profile"]?.["webauthn_credentialsCollection"]?.["edges"]?.map((e) => e["node"]) ?? [];

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasPasskey = passkeys.length > 0;

  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Cuenta · Seguridad</span>
        <h1 className="acc-section-title">Inicio de sesión</h1>
        <p className="acc-section-sub">
          Cómo entras a tu cuenta y los identificadores con los que te reconocemos. Te recomendamos tener al menos dos
          métodos activos.
        </p>
      </header>

      {/* Sign-in methods */}
      <div className="acc-group">
        <div className="acc-group-head">
          <span className="acc-group-title">Métodos para iniciar sesión</span>
        </div>

        <SecurityCard
          Icon={Fingerprint}
          title="Passkey"
          done={hasPasskey}
          desc={
            hasPasskey
              ? `${passkeys.length} passkey${passkeys.length === 1 ? "" : "s"} registrada${passkeys.length === 1 ? "" : "s"}`
              : "Sin passkey · agrega uno para entrar sin contraseña"
          }
          actionLabel={hasPasskey ? "Administrar" : "Agregar"}
          actionHref={`/${locale}/auth/onboarding/passkey`}
        />
        <PasskeysList passkeys={passkeys} />

        <SecurityCard
          Icon={Lock}
          title="Contraseña"
          done={hasPassword}
          desc={hasPassword ? "Contraseña configurada" : "Sin contraseña · agrega una para respaldo"}
          actionLabel={hasPassword ? "Cambiar" : "Crear"}
        >
          <PasswordForm hasPassword={hasPassword} />
        </SecurityCard>
      </div>

      {/* Identifiers */}
      <div className="acc-group">
        <div className="acc-group-head">
          <span className="acc-group-title">Identificadores verificados</span>
          <span className="acc-group-meta">Para recuperar tu cuenta y recibir códigos</span>
        </div>

        <SecurityCard
          Icon={Mail}
          title="Correo"
          done={hasEmail}
          desc={user["email"] ?? "Sin correo confirmado"}
          actionLabel="Cambiar"
        >
          <EmailForm currentEmail={user["email"] ?? null} />
        </SecurityCard>

        <SecurityCard
          Icon={Phone}
          title="Teléfono"
          done={hasPhone}
          desc={user["phone"] ? `+${user["phone"]}` : "Sin teléfono confirmado"}
          actionLabel={hasPhone ? "Cambiar" : "Agregar"}
        >
          <PhoneForm currentPhone={user["phone"] ? `+${user["phone"]}` : null} />
        </SecurityCard>

        <SecurityCard
          Icon={IdCard}
          title="Documento"
          done={false}
          desc="Próximamente — para firmar contratos y verificación KYC"
          actionLabel="—"
          disabled
        />
      </div>
    </div>
  );
}

function SecurityCard({
  Icon,
  title,
  done,
  desc,
  actionLabel,
  actionHref,
  disabled,
  children,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  done: boolean;
  desc: string;
  actionLabel: string;
  actionHref?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="ob-card"
      data-status={done ? "done" : "pending"}
      style={{ flexDirection: "column", alignItems: "stretch" }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", alignItems: "center", gap: 12, width: "100%" }}
      >
        <span className="ob-card-icon">
          <Icon size={16} />
        </span>
        <span className="ob-card-body">
          <span className="ob-card-row">
            <span className="ob-card-title">{title}</span>
            {done && (
              <span className="ob-card-badge ob-card-badge-done">
                <Check size={10} /> Listo
              </span>
            )}
          </span>
          <span className="ob-card-desc">{desc}</span>
        </span>
        <span className="ob-card-arrow">
          {actionHref ? (
            <Link href={actionHref} className="ob-card-cta">
              {actionLabel} <ArrowRight size={13} />
            </Link>
          ) : disabled ? (
            <span className="ob-card-cta" style={{ opacity: 0.5 }}>
              {actionLabel}
            </span>
          ) : null}
        </span>
      </div>
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}
