import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { notFound } from "next/navigation";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF, SCOPE_RPC_ARGS } from "~/components/inbox/scope";
import { IS_ACTIVE_MEMBERSHIP } from "~/lib/agencies";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

export async function generateMetadata(props: PageProps<"/a/[agency_slug]/inbox/[conversation_id]">) {
  const { agency_slug, conversation_id } = await props.params;
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);

  const admin = createServiceRoleClient();
  const agencyRes = await admin.from("agencies").select("agency_id").eq("agency_slug", agency_slug).maybeSingle();
  if (!agencyRes.data) return { title: t("defaultTitle") };
  const agency_id = agencyRes.data["agency_id"];

  const supabase = await createServerClient();
  const { data: rows } = await supabase.rpc("viewer_conversations", {
    include_archived: true,
    ...SCOPE_RPC_ARGS({ kind: "agency", agency_slug, agency_id }),
  });
  const conv = (rows ?? []).find((r: Record<string, unknown>) => r["conversation_id"] === conversation_id) as
    | Record<string, unknown>
    | undefined;

  const subject = (conv?.["conversation_subject"] as string | null) || t("defaultTitle");
  return { title: subject };
}

export default async function AgencyConversationPage(props: PageProps<"/a/[agency_slug]/inbox/[conversation_id]">) {
  const { agency_slug, conversation_id } = await props.params;
  const locale = await getServerLocale();

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

  // Gate: must be an active affiliate.
  const membershipsRes = await admin
    .from("agency_memberships")
    .select(
      "agency_membership_id, profile_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at",
    )
    .eq("agency_id", agency["agency_id"]);

  const memberships = membershipsRes.data ?? [];
  const viewerIsActive = memberships.some((m) => user && m["profile_id"] === user.id && IS_ACTIVE_MEMBERSHIP(m));
  if (!viewerIsActive) notFound();

  const scope = { kind: "agency" as const, agency_slug, agency_id: agency["agency_id"] };

  const [convsResult, msgsResult] = await Promise.all([
    supabase.rpc("viewer_conversations", { include_archived: true, ...SCOPE_RPC_ARGS(scope) }),
    supabase.rpc("viewer_conversation_messages", { p_conversation_id: conversation_id }),
  ]);

  const convRows = (convsResult.data ?? []) as Array<Record<string, unknown>>;
  const conv = convRows.find((r) => r["conversation_id"] === conversation_id);
  if (!conv) notFound();

  const messages = (msgsResult.data ?? []) as Array<Record<string, unknown>>;

  const unreadIds = messages
    .filter((m) => !m["message_read_at"] && m["message_direction"] !== "outbound")
    .map((m) => m["conversation_message_id"] as string);
  if (unreadIds.length > 0) {
    await actionMarkRead(unreadIds);
  }

  return (
    <ConversationThread
      locale={locale}
      conversation={conv}
      initialMessages={messages}
      viewerId={user?.id ?? ""}
      backHref={SCOPE_INBOX_HREF(scope)}
    />
  );
}

const LOCALE_ES_META = {
  defaultTitle: "Conversación",
};

const LOCALE_EN_META: typeof LOCALE_ES_META = {
  defaultTitle: "Conversation",
};

const LOCALE_PT_META: typeof LOCALE_ES_META = {
  defaultTitle: "Conversa",
};

const LOCALES_META = { es: LOCALE_ES_META, en: LOCALE_EN_META, pt: LOCALE_PT_META };
