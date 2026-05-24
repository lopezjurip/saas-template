import { getSupabaseServerSession, getSupabaseServerUser } from "@packages/supabase/client.server";
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
import { createGraphy } from "~/lib/graphy/graphy.browser";
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

function LABEL_FOR_PROVIDER(provider: string): string {
  if (provider === "email") return "Correo y contraseña";
  if (provider === "phone") return "Teléfono";
  return OAUTH_PROVIDER_LABEL[provider as OAuthProviderId] ?? provider;
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [user, session] = await Promise.all([getSupabaseServerUser(), getSupabaseServerSession()]);
  if (!user) redirect(`/${locale}/auth`);

  const graphy = createGraphy(session);
  const { data } = await graphy.query({ query: AccountPageQuery });
  const profile = data?.["profile"];
  const passkeys = profile?.["webauthn_credentialsCollection"]?.["edges"]?.map((edge) => edge["node"]) ?? [];

  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");

  return (
    <main className="bg-muted flex min-h-svh items-start justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground w-fit -ml-2">
            <Link href={`/${locale}/dashboard`}>
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <CardTitle>Tu cuenta</CardTitle>
          <CardDescription>{user["email"]}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Perfil</h2>
              <p className="text-muted-foreground text-xs">El nombre que verán tus colegas en Humane.</p>
            </div>
            <ProfileForm defaultValue={profile?.["profile_name_full"] ?? ""} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Correo electrónico</h2>
              <p className="text-muted-foreground text-xs">
                Lo usamos para iniciar sesión y enviarte notificaciones importantes.
              </p>
            </div>
            <EmailForm currentEmail={user["email"] ?? null} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Teléfono</h2>
              <p className="text-muted-foreground text-xs">Para autenticación y notificaciones por WhatsApp.</p>
            </div>
            <PhoneSection currentPhone={user["phone"] ? `+${user["phone"]}` : null} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Contraseña</h2>
              <p className="text-muted-foreground text-xs">Alternativa al passkey para iniciar sesión con correo.</p>
            </div>
            <PasswordForm hasPassword={hasPassword} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Accesos vinculados</h2>
              <p className="text-muted-foreground text-xs">Métodos con los que puedes iniciar sesión en esta cuenta.</p>
            </div>
            {identities.length === 0 ? (
              <p className="text-muted-foreground text-xs">No hay accesos vinculados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {identities.map((identity) => (
                  <li
                    key={identity["identity_id"]}
                    className="border-border flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{LABEL_FOR_PROVIDER(identity["provider"])}</span>
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
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Passkeys</h2>
              <p className="text-muted-foreground text-xs">
                Usa tu huella, Face ID o llave de seguridad para entrar sin contraseña.
              </p>
            </div>
            <PasskeysSection passkeys={passkeys ?? []} />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Sesiones</h2>
              <p className="text-muted-foreground text-xs">Tu sesión en este dispositivo está activa.</p>
            </div>
            <SessionsSection />
          </section>
        </CardContent>

        <CardFooter>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/auth/logout`}>Cerrar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
