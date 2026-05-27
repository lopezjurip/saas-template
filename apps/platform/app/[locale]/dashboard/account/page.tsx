import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDERS, type OAuthProviderId } from "~/app/[locale]/auth/providers";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { actionLinkProvider } from "./actions";
import { EmailForm } from "./email-form";
import { PasskeysSection } from "./passkeys-section";
import { PasswordForm } from "./password-form";
import { PhoneSection } from "./phone-section";
import { ProfileForm } from "./profile-form";
import { SessionsSection } from "./sessions-section";

const AccountPageQuery = gql(`
  query AccountPageQuery {
    profile: viewer_profile {
      profile_id
      profile_name_full
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

const OAUTH_PROVIDER_LABEL: Record<OAuthProviderId, string> = OAUTH_PROVIDERS.reduce(
  (acc, provider) => {
    acc[provider.id] = provider.label;
    return acc;
  },
  {} as Record<OAuthProviderId, string>,
);

function LABEL_FOR_PROVIDER(provider: string, t: (key: keyof typeof LOCALE_ES) => string): string {
  if (provider === "email") return t("provider_email");
  if (provider === "phone") return t("provider_phone");
  return OAUTH_PROVIDER_LABEL[provider as OAuthProviderId] ?? provider;
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const { error: errorParam } = await searchParams;
  const error = errorParam ? decodeURIComponent(errorParam) : null;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth`);

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: AccountPageQuery });
  const profile = data?.["profile"];
  const passkeys = profile?.["webauthn_credentialsCollection"]?.["edges"]?.map((edge) => edge["node"]) ?? [];

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const linkedProviderIds = new Set(identities.map((i) => i["provider"]));
  const unlinkedProviders = OAUTH_PROVIDERS.filter((p) => !linkedProviderIds.has(p.id));

  return (
    <main className="bg-muted flex min-h-svh items-start justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
            <Link href={`/${locale}/dashboard`}>
              <ChevronLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{user["email"]}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("profile_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("profile_description")}</p>
            </div>
            <ProfileForm profile_id={user.id} defaultValue={profile?.["profile_name_full"] ?? ""} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("email_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("email_description")}</p>
            </div>
            <EmailForm currentEmail={user["email"] ?? null} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("phone_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("phone_description")}</p>
            </div>
            <PhoneSection currentPhone={user["phone"] ? `+${user["phone"]}` : null} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("password_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("password_description")}</p>
            </div>
            <PasswordForm hasPassword={hasPassword} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("linked_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("linked_description")}</p>
            </div>
            {identities.length === 0 ? (
              <p className="text-muted-foreground text-xs">{t("no_linked")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {identities.map((identity) => (
                  <li
                    key={identity["identity_id"]}
                    className="border-border flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{LABEL_FOR_PROVIDER(identity["provider"], t)}</span>
                      {identity["identity_data"]?.["email"] ? (
                        <span className="text-muted-foreground text-xs">
                          {String(identity["identity_data"]["email"])}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {unlinkedProviders.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">{t("link_another")}</p>
                <div className="flex flex-wrap gap-2">
                  {unlinkedProviders.map((provider) => (
                    <form key={provider.id} action={actionLinkProvider}>
                      <input type="hidden" name="provider" value={provider.id} />
                      <Button type="submit" variant="outline" size="sm">
                        {t("link_provider", { provider: provider.label })}
                      </Button>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("passkeys_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("passkeys_description")}</p>
            </div>
            <PasskeysSection passkeys={passkeys ?? []} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("sessions_section")}</h2>
              <p className="text-muted-foreground text-xs">{t("sessions_description")}</p>
            </div>
            <SessionsSection />
          </section>
        </CardContent>

        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/auth/logout`}>{t("sign_out")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

const LOCALE_ES = {
  back: "Volver",
  title: "Tu cuenta",
  profile_section: "Perfil",
  profile_description: "El nombre que verán tus colegas en Humane.",
  email_section: "Correo electrónico",
  email_description: "Lo usamos para iniciar sesión y enviarte notificaciones importantes.",
  phone_section: "Teléfono",
  phone_description: "Para autenticación y notificaciones por WhatsApp.",
  password_section: "Contraseña",
  password_description: "Alternativa al passkey para iniciar sesión con correo.",
  linked_section: "Accesos vinculados",
  linked_description: "Métodos con los que puedes iniciar sesión en esta cuenta.",
  no_linked: "No hay accesos vinculados.",
  link_another: "Vincula otro proveedor para tener más formas de entrar.",
  link_provider: "Vincular {{provider}}",
  provider_email: "Correo y contraseña",
  provider_phone: "Teléfono",
  passkeys_section: "Passkeys",
  passkeys_description: "Usa tu huella, Face ID o llave de seguridad para entrar sin contraseña.",
  sessions_section: "Sesiones",
  sessions_description: "Tu sesión en este dispositivo está activa.",
  sign_out: "Cerrar sesión",
};

const LOCALE_EN: typeof LOCALE_ES = {
  back: "Back",
  title: "Your account",
  profile_section: "Profile",
  profile_description: "The name your colleagues will see in Humane.",
  email_section: "Email address",
  email_description: "We use it to sign in and send you important notifications.",
  phone_section: "Phone",
  phone_description: "For authentication and WhatsApp notifications.",
  password_section: "Password",
  password_description: "Alternative to passkey for signing in with email.",
  linked_section: "Linked access",
  linked_description: "Methods you can use to sign in to this account.",
  no_linked: "No linked access.",
  link_another: "Link another provider to have more ways to sign in.",
  link_provider: "Link {{provider}}",
  provider_email: "Email and password",
  provider_phone: "Phone",
  passkeys_section: "Passkeys",
  passkeys_description: "Use your fingerprint, Face ID or security key to sign in without a password.",
  sessions_section: "Sessions",
  sessions_description: "Your session on this device is active.",
  sign_out: "Sign out",
};

const LOCALE_PT: typeof LOCALE_ES = {
  back: "Voltar",
  title: "Sua conta",
  profile_section: "Perfil",
  profile_description: "O nome que seus colegas verão no Humane.",
  email_section: "Endereço de e-mail",
  email_description: "Usamos para entrar e enviar notificações importantes.",
  phone_section: "Telefone",
  phone_description: "Para autenticação e notificações pelo WhatsApp.",
  password_section: "Senha",
  password_description: "Alternativa ao passkey para entrar com e-mail.",
  linked_section: "Acessos vinculados",
  linked_description: "Métodos com os quais você pode entrar nesta conta.",
  no_linked: "Nenhum acesso vinculado.",
  link_another: "Vincule outro provedor para ter mais formas de entrar.",
  link_provider: "Vincular {{provider}}",
  provider_email: "E-mail e senha",
  provider_phone: "Telefone",
  passkeys_section: "Passkeys",
  passkeys_description: "Use sua impressão digital, Face ID ou chave de segurança para entrar sem senha.",
  sessions_section: "Sessões",
  sessions_description: "Sua sessão neste dispositivo está ativa.",
  sign_out: "Sair",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
