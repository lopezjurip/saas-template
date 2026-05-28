import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDERS } from "~/app/[locale]/auth/providers";
import { actionLinkProvider } from "../actions";

// Real-ish: lists OAuth providers from the existing catalog and lets the user link new ones.
// TODO once backend is ready: unlinking, per-provider last-activity, success/connected badges
// driven by `auth.identities` joined to provider metadata.

export default async function ConnectionsPage(props: PageProps<"/[locale]/home/account/connections">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth`);
  const errorParam = SINGLE(sp["error"]);
  const error = errorParam ? decodeURIComponent(errorParam) : null;

  const identities = user["identities"] ?? [];
  const linkedIds = new Set(identities.map((i) => i["provider"]));

  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Cuenta · Conexiones</span>
        <h1 className="acc-section-title">Cuentas vinculadas</h1>
        <p className="acc-section-sub">
          Vincula proveedores externos para iniciar sesión con un clic. Vincular un proveedor también agrega su correo
          como identificador verificado.
        </p>
      </header>

      {error && <div className="acc-todo">{error}</div>}

      <div className="ob-list">
        {OAUTH_PROVIDERS.map((p) => {
          const isLinked = linkedIds.has(p.id);
          const identity = identities.find((i) => i["provider"] === p.id);
          const email = identity?.["identity_data"]?.["email"] as string | undefined;
          return (
            <div key={p.id} className="acc-row" data-connected={isLinked ? "true" : "false"}>
              <span className="acc-row-icon">·</span>
              <div className="acc-row-body">
                <span className="acc-row-title">
                  <span>{p.label}</span>
                  {isLinked && <span className="acc-badge success">Vinculada</span>}
                </span>
                <span className="acc-row-sub">{isLinked ? (email ?? "Vinculada") : "Aún no vinculada"}</span>
              </div>
              <div className="acc-row-actions">
                {isLinked ? (
                  <span className="acc-row-btn ghost" style={{ opacity: 0.6 }}>
                    Desvincular (próx.)
                  </span>
                ) : (
                  <form action={actionLinkProvider}>
                    <input type="hidden" name="provider" value={p.id} />
                    <button type="submit" className="acc-row-btn">
                      Vincular
                    </button>
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
