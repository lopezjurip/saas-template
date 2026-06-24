import { getSupabaseServerUser } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

// One colocated gql per file — conversation + its thread in a single round-trip. Do NOT reach
// for a shared get-viewer-* hook here; spread the ConversationThreadFragment instead.
const OrgInboxConversationPageQuery = gql(`
  query OrgInboxConversationPageQuery($conversationId: UUID!) {
    conversation: viewerConversationById(conversationId: $conversationId) {
      ...ConversationThreadFragment
    }
  }
`);

// cache() dedupes the generateMetadata + render fetch into a single call for this request.
const getConversation = cache(async (conversation_id: string) => {
  const graphy = await getGraphySession();
  const { data } = await graphy.query({
    query: OrgInboxConversationPageQuery,
    variables: { conversationId: conversation_id },
  });
  return data?.["conversation"] ?? null;
});

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
): Promise<Metadata> {
  const { conversation_id } = await props.params;
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);

  const conversation = await getConversation(conversation_id);
  const subject = conversation?.["conversationSubject"] || t("defaultTitle");
  return { title: subject };
}

export default async function OrgConversationPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
) {
  const { conversation_id, tenant_slug, organization_id: organization_id_param } = await props.params;
  const organization_id = Number(organization_id_param);

  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/t/${tenant_slug}/${organization_id_param}/inbox/${conversation_id}`)}`);
  }

  const scope = { kind: "organization" as const, tenant_slug, organization_id };

  const conversation = await getConversation(conversation_id);
  if (!conversation) {
    notFound();
  }

  const messages = (conversation["messages"]?.["edges"] ?? []).map((edge) => edge["node"]);
  const unreadIds = messages
    .filter((m) => !m["messageReadAt"] && m["messageDirection"] === "outbound")
    .map((m) => m["conversationMessageId"]);
  if (unreadIds.length > 0) {
    await actionMarkRead(unreadIds);
  }

  return <ConversationThread conversation={conversation} backHref={SCOPE_INBOX_HREF(scope)} />;
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
