"use server";
import "server-only";

import { ENV } from "@packages/utils/env";
import { createFetch } from "@packages/utils/fetch";
import { URL_NEW } from "@packages/utils/url";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getGraphyServiceRole } from "~/lib/graphy/graphy.service";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:settings:tenant:sso:actions");

const createSchema = z.object({
  tenant_id: z.number().int().positive(),
  label: z.string().min(1).max(255),
  metadata_xml: z.string().min(1),
  domains: z.string().min(1),
});

const deleteSchema = z.object({
  tenant_id: z.number().int().positive(),
  sso_provider_id: z.string().min(1),
});

function SUPABASE_ADMIN_FETCH() {
  const key = ENV("SUPABASE_SERVICE_ROLE_KEY");
  return createFetch(URL_NEW("/auth/v1", ENV("NEXT_PUBLIC_SUPABASE_URL")), {
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
  });
}

function PARSE_DOMAINS(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

const CheckTenantPermissionQuery = gql(`
  query CheckTenantPermission($tenantId: Int!, $permissionId: String!) {
    viewerHasTenantPermission(tenantId: $tenantId, permissionId: $permissionId)
  }
`);

const InsertSsoProviderMutation = gql(`
  mutation InsertSsoProvider($tenantId: Int!, $ssoProviderId: String!, $label: String!, $domains: [String]!, $enabled: Boolean!) {
    insertIntoTenantSsoProvidersCollection(objects: [{
      tenantId: $tenantId
      ssoProviderId: $ssoProviderId
      ssoProviderLabel: $label
      ssoProviderDomains: $domains
      ssoProviderEnabled: $enabled
    }]) {
      affectedCount
    }
  }
`);

const DeleteSsoProviderMutation = gql(`
  mutation DeleteSsoProvider($tenantId: Int!, $ssoProviderId: String!) {
    deleteFromTenantSsoProvidersCollection(
      filter: { tenantId: { eq: $tenantId }, ssoProviderId: { eq: $ssoProviderId } }
      atMost: 1
    ) {
      affectedCount
    }
  }
`);

export const actionSSOProviderCreate = authedAction.inputSchema(createSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);

  const graphy = await getGraphySession();
  const { data: permData } = await graphy.query({
    query: CheckTenantPermissionQuery,
    variables: { tenantId: parsedInput["tenant_id"], permissionId: "tenant_manage" },
  });
  if (!permData?.["viewerHasTenantPermission"]) throw new TError("no_permission");

  const domains = PARSE_DOMAINS(parsedInput["domains"]);
  if (domains.length === 0) throw new TError("invalid_domains");

  // Register provider in Supabase GoTrue
  const gf = SUPABASE_ADMIN_FETCH();
  const res = await gf("/admin/sso/providers", {
    method: "POST",
    body: JSON.stringify({ type: "saml", metadata_xml: parsedInput["metadata_xml"], domains, attribute_mapping: {} }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    log.error("[actionSSOProviderCreate] GoTrue error: %o", body);
    throw new TError("gotrue_error");
  }

  const provider = (await res.json()) as { id: string };

  const graphyAdmin = getGraphyServiceRole();
  await graphyAdmin.mutate({
    query: InsertSsoProviderMutation,
    variables: {
      tenantId: parsedInput["tenant_id"],
      ssoProviderId: provider["id"],
      label: parsedInput["label"],
      domains,
      enabled: true,
    },
  });

  revalidatePath("/t");
});

export const actionSSOProviderDelete = authedAction.inputSchema(deleteSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);

  const graphy = await getGraphySession();
  const { data: permData } = await graphy.query({
    query: CheckTenantPermissionQuery,
    variables: { tenantId: parsedInput["tenant_id"], permissionId: "tenant_manage" },
  });
  if (!permData?.["viewerHasTenantPermission"]) throw new TError("no_permission");

  // Remove from GoTrue
  const gf = SUPABASE_ADMIN_FETCH();
  const res = await gf(`/admin/sso/providers/${parsedInput["sso_provider_id"]}`, { method: "DELETE" });

  if (!res.ok && res.status !== 404) {
    log.error("[actionSSOProviderDelete] GoTrue error: %o", { status: res.status });
    throw new TError("gotrue_error");
  }

  const graphyAdmin = getGraphyServiceRole();
  await graphyAdmin.mutate({
    query: DeleteSsoProviderMutation,
    variables: {
      tenantId: parsedInput["tenant_id"],
      ssoProviderId: parsedInput["sso_provider_id"],
    },
  });

  revalidatePath("/t");
});

const LOCALES = {
  es: {
    no_permission: "No tenés permiso para modificar la empresa.",
    invalid_domains: "Ingresá al menos un dominio válido.",
    gotrue_error: "Error al comunicarse con el proveedor de autenticación. Revisá el XML e intentá de nuevo.",
  },
  en: {
    no_permission: "You don't have permission to modify the company.",
    invalid_domains: "Enter at least one valid domain.",
    gotrue_error: "Error communicating with the auth provider. Check the XML and try again.",
  },
  pt: {
    no_permission: "Você não tem permissão para modificar a empresa.",
    invalid_domains: "Insira pelo menos um domínio válido.",
    gotrue_error: "Erro ao comunicar com o provedor de autenticação. Verifique o XML e tente novamente.",
  },
};
