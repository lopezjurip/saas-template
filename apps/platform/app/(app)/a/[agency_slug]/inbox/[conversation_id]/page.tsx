import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { gql } from "~/generated/graphql";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

// One colocated gql per file — conversation + its thread in a single round-trip. Do NOT reach
// for a shared get-viewer-* hook here; spread the ConversationThreadFragment instead.
const AgencyInboxConversationPageQuery = gql(`
  query AgencyInboxConversationPageQuery($conversationId: UUID!) {
    conversation: viewerConversationById(conversationId: $conversationId) {
      ...ConversationThreadFragment
    }
  }
`);

// cache() dedupes the generateMetadata + render fetch into a single call for this request.
const getConversation = cache(async (conversation_id: string) => {
  const graphy = await getGraphySession();
  const { data } = await graphy.query({
    query: AgencyInboxConversationPageQuery,
    variables: { conversationId: conversation_id },
  });
  return data?.["conversation"] ?? null;
});

export async function generateMetadata(
  props: PageProps<"/a/[agency_slug]/inbox/[conversation_id]">,
): Promise<Metadata> {
  const { conversation_id } = await props.params;
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);

  const conversation = await getConversation(conversation_id);
  const subject = conversation?.["conversationSubject"] || t("defaultTitle");
  return { title: subject };
}

export default async function AgencyConversationPage(props: PageProps<"/a/[agency_slug]/inbox/[conversation_id]">) {
  const { agency_slug, conversation_id } = await props.params;

  // RLS-scoped gql fetch is itself the active-affiliate gate (viewer_agency_ids()
  // is accepted-and-not-revoked) → non-members get 404. No service-role client.
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  const scope = { kind: "agency" as const, agency_slug, agency_id: agency["agencyId"] };

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
