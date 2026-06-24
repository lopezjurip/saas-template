"use server";
import "server-only";

import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { ENV } from "@packages/utils/env";
import { createFetch } from "@packages/utils/fetch";
import { URL_NEW } from "@packages/utils/url";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
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

export const actionSSOProviderCreate = authedAction
  .inputSchema(createSchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { TError } = await getRosetta(LOCALES);

    const { data: canManage } = await supabase.rpc("viewer_has_tenant_permission", {
      tenant_id: parsedInput["tenant_id"],
      permission_id: "tenant_manage",
    });
    if (!canManage) throw new TError("no_permission");

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

    // Store mapping in our DB (service role bypasses RLS for inserts)
    const admin = createSupabaseServiceRoleClient();
    await admin
      .from("tenant_sso_providers")
      .insert({
        tenant_id: parsedInput["tenant_id"],
        sso_provider_id: provider["id"],
        sso_provider_label: parsedInput["label"],
        sso_provider_domains: domains,
        sso_provider_enabled: true,
      })
      .throwOnError();

    revalidatePath("/t");
  });

export const actionSSOProviderDelete = authedAction
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { TError } = await getRosetta(LOCALES);

    const { data: canManage } = await supabase.rpc("viewer_has_tenant_permission", {
      tenant_id: parsedInput["tenant_id"],
      permission_id: "tenant_manage",
    });
    if (!canManage) throw new TError("no_permission");

    const admin = createSupabaseServiceRoleClient();

    // Remove from GoTrue
    const gf = SUPABASE_ADMIN_FETCH();
    const res = await gf(`/admin/sso/providers/${parsedInput["sso_provider_id"]}`, { method: "DELETE" });

    if (!res.ok && res.status !== 404) {
      log.error("[actionSSOProviderDelete] GoTrue error: %o", { status: res.status });
      throw new TError("gotrue_error");
    }

    await admin
      .from("tenant_sso_providers")
      .delete()
      .eq("tenant_id", parsedInput["tenant_id"])
      .eq("sso_provider_id", parsedInput["sso_provider_id"])
      .throwOnError();

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
