"use client";

import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Info, MessageCircle, Send, User } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";
import { useRef, useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionClaimTicket, actionPostMessage, actionResolveTicket } from "../actions";

export type ConversationMessage = {
  conversation_message_id: string;
  conversation_id: string;
  message_author: string;
  message_body: string | null;
  message_direction: string;
  message_created_at: string;
  message_priority: Database["public"]["Enums"]["notification_priority"] | null;
  message_channel: Database["public"]["Enums"]["message_channel"] | null;
};

export type TicketDetailData = {
  ticket_id: string;
  ticket_subject: string;
  ticket_status: Database["public"]["Enums"]["ticket_status"];
  ticket_priority: Database["public"]["Enums"]["notification_priority"];
  ticket_claimed_at: string | null;
  ticket_resolved_at: string | null;
  ticket_created_at: string;
  assigned_profile_id: string | null;
  assigned_agency_id: number | null;
  organization_id: number | null;
  tenant_id: number;
  conversation_id: string;
  organization_name: string | null;
  organization_slug: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  agency_id: number;
  agency_slug: string;
  agency_name: string;
  messages: ConversationMessage[];
};

/**
 * Ticket detail view: conversation thread, reply box, claim/resolve actions.
 */
export function TicketDetail({ data }: { data: TicketDetailData }) {
  const { t } = useRosetta(LOCALES);
  const [replyPending, startReplyTransition] = useTransition();
  const [actionPending, startActionTransition] = useTransition();
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const status = data["ticket_status"];
  const canClaim = status === "open";
  const canReply = status === "claimed" || status === "in_progress";
  const canResolve = status === "claimed" || status === "in_progress";
  const isResolved = status === "resolved" || status === "closed";

  function handleClaim() {
    setActionError(null);
    startActionTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionClaimTicket({ ticket_id: data["ticket_id"], agency_slug: data["agency_slug"] }),
      );
      if (err instanceof ErrorSafeActionServer) setActionError(err.serverError);
    });
  }

  function handleReply() {
    const body = replyText.trim();
    if (!body) return;
    setReplyError(null);
    startReplyTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionPostMessage({
          conversation_id: data["conversation_id"],
          body,
          ticket_id: data["ticket_id"],
          agency_slug: data["agency_slug"],
        }),
      );
      if (err instanceof ErrorSafeActionServer) {
        setReplyError(err.serverError);
      } else {
        setReplyText("");
        textareaRef.current?.focus();
      }
    });
  }

  function handleResolve() {
    setActionError(null);
    startActionTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionResolveTicket({
          ticket_id: data["ticket_id"],
          agency_slug: data["agency_slug"],
          resolution: resolveNote.trim() || undefined,
        }),
      );
      if (err instanceof ErrorSafeActionServer) {
        setActionError(err.serverError);
      } else {
        setShowResolveForm(false);
        setResolveNote("");
      }
    });
  }

  const poolHref = ROUTE("/a/[agency_slug]/tickets", { agency_slug: data["agency_slug"] as string });
  const scope = data["organization_name"]
    ? `${data["organization_name"]}${data["tenant_name"] ? ` · ${data["tenant_name"]}` : ""}`
    : (data["tenant_name"] ?? null);

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      {/* Header */}
      <header className="border-border bg-background flex shrink-0 items-start gap-3 border-b px-4 py-3 @3xl:px-6">
        <Link
          href={poolHref}
          className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-colors"
          aria-label={t("back")}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <TicketPriorityBadge priority={data["ticket_priority"]} t={t} />
            <TicketStatusBadge status={data["ticket_status"]} t={t} />
            <span className="text-foreground truncate text-sm font-semibold tracking-tight">
              {data["ticket_subject"]}
            </span>
          </div>
          {scope ? (
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Building2 size={11} className="shrink-0" />
              {scope}
            </span>
          ) : null}
        </div>

        {/* Primary action */}
        <div className="shrink-0">
          {canClaim ? (
            <Button size="sm" disabled={actionPending} onClick={handleClaim} className="h-8 text-xs">
              {actionPending ? t("claiming") : t("claim")}
            </Button>
          ) : canResolve ? (
            <Button
              size="sm"
              variant="outline"
              disabled={actionPending}
              onClick={() => setShowResolveForm((v) => !v)}
              className="h-8 text-xs"
            >
              <CheckCircle2 size={13} /> {t("resolve")}
            </Button>
          ) : isResolved ? (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CheckCircle2 size={13} /> {t("resolved_label")}
            </span>
          ) : null}
        </div>
      </header>

      {/* Action error banner */}
      {actionError ? (
        <div className="border-destructive/30 bg-destructive/6 text-destructive mx-4 mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs @3xl:mx-6">
          <Info size={13} className="shrink-0" />
          {actionError}
        </div>
      ) : null}

      {/* Resolve form */}
      {showResolveForm ? (
        <div className="border-border bg-muted/30 mx-4 mt-3 flex flex-col gap-2.5 rounded-lg border p-3.5 @3xl:mx-6">
          <span className="text-foreground text-xs font-semibold">{t("resolve_form_title")}</span>
          <Textarea
            placeholder={t("resolve_note_placeholder")}
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                setShowResolveForm(false);
                setResolveNote("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button size="sm" disabled={actionPending} onClick={handleResolve} className="h-8 text-xs">
              {actionPending ? t("resolving") : t("confirm_resolve")}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Conversation thread */}
      <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-3 @3xl:px-6 @3xl:py-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {data["messages"].length === 0 ? (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
              <span className="bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-full">
                <MessageCircle size={20} />
              </span>
              <span className="text-foreground text-sm font-semibold">{t("thread_empty_title")}</span>
              <span className="text-xs leading-normal text-pretty text-pretty">{t("thread_empty_desc")}</span>
            </div>
          ) : (
            data["messages"].map((msg) => <MessageBubble key={msg["conversation_message_id"]} msg={msg} t={t} />)
          )}
        </div>
      </main>

      {/* Reply box */}
      {canReply ? (
        <footer className="border-border bg-background shrink-0 border-t px-4 py-3 @3xl:px-6">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            {replyError ? (
              <span className="text-destructive flex items-center gap-1.5 text-xs">
                <Info size={11} className="shrink-0" /> {replyError}
              </span>
            ) : null}
            <div className="flex items-end gap-2.5">
              <Textarea
                ref={textareaRef}
                placeholder={t("reply_placeholder")}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply();
                }}
                rows={2}
                disabled={replyPending}
                className="min-h-0 flex-1 resize-none text-sm"
              />
              <Button
                size="sm"
                disabled={replyPending || !replyText.trim()}
                onClick={handleReply}
                className="mb-0.5 h-9 shrink-0"
                aria-label={t("send")}
              >
                <Send size={14} />
                <span className="sr-only">{t("send")}</span>
              </Button>
            </div>
            <span className="text-muted-foreground/60 text-tiny">{t("reply_hint")}</span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

function MessageBubble({ msg, t }: { msg: ConversationMessage; t: Translate }) {
  const isOutbound = msg["message_direction"] === "outbound";
  const isSystem = msg["message_author"] === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="border-border text-muted-foreground rounded-full border bg-transparent px-3 py-1 text-tiny">
          {msg["message_body"]}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2.5", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <span
        className={cn(
          "bg-muted text-foreground mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-tiny",
          isOutbound && "bg-foreground text-background",
        )}
      >
        <User size={13} />
      </span>
      <div className={cn("flex max-w-[75%] flex-col gap-1", isOutbound ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isOutbound
              ? "bg-foreground text-background rounded-tr-sm"
              : "border-border bg-muted text-foreground rounded-tl-sm border",
          )}
        >
          {msg["message_body"] ?? <span className="italic opacity-50">{t("empty_message")}</span>}
        </div>
        <span className="text-muted-foreground/60 px-0.5 text-tiny">{RELATIVE_TIME(msg["message_created_at"])}</span>
      </div>
    </div>
  );
}

function TicketPriorityBadge({
  priority,
  t,
}: {
  priority: Database["public"]["Enums"]["notification_priority"];
  t: Translate;
}) {
  const styles: Record<typeof priority, string> = {
    critical: "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400",
    high: "border-orange-600/40 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    medium: "border-yellow-600/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    low: "border-border text-muted-foreground bg-muted/50",
  };
  const Icon: ElementType = priority === "critical" || priority === "high" ? AlertTriangle : Info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-tiny font-semibold leading-[1.2]",
        styles[priority],
      )}
    >
      <Icon size={10} strokeWidth={2.25} />
      {t(`priority_${priority}`)}
    </span>
  );
}

function TicketStatusBadge({ status, t }: { status: Database["public"]["Enums"]["ticket_status"]; t: Translate }) {
  const styles: Record<typeof status, string> = {
    open: "border-blue-600/35 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    claimed: "border-purple-600/35 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    in_progress: "border-amber-600/35 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    resolved: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    closed: "border-border text-muted-foreground bg-muted/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-tiny font-medium leading-[1.2]",
        styles[status],
      )}
    >
      {t(`status_${status}`)}
    </span>
  );
}

/**
 * Returns a human-readable relative time string for a given ISO timestamp.
 */
function RELATIVE_TIME(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const LOCALE_ES = {
  back: "Volver a tickets",
  claim: "Reclamar",
  claiming: "Reclamando…",
  resolve: "Resolver",
  resolving: "Resolviendo…",
  resolved_label: "Resuelto",
  confirm_resolve: "Confirmar",
  cancel: "Cancelar",
  resolve_form_title: "Nota de resolución (opcional)",
  resolve_note_placeholder: "Describe cómo se resolvió el problema…",
  reply_placeholder: "Escribe tu respuesta…",
  reply_hint: "⌘+Enter para enviar",
  send: "Enviar",
  thread_empty_title: "Sin mensajes aún",
  thread_empty_desc: "Los mensajes de esta conversación aparecerán aquí.",
  empty_message: "(sin contenido)",
  priority_low: "Baja",
  priority_medium: "Media",
  priority_high: "Alta",
  priority_critical: "Crítica",
  status_open: "Abierto",
  status_claimed: "Reclamado",
  status_in_progress: "En proceso",
  status_resolved: "Resuelto",
  status_closed: "Cerrado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  back: "Back to tickets",
  claim: "Claim",
  claiming: "Claiming…",
  resolve: "Resolve",
  resolving: "Resolving…",
  resolved_label: "Resolved",
  confirm_resolve: "Confirm",
  cancel: "Cancel",
  resolve_form_title: "Resolution note (optional)",
  resolve_note_placeholder: "Describe how the issue was resolved…",
  reply_placeholder: "Write your reply…",
  reply_hint: "⌘+Enter to send",
  send: "Send",
  thread_empty_title: "No messages yet",
  thread_empty_desc: "Messages in this conversation will appear here.",
  empty_message: "(no content)",
  priority_low: "Low",
  priority_medium: "Medium",
  priority_high: "High",
  priority_critical: "Critical",
  status_open: "Open",
  status_claimed: "Claimed",
  status_in_progress: "In progress",
  status_resolved: "Resolved",
  status_closed: "Closed",
};

const LOCALE_PT: typeof LOCALE_ES = {
  back: "Voltar para tickets",
  claim: "Reivindicar",
  claiming: "Reivindicando…",
  resolve: "Resolver",
  resolving: "Resolvendo…",
  resolved_label: "Resolvido",
  confirm_resolve: "Confirmar",
  cancel: "Cancelar",
  resolve_form_title: "Nota de resolução (opcional)",
  resolve_note_placeholder: "Descreva como o problema foi resolvido…",
  reply_placeholder: "Escreva sua resposta…",
  reply_hint: "⌘+Enter para enviar",
  send: "Enviar",
  thread_empty_title: "Sem mensagens ainda",
  thread_empty_desc: "As mensagens desta conversa aparecerão aqui.",
  empty_message: "(sem conteúdo)",
  priority_low: "Baixa",
  priority_medium: "Média",
  priority_high: "Alta",
  priority_critical: "Crítica",
  status_open: "Aberto",
  status_claimed: "Reivindicado",
  status_in_progress: "Em andamento",
  status_resolved: "Resolvido",
  status_closed: "Fechado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
