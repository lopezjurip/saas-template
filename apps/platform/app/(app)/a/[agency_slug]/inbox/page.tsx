import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { SINGLE } from "@packages/utils/array";
import { notFound } from "next/navigation";
import { InboxList } from "~/components/inbox/inbox-list";
import { IS_ACTIVE_MEMBERSHIP } from "~/lib/agencies";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

export async function generateMetadata(props: PageProps<"/a/[agency_slug]/inbox">) {
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);
  return { title: t("title") };
}

export default async function AgencyInboxPage(props: PageProps<"/a/[agency_slug]/inbox">) {
  const { agency_slug } = await props.params;
  const sp = await props.searchParams;
  const filter = (SINGLE(sp["filter"]) ?? "open") as "open" | "archived";

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceRoleClient();

  const agencyRes = await admin
    .from("agencies")
    .select("agency_id, agency_slug")
    .eq("agency_slug", agency_slug)
    .maybeSingle();
  if (!agencyRes.data) notFound();
  const agency = agencyRes.data;

  // Gate: must be an active affiliate of this agency.
  const membershipsRes = await admin
    .from("agency_memberships")
    .select(
      "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at",
    )
    .eq("agency_id", agency["agency_id"]);

  const memberships = membershipsRes.data ?? [];
  const viewerIsActive = memberships.some((m) => user && m["profile_id"] === user.id && IS_ACTIVE_MEMBERSHIP(m));
  if (!viewerIsActive) notFound();

  return <InboxList scope={{ kind: "agency", agency_slug, agency_id: agency["agency_id"] }} filter={filter} />;
}

const LOCALE_ES_META = {
  title: "Bandeja de entrada",
};

const LOCALE_EN_META: typeof LOCALE_ES_META = {
  title: "Inbox",
};

const LOCALE_PT_META: typeof LOCALE_ES_META = {
  title: "Caixa de entrada",
};

const LOCALES_META = { es: LOCALE_ES_META, en: LOCALE_EN_META, pt: LOCALE_PT_META };
