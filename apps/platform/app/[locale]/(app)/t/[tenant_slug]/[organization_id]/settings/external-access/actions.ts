"use server";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRosetta } from "~/hooks/get-rosetta";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("settings:external-access");

/**
 * Read-visibility for agencies is keyed on permission '*' (the catalog has no
 * read-only capability slugs and the data-table RLS only checks '*'). So an
 * org "grants an agency access" by inserting (agency_id, organization_id, '*').
 */
const GRANT_PERMISSION = "*";

const baseSchema = z.object({
  organization_id: z.number().int().positive(),
  agency_id: z.string().uuid(),
});

const grantAgencyAccessSchema = baseSchema;
type GrantAgencyAccessValues = z.infer<typeof grantAgencyAccessSchema>;

/**
 * Grant or revoke an agency's read access to one organization. The caller must hold
 * `organization_manage` on that org (viewer-scoped check via the RLS server client),
 * then the write goes through the service-role admin client (grants are service_role-only).
 */
export const actionGrantAgencyAccess = authedAction
  .inputSchema(grantAgencyAccessSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { TError } = await getRosetta(LOCALES);

    const { data: canManage } = await supabase
      .rpc("viewer_has_permission", {
        organization_id: parsedInput.organization_id,
        permission_id: "organization_manage",
      })
      .throwOnError();
    if (!canManage) {
      throw new TError("no_permission");
    }

    const admin = createServiceRoleClient();

    const agencyRes = await admin
      .from("agencies")
      .select("agency_id")
      .eq("agency_id", parsedInput.agency_id)
      .maybeSingle();
    if (!agencyRes.data) {
      throw new TError("agency_not_found");
    }

    const insertRes = await admin
      .from("agencies_organizations_grants")
      .insert({
        agency_id: parsedInput.agency_id,
        organization_id: parsedInput.organization_id,
        permission_id: GRANT_PERMISSION,
      })
      .select("agencies_organizations_grant_id")
      .single();

    if (insertRes.error) {
      if (insertRes.error.code === "23505") {
        throw new TError("already_granted");
      }
      log.error("[actionGrantAgencyAccess] grant insert failed", {
        profile_id: user.id,
        organization_id: parsedInput.organization_id,
        agency_id: parsedInput.agency_id,
        error: insertRes.error,
      });
      throw new TError("grant_failed");
    }

    const locale = await getServerLocale();
    revalidatePath(`/${locale}/t`);
    return { agencies_organizations_grant_id: insertRes.data.agencies_organizations_grant_id };
  });

const revokeAgencyAccessSchema = baseSchema;
type RevokeAgencyAccessValues = z.infer<typeof revokeAgencyAccessSchema>;

export const actionRevokeAgencyAccess = authedAction
  .inputSchema(revokeAgencyAccessSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { TError } = await getRosetta(LOCALES);

    const { data: canManage } = await supabase
      .rpc("viewer_has_permission", {
        organization_id: parsedInput.organization_id,
        permission_id: "organization_manage",
      })
      .throwOnError();
    if (!canManage) {
      throw new TError("no_permission");
    }

    const admin = createServiceRoleClient();

    /**
     * Only org-scoped grants can be revoked here. Global grants (organization_id IS NULL)
     * are platform-managed and never touched from the org settings surface.
     */
    const deleteRes = await admin
      .from("agencies_organizations_grants")
      .delete()
      .eq("agency_id", parsedInput.agency_id)
      .eq("organization_id", parsedInput.organization_id);

    if (deleteRes.error) {
      log.error("[actionRevokeAgencyAccess] grant delete failed", {
        profile_id: user.id,
        organization_id: parsedInput.organization_id,
        agency_id: parsedInput.agency_id,
        error: deleteRes.error,
      });
      throw new TError("revoke_failed");
    }

    const locale = await getServerLocale();
    revalidatePath(`/${locale}/t`);
    return { agency_id: parsedInput.agency_id };
  });

const LOCALE_ES = {
  no_permission: "No tienes permiso para administrar el acceso externo de esta organización",
  agency_not_found: "Agencia no encontrada",
  already_granted: "Esa agencia ya tiene acceso a esta organización",
  grant_failed: "No pudimos otorgar el acceso",
  revoke_failed: "No pudimos revocar el acceso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  no_permission: "You don't have permission to manage external access for this organization",
  agency_not_found: "Agency not found",
  already_granted: "That agency already has access to this organization",
  grant_failed: "We couldn't grant access",
  revoke_failed: "We couldn't revoke access",
};

const LOCALE_PT: typeof LOCALE_ES = {
  no_permission: "Você não tem permissão para administrar o acesso externo desta organização",
  agency_not_found: "Agência não encontrada",
  already_granted: "Essa agência já tem acesso a esta organização",
  grant_failed: "Não conseguimos conceder o acesso",
  revoke_failed: "Não conseguimos revogar o acesso",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
