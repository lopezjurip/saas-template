import { SINGLE } from "@packages/utils/array";
import type { Metadata } from "next";
import { InboxList } from "~/components/inbox/inbox-list";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

export async function generateMetadata(props: PageProps<"/a/[agency_slug]/inbox">): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);
  return { title: t("title") };
}

export default async function AgencyInboxPage(props: PageProps<"/a/[agency_slug]/inbox">) {
  const { agency_slug } = await props.params;
  const sp = await props.searchParams;
  const filter = (SINGLE(sp["filter"]) ?? "open") as "open" | "archived";

  // The cached, RLS-scoped gql fetch is also the affiliate gate (non-members → 404).
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  return <InboxList scope={{ kind: "agency", agency_slug, agency_id: agency["agencyId"] }} filter={filter} />;
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
