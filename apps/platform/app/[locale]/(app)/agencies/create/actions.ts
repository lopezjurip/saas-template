"use server";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { SLUGIFY } from "@packages/utils/slug";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRosetta } from "~/hooks/get-rosetta";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("agencies:create");

const createAgencySchema = z.object({
  agency_name: z.string().trim().min(1).max(100),
  agency_slug: z.string().trim().min(3).max(40),
});

type CreateAgencyValues = z.infer<typeof createAgencySchema>;

/**
 * Creates a new agency.
 *
 * Any authenticated user can create an agency; the creator becomes the first
 * ACCEPTED affiliate. Agency tables are service_role-only in RLS, so we use the
 * admin client and gate authz here in the action.
 */
export const actionCreateAgency = authedAction
  .inputSchema(createAgencySchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { TError } = await getRosetta(LOCALES);
    const admin = createServiceRoleClient();

    const slug = SLUGIFY(parsedInput.agency_slug).slice(0, 40);
    if (slug.length < 3) {
      throw new TError("slug_invalid");
    }

    // Reject duplicate slug up-front for a friendly error (the unique index is the
    // real guard).
    const dup = await admin.from("agencies").select("agency_id").eq("agency_slug", slug).maybeSingle();
    if (dup.data) {
      throw new TError("slug_taken");
    }

    const insertRes = await admin
      .from("agencies")
      .insert({ agency_name: parsedInput.agency_name.trim(), agency_slug: slug })
      .select("agency_id, agency_slug")
      .single();

    if (insertRes.error || !insertRes.data) {
      log.error("[actionCreateAgency] agency insert failed", { profile_id: user.id, error: insertRes.error });
      if (insertRes.error?.code === "23505") {
        throw new TError("slug_taken");
      }
      throw new TError("create_failed");
    }

    const membershipRes = await admin
      .from("agency_memberships")
      .insert({
        agency_id: insertRes.data.agency_id,
        profile_id: user.id,
        agency_membership_accepted_at: new Date().toISOString(),
      })
      .select("agency_membership_id")
      .single();

    if (membershipRes.error) {
      log.error("[actionCreateAgency] creator membership insert failed", {
        profile_id: user.id,
        agency_id: insertRes.data.agency_id,
        error: membershipRes.error,
      });
      throw new TError("create_failed");
    }

    const locale = await getServerLocale();
    revalidatePath(`/${locale}/admin/agencies`);
    return { agency_id: insertRes.data.agency_id, agency_slug: insertRes.data.agency_slug };
  });

const LOCALE_ES = {
  slug_invalid: "El identificador debe tener al menos 3 caracteres",
  slug_taken: "Ya existe una agencia con ese identificador",
  create_failed: "No pudimos crear la agencia",
};

const LOCALE_EN: typeof LOCALE_ES = {
  slug_invalid: "The identifier must be at least 3 characters long",
  slug_taken: "An agency with that identifier already exists",
  create_failed: "We couldn't create the agency",
};

const LOCALE_PT: typeof LOCALE_ES = {
  slug_invalid: "O identificador deve ter pelo menos 3 caracteres",
  slug_taken: "Já existe uma agência com esse identificador",
  create_failed: "Não conseguimos criar a agência",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
