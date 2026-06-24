import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { z } from "zod";
import { InboxList } from "~/components/inbox/inbox-list";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import { assertParams } from "~/lib/params";

export async function generateMetadata(props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox">) {
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);
  return { title: t("title") };
}

export default async function OrgInboxPage(props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox">) {
  const { tenant_slug, organization_id } = assertParams(
    await props.params,
    z.object({ tenant_slug: z.string().min(1), organization_id: z.int().min(1) }),
    "notFound",
  );
  const sp = await props.searchParams;
  const filter = (SINGLE(sp["filter"]) ?? "open") as "open" | "archived";

  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/t/${tenant_slug}/${organization_id}/inbox`)}`);
  }

  return <InboxList scope={{ kind: "organization", tenant_slug, organization_id }} filter={filter} />;
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
