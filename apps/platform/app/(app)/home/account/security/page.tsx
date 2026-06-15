import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Fingerprint, IdCard, Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { UNSAFE_ROUTE } from "~/lib/route";
import { EmailForm } from "./email-form";
import { PasskeysList } from "./passkeys-list";
import { PasswordForm } from "./password-form";
import { PhoneForm } from "./phone-form";

export default async function SecurityPage(props: PageProps<"/home/account/security">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const supabase = await createSupabaseServerClient();
  const { data: passkeyData } = await supabase.auth.passkey.list();
  const passkeys = passkeyData ?? [];

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasPasskey = passkeys.length > 0;

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-[0.08em] uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      {/* Sign-in methods */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 py-1">
          <span className="text-foreground text-sm/normal font-medium">{t("sign_in_methods")}</span>
        </div>

        <SecurityCard
          Icon={Fingerprint}
          title={t("passkey_title")}
          done={hasPasskey}
          doneLabel={t("done_label")}
          desc={hasPasskey ? t("passkey_count", { n: passkeys.length }) : t("passkey_no")}
          actionLabel={hasPasskey ? t("passkey_manage") : t("passkey_add")}
          actionHref="/auth/onboarding/passkey"
        />
        <PasskeysList passkeys={passkeys} />

        <SecurityCard
          Icon={Lock}
          title={t("password_title")}
          done={hasPassword}
          doneLabel={t("done_label")}
          desc={hasPassword ? t("password_set") : t("password_no")}
          actionLabel={hasPassword ? t("password_change") : t("password_create")}
        >
          <PasswordForm hasPassword={hasPassword} />
        </SecurityCard>
      </div>

      {/* Identifiers */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 py-1">
          <span className="text-foreground text-sm/normal font-medium">{t("identifiers")}</span>
          <span className="text-muted-foreground text-xs">{t("identifiers_hint")}</span>
        </div>

        <SecurityCard
          Icon={Mail}
          title={t("email_title")}
          done={hasEmail}
          doneLabel={t("done_label")}
          desc={user["email"] ?? t("email_no")}
          actionLabel={t("email_change")}
        >
          <EmailForm currentEmail={user["email"] ?? null} />
        </SecurityCard>

        <SecurityCard
          Icon={Phone}
          title={t("phone_title")}
          done={hasPhone}
          doneLabel={t("done_label")}
          desc={user["phone"] ? `+${user["phone"]}` : t("phone_no")}
          actionLabel={hasPhone ? t("phone_change") : t("phone_add")}
        >
          <PhoneForm currentPhone={user["phone"] ? `+${user["phone"]}` : null} />
        </SecurityCard>

        <SecurityCard
          Icon={IdCard}
          title={t("document_title")}
          done={false}
          doneLabel={t("done_label")}
          desc={t("document_desc")}
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
  doneLabel,
  desc,
  actionLabel,
  actionHref,
  disabled,
  children,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  done: boolean;
  doneLabel: string;
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
            "inline-flex size-9 items-center justify-center rounded-lg",
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
              <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border px-[5px] py-px text-tiny font-semibold tracking-[0.02em] uppercase">
                <Check size={10} /> {doneLabel}
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-xs leading-snug text-pretty">{desc}</span>
        </span>
        <span className="inline-flex items-center justify-end self-center">
          {actionHref ? (
            <Link
              href={UNSAFE_ROUTE(actionHref)}
              className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
            >
              {actionLabel} <ArrowRight size={13} />
            </Link>
          ) : disabled ? (
            <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap opacity-50">
              {actionLabel}
            </span>
          ) : null}
        </span>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Cuenta · Seguridad",
  heading: "Inicio de sesión",
  description:
    "Cómo entras a tu cuenta y los identificadores con los que te reconocemos. Te recomendamos tener al menos dos métodos activos.",
  sign_in_methods: "Métodos para iniciar sesión",
  identifiers: "Identificadores verificados",
  identifiers_hint: "Para recuperar tu cuenta y recibir códigos",
  // passkey card
  passkey_title: "Passkey",
  passkey_no: "Sin passkey · agrega uno para entrar sin contraseña",
  passkey_count: (p: { n: number }) => `${p.n} passkey${p.n === 1 ? "" : "s"} registrada${p.n === 1 ? "" : "s"}`,
  passkey_manage: "Administrar",
  passkey_add: "Agregar",
  // done badge
  done_label: "Listo",
  // password card
  password_title: "Contraseña",
  password_set: "Contraseña configurada",
  password_no: "Sin contraseña · agrega una para respaldo",
  password_change: "Cambiar",
  password_create: "Crear",
  // email card
  email_title: "Correo",
  email_no: "Sin correo confirmado",
  email_change: "Cambiar",
  // phone card
  phone_title: "Teléfono",
  phone_no: "Sin teléfono confirmado",
  phone_change: "Cambiar",
  phone_add: "Agregar",
  // document card
  document_title: "Documento",
  document_desc: "Próximamente — para firmar contratos y verificación KYC",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Account · Security",
  heading: "Sign in",
  description:
    "How you access your account and the identifiers we use to recognize you. We recommend having at least two active methods.",
  sign_in_methods: "Sign-in methods",
  identifiers: "Verified identifiers",
  identifiers_hint: "To recover your account and receive codes",
  passkey_title: "Passkey",
  passkey_no: "No passkey · add one to sign in without a password",
  passkey_count: (p: { n: number }) => `${p.n} passkey${p.n === 1 ? "" : "s"} registered`,
  passkey_manage: "Manage",
  passkey_add: "Add",
  done_label: "Done",
  password_title: "Password",
  password_set: "Password set",
  password_no: "No password · add one as a backup",
  password_change: "Change",
  password_create: "Create",
  email_title: "Email",
  email_no: "No confirmed email",
  email_change: "Change",
  phone_title: "Phone",
  phone_no: "No confirmed phone",
  phone_change: "Change",
  phone_add: "Add",
  document_title: "ID document",
  document_desc: "Coming soon — for signing contracts and KYC verification",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Conta · Segurança",
  heading: "Entrar",
  description:
    "Como você acessa sua conta e os identificadores que usamos para reconhecê-lo. Recomendamos ter pelo menos dois métodos ativos.",
  sign_in_methods: "Métodos de entrada",
  identifiers: "Identificadores verificados",
  identifiers_hint: "Para recuperar sua conta e receber códigos",
  passkey_title: "Passkey",
  passkey_no: "Sem passkey · adicione um para entrar sem senha",
  passkey_count: (p: { n: number }) => `${p.n} passkey${p.n === 1 ? "" : "s"} registrada${p.n === 1 ? "" : "s"}`,
  passkey_manage: "Gerenciar",
  passkey_add: "Adicionar",
  done_label: "Pronto",
  password_title: "Senha",
  password_set: "Senha configurada",
  password_no: "Sem senha · adicione uma como backup",
  password_change: "Alterar",
  password_create: "Criar",
  email_title: "E-mail",
  email_no: "Sem e-mail confirmado",
  email_change: "Alterar",
  phone_title: "Telefone",
  phone_no: "Sem telefone confirmado",
  phone_change: "Alterar",
  phone_add: "Adicionar",
  document_title: "Documento",
  document_desc: "Em breve — para assinar contratos e verificação KYC",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
