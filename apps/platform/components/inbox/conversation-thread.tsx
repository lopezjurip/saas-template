"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Archive, ArrowLeft, MessageSquare } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";
import { gql } from "~/generated/graphql";
import { useLocale, useRosetta } from "~/lib/i18n.client";
import { actionArchive } from "./actions";

/**
 * Everything <ConversationThread/> renders: the conversation scalars plus its full message
 * thread. Pages that mount the thread spread this fragment into their own colocated query —
 * `...ConversationThreadFragment` — instead of going through a shared hook.
 */
export const ConversationThreadFragment = /*#__PURE__*/ gql(`
  fragment ConversationThreadFragment on Conversations {
    conversationId
    conversationSubject
    conversationStatus
    organizationId
    agencyId
    messages: conversationMessagesCollection(first: 250, orderBy: [{ messageCreatedAt: AscNullsLast }]) {
      edges {
        node {
          conversationMessageId
          messageBody
          messageDirection
          messageAuthor
          messageChannel
          messagePriority
          messageCreatedAt
          messageReadAt
        }
      }
    }
  }
`);

export type ConversationThreadFragmentType = ResultOf<typeof ConversationThreadFragment>;

type Message = {
  conversationMessageId: string;
  messageBody: string | null;
  messageDirection: string;
  messageAuthor: string;
  messageChannel: string | null;
  messagePriority: string | null;
  messageCreatedAt: string;
  messageReadAt: string | null;
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
 * Read-only conversation thread view with an archive action.
 * Owns its own localization — no `t` prop threading.
 *
 * @example
 * <ConversationThread conversation={conv} backHref={SCOPE_INBOX_HREF(scope)} />
 */
export function ConversationThread({
  conversation,
  backHref,
}: {
  conversation: ConversationThreadFragmentType;
  backHref: Route;
}) {
  const { t } = useRosetta(LOCALES);
  const locale = useLocale();

  const messages: Message[] = (conversation["messages"]?.["edges"] ?? []).map((edge) => edge["node"]);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isArchived, setIsArchived] = useState(conversation["conversationStatus"] === "archived");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId = conversation["conversationId"];
  const subject = conversation["conversationSubject"] || t("noSubject");
  const orgId = conversation["organizationId"];
  const agencyId = conversation["agencyId"];
  const scopeLabel = orgId ? t("scopeOrg") : agencyId ? t("scopeAgency") : t("scopePersonal");

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-6 py-3">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground" aria-label={t("backToInbox")}>
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
              // Viewer-relative: `inbound` is the viewer's own message (right/primary, "me");
              // `outbound` is a notification sent to the viewer (left/muted, "them").
              const isFromViewer = msg["messageDirection"] === "inbound";
              const isSystem = msg["messageDirection"] === "system";
              const timeStr = new Date(msg["messageCreatedAt"]).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = new Date(msg["messageCreatedAt"]).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
              });

              if (isSystem) {
                return (
                  <div key={msg["conversationMessageId"]} className="flex justify-center">
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      {msg["messageBody"]}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg["conversationMessageId"]}
                  className={cn("flex", isFromViewer ? "justify-end" : "justify-start")}
                >
                  <div className={cn("max-w-[70%]", isFromViewer ? "items-end" : "items-start", "flex flex-col gap-1")}>
                    <div
                      className={cn(
                        "rounded-xl px-3.5 py-2.5 text-sm",
                        isFromViewer ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {msg["messageBody"]}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-tiny",
                        isFromViewer ? "flex-row-reverse" : "flex-row",
                        "text-muted-foreground",
                      )}
                    >
                      <span>
                        {dateStr} · {timeStr}
                      </span>
                      {msg["messageChannel"] && (
                        <Badge variant="outline" className="text-tiny py-0">
                          {CHANNEL_LABEL(msg["messageChannel"], t)}
                        </Badge>
                      )}
                      {msg["messagePriority"] && msg["messagePriority"] !== "normal" && (
                        <Badge variant={PRIORITY_VARIANT(msg["messagePriority"])} className="text-tiny py-0">
                          {PRIORITY_LABEL(msg["messagePriority"], t)}
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
