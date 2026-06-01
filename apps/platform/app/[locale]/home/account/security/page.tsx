import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
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
  if (!user) redirect("/[locale]/auth");

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: SecuritySectionPageQuery });
  const passkeys = data?.["profile"]?.["webauthn_credentialsCollection"]?.["edges"]?.map((e) => e["node"]) ?? [];

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasPasskey = passkeys.length > 0;

  return (
    <div className="flex max-w-[720px] flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase">
          Cuenta · Seguridad
        </span>
        <h1 className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">Inicio de sesión</h1>
        <p className="text-muted-foreground text-[13px] leading-relaxed text-pretty">
          Cómo entras a tu cuenta y los identificadores con los que te reconocemos. Te recomendamos tener al menos dos
          métodos activos.
        </p>
      </header>

      {/* Sign-in methods */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 py-1">
          <span className="text-foreground text-[13px] font-medium">Métodos para iniciar sesión</span>
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
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 py-1">
          <span className="text-foreground text-[13px] font-medium">Identificadores verificados</span>
          <span className="text-muted-foreground text-xs">Para recuperar tu cuenta y recibir códigos</span>
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
      className={cn(
        "flex flex-col items-stretch rounded-md border px-3.5 py-3",
        done ? "bg-muted/35" : "bg-background",
      )}
    >
      <div className="grid w-full grid-cols-[36px_1fr_auto] items-center gap-3">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-[9px]",
            done ? "bg-foreground text-background" : "bg-muted text-foreground",
          )}
        >
          <Icon size={16} />
        </span>
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className={cn("text-sm font-medium", done ? "text-muted-foreground" : "text-foreground")}>
              {title}
            </span>
            {done && (
              <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border px-[5px] py-px text-[10px] font-semibold tracking-[0.02em] uppercase">
                <Check size={10} /> Listo
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-[12.5px] leading-snug text-pretty">{desc}</span>
        </span>
        <span className="inline-flex items-center justify-end self-center">
          {actionHref ? (
            <Link
              href={actionHref}
              className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap"
            >
              {actionLabel} <ArrowRight size={13} />
            </Link>
          ) : disabled ? (
            <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap opacity-50">
              {actionLabel}
            </span>
          ) : null}
        </span>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
