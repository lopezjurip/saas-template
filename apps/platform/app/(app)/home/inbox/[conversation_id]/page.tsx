import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { notFound, redirect } from "next/navigation";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import { actionMarkRead } from "./actions";
import { ConversationThread } from "./thread";

export async function generateMetadata(props: PageProps<"/home/inbox/[conversation_id]">) {
  const { conversation_id } = await props.params;
  const locale = await getServerLocale();
  const { t } = ROSETTA(LOCALES_META, locale);

  const supabase = await createServerClient();
  const { data: rows } = await supabase.rpc("viewer_conversations", { include_archived: true });
  const conv = (rows ?? []).find((r: Record<string, unknown>) => r["conversation_id"] === conversation_id) as
    | Record<string, unknown>
    | undefined;

  const subject = (conv?.["conversation_subject"] as string | null) || t("defaultTitle");
  return { title: subject };
}

export default async function ConversationPage(props: PageProps<"/home/inbox/[conversation_id]">) {
  const { conversation_id } = await props.params;
  const locale = await getServerLocale();

  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/home/inbox/${conversation_id}`)}`);
  }

  const supabase = await createServerClient();
  const [convsResult, msgsResult] = await Promise.all([
    supabase.rpc("viewer_conversations", { include_archived: true }),
    supabase.rpc("viewer_conversation_messages", { p_conversation_id: conversation_id }),
  ]);

  const convRows = (convsResult.data ?? []) as Array<Record<string, unknown>>;
  const conv = convRows.find((r) => r["conversation_id"] === conversation_id);
  if (!conv) notFound();

  const messages = (msgsResult.data ?? []) as Array<Record<string, unknown>>;

  // Mark all unread inbound messages as read server-side on open
  const unreadIds = messages
    .filter((m) => !m["message_read_at"] && m["message_direction"] !== "outbound")
    .map((m) => m["conversation_message_id"] as string);
  if (unreadIds.length > 0) {
    await actionMarkRead(unreadIds);
  }

  const { t } = ROSETTA(LOCALES, locale);

  return (
    <ConversationThread
      locale={locale}
      conversation={conv}
      initialMessages={messages}
      viewerId={user.id}
      t={{
        noSubject: t("noSubject"),
        scopeOrg: t("scopeOrg"),
        scopeAgency: t("scopeAgency"),
        scopePersonal: t("scopePersonal"),
        statusOpen: t("statusOpen"),
        statusArchived: t("statusArchived"),
        archive: t("archive"),
        archived: t("archived"),
        archiveError: t("archiveError"),
        replyPlaceholder: t("replyPlaceholder"),
        send: t("send"),
        sending: t("sending"),
        sendError: t("sendError"),
        inbound: t("inbound"),
        outbound: t("outbound"),
        system: t("system"),
        emptyThread: t("emptyThread"),
        backToInbox: t("backToInbox"),
        channelEmail: t("channelEmail"),
        channelInApp: t("channelInApp"),
        channelWhatsapp: t("channelWhatsapp"),
        channelSms: t("channelSms"),
        priorityLow: t("priorityLow"),
        priorityNormal: t("priorityNormal"),
        priorityHigh: t("priorityHigh"),
        priorityUrgent: t("priorityUrgent"),
      }}
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

const LOCALE_ES = {
  noSubject: "(Sin asunto)",
  scopeOrg: "Org",
  scopeAgency: "Agencia",
  scopePersonal: "Personal",
  statusOpen: "Abierta",
  statusArchived: "Archivada",
  archive: "Archivar",
  archived: "Archivada",
  archiveError: "Error al archivar la conversación",
  replyPlaceholder: "Escribe tu respuesta…",
  send: "Enviar",
  sending: "Enviando…",
  sendError: "Error al enviar el mensaje",
  inbound: "Entrante",
  outbound: "Saliente",
  system: "Sistema",
  emptyThread: "No hay mensajes aún",
  backToInbox: "Bandeja de entrada",
  channelEmail: "Email",
  channelInApp: "En app",
  channelWhatsapp: "WhatsApp",
  channelSms: "SMS",
  priorityLow: "Baja",
  priorityNormal: "Normal",
  priorityHigh: "Alta",
  priorityUrgent: "Urgente",
};

const LOCALE_EN: typeof LOCALE_ES = {
  noSubject: "(No subject)",
  scopeOrg: "Org",
  scopeAgency: "Agency",
  scopePersonal: "Personal",
  statusOpen: "Open",
  statusArchived: "Archived",
  archive: "Archive",
  archived: "Archived",
  archiveError: "Error archiving conversation",
  replyPlaceholder: "Write your reply…",
  send: "Send",
  sending: "Sending…",
  sendError: "Error sending message",
  inbound: "Inbound",
  outbound: "Outbound",
  system: "System",
  emptyThread: "No messages yet",
  backToInbox: "Inbox",
  channelEmail: "Email",
  channelInApp: "In-app",
  channelWhatsapp: "WhatsApp",
  channelSms: "SMS",
  priorityLow: "Low",
  priorityNormal: "Normal",
  priorityHigh: "High",
  priorityUrgent: "Urgent",
};

const LOCALE_PT: typeof LOCALE_ES = {
  noSubject: "(Sem assunto)",
  scopeOrg: "Org",
  scopeAgency: "Agência",
  scopePersonal: "Pessoal",
  statusOpen: "Aberta",
  statusArchived: "Arquivada",
  archive: "Arquivar",
  archived: "Arquivada",
  archiveError: "Erro ao arquivar a conversa",
  replyPlaceholder: "Escreva sua resposta…",
  send: "Enviar",
  sending: "Enviando…",
  sendError: "Erro ao enviar a mensagem",
  inbound: "Recebida",
  outbound: "Enviada",
  system: "Sistema",
  emptyThread: "Sem mensagens ainda",
  backToInbox: "Caixa de entrada",
  channelEmail: "Email",
  channelInApp: "No app",
  channelWhatsapp: "WhatsApp",
  channelSms: "SMS",
  priorityLow: "Baixa",
  priorityNormal: "Normal",
  priorityHigh: "Alta",
  priorityUrgent: "Urgente",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
