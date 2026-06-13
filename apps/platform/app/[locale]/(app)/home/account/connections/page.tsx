import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDERS } from "~/app/[locale]/auth/providers";
import { getRosetta } from "~/lib/i18n.server";
import { actionLinkProvider } from "../actions";

/**
 * Lists OAuth providers from the existing catalog and lets the user link new ones.
 * TODO once backend is ready: unlinking, per-provider last-activity, success/connected badges
 * driven by `auth.identities` joined to provider metadata.
 */
export default async function ConnectionsPage(props: PageProps<"/[locale]/home/account/connections">) {
  const sp = await props.searchParams;
  const user = await getSupabaseServerUser();
  if (!user) redirect("/[locale]/auth");
  const errorParam = SINGLE(sp["error"]);
  const error = errorParam ? decodeURIComponent(errorParam) : null;

  const identities = user["identities"] ?? [];
  const linkedIds = new Set(identities.map((i) => i["provider"]));

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>

      {error && (
        <div className="rounded-md border border-dashed bg-muted/25 p-3.5 text-center text-sm/normal text-muted-foreground">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {OAUTH_PROVIDERS.map((p) => {
          const isLinked = linkedIds.has(p.id);
          const identity = identities.find((i) => i["provider"] === p.id);
          const email = identity?.["identity_data"]?.["email"] as string | undefined;
          const Mark = p.Mark;
          return (
            <div
              key={p.id}
              className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border bg-background px-3.5 py-3"
              data-connected={isLinked ? "true" : "false"}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg border bg-background text-foreground">
                <Mark size={20} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                  <span>{p.label}</span>
                  {isLinked && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-500/35 bg-emerald-500/10 px-1.5 py-0.5 text-tiny font-semibold uppercase tracking-[0.02em] text-emerald-600">
                      {t("linked_badge")}
                    </span>
                  )}
                </span>
                <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {isLinked ? (
                    <>
                      <span>{email ?? t("linked_fallback")}</span>
                      <span className="opacity-50">·</span>
                      <span>{t("last_activity")}</span>
                    </>
                  ) : (
                    t("not_linked")
                  )}
                </span>
              </div>
              <div className="inline-flex gap-1.5">
                {isLinked ? (
                  <span className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium text-muted-foreground opacity-60">
                    {t("unlink_soon")}
                  </span>
                ) : (
                  <form action={actionLinkProvider}>
                    <input type="hidden" name="provider" value={p.id} />
                    <Button type="submit" variant="outline" className="h-8 text-xs">
                      {t("link")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Cuenta · Conexiones",
  heading: "Cuentas vinculadas",
  description:
    "Vincula proveedores externos para iniciar sesión con un clic. Vincular un proveedor también agrega su correo como identificador verificado.",
  linked_badge: "Vinculada",
  linked_fallback: "Vinculada",
  last_activity: "Última actividad: hace 3 días",
  not_linked: "Aún no vinculada",
  unlink_soon: "Desvincular (próx.)",
  link: "Vincular",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Account · Connections",
  heading: "Linked accounts",
  description:
    "Link external providers to sign in with one click. Linking a provider also adds its email as a verified identifier.",
  linked_badge: "Linked",
  linked_fallback: "Linked",
  last_activity: "Last activity: 3 days ago",
  not_linked: "Not linked yet",
  unlink_soon: "Unlink (soon)",
  link: "Link",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Conta · Conexões",
  heading: "Contas vinculadas",
  description:
    "Vincule provedores externos para entrar com um clique. Vincular um provedor também adiciona o e-mail como identificador verificado.",
  linked_badge: "Vinculada",
  linked_fallback: "Vinculada",
  last_activity: "Última atividade: há 3 dias",
  not_linked: "Ainda não vinculada",
  unlink_soon: "Desvincular (em breve)",
  link: "Vincular",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
