"use client";

// Local component — used only in /oauth/consent/page.tsx

import { useSupabase } from "@packages/supabase/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { useEffect, useState, useTransition } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";

const log = debug("oauth:consent");

type OAuthAuthorizationDetails = {
  authorization_id: string;
  client: {
    id: string;
    name: string;
    uri: string;
    logo_uri: string;
  };
  user: { id: string; email: string };
  scope: string;
};

type Props = {
  /** The authorization_id from the query string, or null if missing. */
  authorization_id: string | null;
};

/**
 * OAuth consent UI — displays requesting client name + scopes, approve/deny buttons.
 * Calls supabase.auth.oauth.{getAuthorizationDetails,approveAuthorization,denyAuthorization}.
 * @example <ConsentClient authorization_id="abc-123" />
 */
export function ConsentClient({ authorization_id }: Props) {
  const { t } = useRosetta(LOCALES);

  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  // Error keys — translated at render time via t() so useEffect stays dep-free on t.
  const [loadError, setLoadError] = useState<keyof typeof LOCALE_EN | null>(null);
  const [actionError, setActionError] = useState<keyof typeof LOCALE_EN | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const [approvePending, startApproveTransition] = useTransition();
  const [denyPending, startDenyTransition] = useTransition();

  useEffect(() => {
    if (!authorization_id) {
      setLoading(false);
      return;
    }

    async function loadDetails() {
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorization_id!);
      if (error) {
        log.error("[ConsentClient] getAuthorizationDetails failed: %o", { error });
        // Use a sentinel string — the render path translates it via t().
        setLoadError("error_load");
        setLoading(false);
        return;
      }
      // If already consented, Supabase returns a redirect URL directly.
      if ("redirect_url" in data) {
        window.location.href = data["redirect_url"];
        return;
      }
      // Otherwise it returns OAuthAuthorizationDetails — needs consent.
      setDetails(data as OAuthAuthorizationDetails);
      setLoading(false);
    }

    void loadDetails();
  }, [authorization_id]);

  function onApprove() {
    if (!authorization_id) return;
    setActionError(null);
    startApproveTransition(async () => {
      const { data, error } = await supabase.auth.oauth.approveAuthorization(authorization_id, {
        skipBrowserRedirect: true,
      });
      if (error || !data) {
        log.error("[ConsentClient] approveAuthorization failed: %o", { error });
        setActionError("error_approve");
        return;
      }
      window.location.href = data["redirect_url"];
    });
  }

  function onDeny() {
    if (!authorization_id) return;
    setActionError(null);
    startDenyTransition(async () => {
      const { data, error } = await supabase.auth.oauth.denyAuthorization(authorization_id, {
        skipBrowserRedirect: true,
      });
      if (error || !data) {
        log.error("[ConsentClient] denyAuthorization failed: %o", { error });
        setActionError("error_deny");
        return;
      }
      window.location.href = data["redirect_url"];
    });
  }

  // Missing authorization_id.
  if (!authorization_id) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("error_title")}</CardTitle>
            <CardDescription>{t("error_missing_id")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Loading.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("loading_title")}</CardTitle>
            <CardDescription>{t("loading_desc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Load error.
  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("error_title")}</CardTitle>
            <CardDescription>{t(loadError)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Consent form.
  const clientName = details?.["client"]?.["name"] ?? t("unknown_client");
  const scopes = details?.["scope"]?.split(" ").filter(Boolean) ?? [];

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description_prefix")} <strong className="font-semibold text-foreground">{clientName}</strong>{" "}
            {t("description_suffix")}
          </CardDescription>
        </CardHeader>

        {scopes.length > 0 && (
          <CardContent>
            <p className="mb-2 text-sm font-medium text-foreground">{t("scopes_label")}</p>
            <ul className="flex flex-col gap-1">
              {scopes.map((scope) => (
                <li key={scope} className="text-sm text-muted-foreground">
                  · {scope}
                </li>
              ))}
            </ul>
          </CardContent>
        )}

        {actionError && (
          <CardContent>
            <p className="text-sm text-destructive">{t(actionError)}</p>
          </CardContent>
        )}

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onDeny}
            disabled={approvePending || denyPending}
            className="flex-1"
          >
            {denyPending ? t("denying") : t("deny")}
          </Button>
          <Button type="button" onClick={onApprove} disabled={approvePending || denyPending} className="flex-1">
            {approvePending ? t("approving") : t("approve")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const LOCALE_ES = {
  title: "Autorizar acceso",
  loading_title: "Cargando…",
  loading_desc: "Obteniendo detalles de la solicitud.",
  error_title: "Algo salió mal",
  error_missing_id: "No se encontró el identificador de autorización en la URL.",
  error_load: "No pudimos obtener los detalles de la solicitud. Intenta de nuevo.",
  error_approve: "No pudimos aprobar la solicitud. Intenta de nuevo.",
  error_deny: "No pudimos rechazar la solicitud. Intenta de nuevo.",
  description_prefix: "La aplicación",
  description_suffix: "solicita acceso a tu cuenta.",
  unknown_client: "una aplicación desconocida",
  scopes_label: "Permisos solicitados:",
  approve: "Autorizar",
  approving: "Autorizando…",
  deny: "Rechazar",
  denying: "Rechazando…",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Authorize access",
  loading_title: "Loading…",
  loading_desc: "Fetching request details.",
  error_title: "Something went wrong",
  error_missing_id: "Authorization ID not found in the URL.",
  error_load: "We couldn't fetch the request details. Please try again.",
  error_approve: "We couldn't approve the request. Please try again.",
  error_deny: "We couldn't deny the request. Please try again.",
  description_prefix: "The application",
  description_suffix: "is requesting access to your account.",
  unknown_client: "an unknown application",
  scopes_label: "Requested permissions:",
  approve: "Authorize",
  approving: "Authorizing…",
  deny: "Deny",
  denying: "Denying…",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Autorizar acesso",
  loading_title: "A carregar…",
  loading_desc: "A obter detalhes do pedido.",
  error_title: "Algo correu mal",
  error_missing_id: "Identificador de autorização não encontrado no URL.",
  error_load: "Não foi possível obter os detalhes do pedido. Tente novamente.",
  error_approve: "Não foi possível aprovar o pedido. Tente novamente.",
  error_deny: "Não foi possível rejeitar o pedido. Tente novamente.",
  description_prefix: "A aplicação",
  description_suffix: "está a solicitar acesso à sua conta.",
  unknown_client: "uma aplicação desconhecida",
  scopes_label: "Permissões solicitadas:",
  approve: "Autorizar",
  approving: "A autorizar…",
  deny: "Rejeitar",
  denying: "A rejeitar…",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
