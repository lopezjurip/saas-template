"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Archive, ArrowLeft, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import type { AppRoute } from "~/lib/route";
import { actionArchive, actionPostMessage } from "./actions";

type Message = {
  conversation_message_id: string;
  message_body: string | null;
  message_direction: string;
  message_author: string;
  message_channel: string | null;
  message_priority: string | null;
  message_created_at: string;
  message_read_at: string | null;
};

function CHANNEL_LABEL(channel: string | null, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
  const map: Record<string, string> = {
    email: t("channelEmail"),
    in_app: t("channelInApp"),
    whatsapp: t("channelWhatsapp"),
    sms: t("channelSms"),
  };
  return (channel && map[channel]) || channel || t("channelInApp");
}

function PRIORITY_LABEL(priority: string | null, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
  const map: Record<string, string> = {
    low: t("priorityLow"),
    normal: t("priorityNormal"),
    high: t("priorityHigh"),
    urgent: t("priorityUrgent"),
  };
  return (priority && map[priority]) || priority || t("priorityNormal");
}

function PRIORITY_VARIANT(priority: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (priority === "urgent") return "destructive";
  if (priority === "high") return "default";
  return "secondary";
}

/**
 * Client-side conversation thread view with optimistic reply append and archive action.
 * Owns its own localization — no `t` prop threading.
 *
 * @example
 * <ConversationThread
 *   conversation={conv}
 *   initialMessages={msgs}
 *   viewerId={user.id}
 *   backHref={SCOPE_INBOX_HREF(scope)}
 * />
 */
export function ConversationThread({
  locale,
  conversation,
  initialMessages,
  viewerId,
  backHref,
}: {
  locale: string;
  conversation: Record<string, unknown>;
  initialMessages: Array<Record<string, unknown>>;
  viewerId: string;
  backHref: AppRoute | string;
}) {
  const { t } = useRosetta(LOCALES);

  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({
      conversation_message_id: m["conversation_message_id"] as string,
      message_body: (m["message_body"] as string | null) ?? null,
      message_direction: m["message_direction"] as string,
      message_author: m["message_author"] as string,
      message_channel: (m["message_channel"] as string | null) ?? null,
      message_priority: (m["message_priority"] as string | null) ?? null,
      message_created_at: m["message_created_at"] as string,
      message_read_at: (m["message_read_at"] as string | null) ?? null,
    })),
  );
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isArchived, setIsArchived] = useState(conversation["conversation_status"] === "archived");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId = conversation["conversation_id"] as string;
  const subject = (conversation["conversation_subject"] as string | null) || t("noSubject");
  const orgId = conversation["organization_id"] as number | null;
  const agencyId = conversation["agency_id"] as string | null;
  const scopeLabel = orgId ? t("scopeOrg") : agencyId ? t("scopeAgency") : t("scopePersonal");

  async function handleSend() {
    const body = replyBody.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      conversation_message_id: optimisticId,
      message_body: body,
      message_direction: "outbound",
      message_author: viewerId,
      message_channel: "in_app",
      message_priority: null,
      message_created_at: new Date().toISOString(),
      message_read_at: null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyBody("");
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const realId = await actionPostMessage(conversationId, body);
      setMessages((prev) =>
        prev.map((m) => (m.conversation_message_id === optimisticId ? { ...m, conversation_message_id: realId } : m)),
      );
    } catch {
      setSendError(t("sendError"));
      setMessages((prev) => prev.filter((m) => m.conversation_message_id !== optimisticId));
      setReplyBody(body);
    } finally {
      setSending(false);
    }
  }

  async function handleArchive() {
    if (archiving || isArchived) return;
    setArchiving(true);
    setArchiveError(null);
    try {
      await actionArchive(conversationId);
      setIsArchived(true);
    } catch {
      setArchiveError(t("archiveError"));
    } finally {
      setArchiving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-6 py-3">
        <Link
          href={backHref as string}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("backToInbox")}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold">{subject}</h1>
            <Badge variant="outline" className="shrink-0 text-tiny">
              {scopeLabel}
            </Badge>
            <Badge variant={isArchived ? "secondary" : "outline"} className="shrink-0 text-tiny">
              {isArchived ? t("statusArchived") : t("statusOpen")}
            </Badge>
          </div>
        </div>
        {!isArchived && (
          <Button variant="outline" size="sm" onClick={handleArchive} disabled={archiving} className="shrink-0 gap-1.5">
            <Archive size={13} />
            {archiving ? "…" : t("archive")}
          </Button>
        )}
      </div>

      {archiveError && (
        <div className="bg-destructive/10 text-destructive border-b px-6 py-2 text-xs">{archiveError}</div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <MessageSquare size={32} className="text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">{t("emptyThread")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => {
              const isOutbound = msg["message_direction"] === "outbound";
              const isSystem = msg["message_direction"] === "system";
              const timeStr = new Date(msg["message_created_at"]).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = new Date(msg["message_created_at"]).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
              });

              if (isSystem) {
                return (
                  <div key={msg["conversation_message_id"]} className="flex justify-center">
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      {msg["message_body"]}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg["conversation_message_id"]}
                  className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
                >
                  <div className={cn("max-w-[70%]", isOutbound ? "items-end" : "items-start", "flex flex-col gap-1")}>
                    <div
                      className={cn(
                        "rounded-xl px-3.5 py-2.5 text-sm",
                        isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {msg["message_body"]}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-tiny",
                        isOutbound ? "flex-row-reverse" : "flex-row",
                        "text-muted-foreground",
                      )}
                    >
                      <span>
                        {dateStr} · {timeStr}
                      </span>
                      {msg["message_channel"] && (
                        <Badge variant="outline" className="text-tiny py-0">
                          {CHANNEL_LABEL(msg["message_channel"], t)}
                        </Badge>
                      )}
                      {msg["message_priority"] && msg["message_priority"] !== "normal" && (
                        <Badge variant={PRIORITY_VARIANT(msg["message_priority"])} className="text-tiny py-0">
                          {PRIORITY_LABEL(msg["message_priority"], t)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Reply box */}
      {!isArchived && (
        <div className="border-border shrink-0 border-t px-6 py-4">
          {sendError && <p className="text-destructive mb-2 text-xs">{sendError}</p>}
          <div className="flex items-end gap-2">
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("replyPlaceholder")}
              rows={3}
              disabled={sending}
              className="min-h-0 resize-none text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={sending || !replyBody.trim()}
              className="shrink-0 gap-1.5"
            >
              <Send size={13} />
              {sending ? t("sending") : t("send")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  noSubject: "(Sin asunto)",
  scopeOrg: "Org",
  scopeAgency: "Agencia",
  scopePersonal: "Personal",
  statusOpen: "Abierta",
  statusArchived: "Archivada",
  archive: "Archivar",
  archiveError: "Error al archivar la conversación",
  replyPlaceholder: "Escribe tu respuesta…",
  send: "Enviar",
  sending: "Enviando…",
  sendError: "Error al enviar el mensaje",
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
  archiveError: "Error archiving conversation",
  replyPlaceholder: "Write your reply…",
  send: "Send",
  sending: "Sending…",
  sendError: "Error sending message",
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
  archiveError: "Erro ao arquivar a conversa",
  replyPlaceholder: "Escreva sua resposta…",
  send: "Enviar",
  sending: "Enviando…",
  sendError: "Erro ao enviar a mensagem",
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
