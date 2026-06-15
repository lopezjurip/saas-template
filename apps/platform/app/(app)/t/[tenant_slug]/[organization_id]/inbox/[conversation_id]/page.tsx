import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF, SCOPE_RPC_ARGS } from "~/components/inbox/scope";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
): Promise<Metadata> {
  const { conversation_id, tenant_slug, organization_id: organization_id_param } = await props.params;
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);
  const organization_id = Number(organization_id_param);

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.rpc("viewer_conversations", {
    include_archived: true,
    ...SCOPE_RPC_ARGS({ kind: "organization", tenant_slug, organization_id }),
  });
  const conv = (rows ?? []).find((r: Record<string, unknown>) => r["conversation_id"] === conversation_id) as
    | Record<string, unknown>
    | undefined;

  const subject = (conv?.["conversation_subject"] as string | null) || t("defaultTitle");
  return { title: subject };
}

export default async function OrgConversationPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
) {
  const { conversation_id, tenant_slug, organization_id: organization_id_param } = await props.params;
  const locale = await getServerLocale();
  const organization_id = Number(organization_id_param);

  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/t/${tenant_slug}/${organization_id_param}/inbox/${conversation_id}`)}`);
  }

  const scope = { kind: "organization" as const, tenant_slug, organization_id };
  const supabase = await createSupabaseServerClient();
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
      viewerId={user.id}
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
