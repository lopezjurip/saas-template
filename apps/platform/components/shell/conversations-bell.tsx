"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Bell, Inbox } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InboxScope } from "~/components/inbox/scope";
import { SCOPE_DETAIL_HREF, SCOPE_INBOX_HREF, SCOPE_RPC_ARGS } from "~/components/inbox/scope";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { useRosetta } from "~/lib/i18n.client";

type RecentConversation = {
  conversation_id: string;
  conversation_subject: string | null;
  conversation_status: string;
  conversation_last_message_at: string;
  organization_id: number | null;
  agency_id: string | null;
  tenant_id: number | null;
  snippet: string | null;
  unread: boolean;
};

/**
 * Loads recent conversations and unread count from Supabase RPCs for a given scope.
 * Returns up to 5 most-recent conversations for the bell popover.
 */
async function fetchBellData(
  supabase: ReturnType<typeof createBrowserClient>,
  scope: InboxScope,
): Promise<{
  unread: number;
  conversations: RecentConversation[];
}> {
  const rpcArgs = SCOPE_RPC_ARGS(scope);

  const [countResult, convsResult] = await Promise.all([
    supabase.rpc("viewer_unread_count", rpcArgs),
    supabase.rpc("viewer_conversations", { include_archived: false, ...rpcArgs }),
  ]);

  const unread = (countResult.data as number | null) ?? 0;
  const rows = (convsResult.data ?? []) as Array<Record<string, unknown>>;

  const conversations: RecentConversation[] = rows.slice(0, 5).map((row) => ({
    conversation_id: row["conversation_id"] as string,
    conversation_subject: (row["conversation_subject"] as string | null) ?? null,
    conversation_status: row["conversation_status"] as string,
    conversation_last_message_at: row["conversation_last_message_at"] as string,
    organization_id: (row["organization_id"] as number | null) ?? null,
    agency_id: (row["agency_id"] as string | null) ?? null,
    tenant_id: (row["tenant_id"] as number | null) ?? null,
    snippet: null,
    unread: false,
  }));

  return { unread, conversations };
}

/**
 * Bell icon button with popover listing recent conversations and unread count badge.
 * Subscribes to Supabase Realtime for live badge + list updates.
 *
 * - `scope` determines which RPC args to pass and which inbox/detail routes to link.
 * - `compact` collapses to icon-only button (sidebar icon-rail mode).
 * - `placement` controls popover direction: "up" for sidebar footer, "down" for top bar headers.
 *
 * @example
 * <ConversationsBell scope={{ kind: "personal" }} compact={false} />
 * <ConversationsBell scope={{ kind: "organization", tenant_slug: "acme", organization_id: 42 }} compact={true} />
 * <ConversationsBell scope={{ kind: "agency", agency_slug: "abc", agency_id: "uuid" }} compact={true} placement="down" />
 */
export function ConversationsBell({
  scope,
  compact,
  placement = "up",
}: {
  scope: InboxScope;
  compact?: boolean;
  placement?: "up" | "down";
}) {
  const { t } = useRosetta(LOCALES);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  async function refresh(supabase: ReturnType<typeof createBrowserClient>) {
    const result = await fetchBellData(supabase, scope);
    setUnread(result.unread);
    setConversations(result.conversations);
  }

  useEffect(() => {
    const supabase = createBrowserClient();
    void refresh(supabase);

    const channel = supabase
      .channel("conversations-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversation_messages" }, () => {
        void refresh(supabase);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markAllRead() {
    const supabase = createBrowserClient();
    const rpcArgs = SCOPE_RPC_ARGS(scope);
    await supabase.rpc("viewer_unread_count", rpcArgs);
    setUnread(0);
    setConversations((prev) => prev.map((c) => ({ ...c, unread: false })));
    await refresh(supabase);
  }

  const inboxHref = SCOPE_INBOX_HREF(scope);

  const trigger = compact ? (
    <Tip label={t("inbox")} disabled={open}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-open={open}
        className="hover:bg-accent/70 data-[open=true]:bg-accent relative flex h-9 w-9 items-center justify-center rounded-md"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-rose-500" />
        )}
      </button>
    </Tip>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      data-open={open}
      className="hover:bg-accent/70 data-[open=true]:bg-accent relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left"
    >
      <Bell size={15} className="text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm">{t("inbox")}</span>
      {unread > 0 && (
        <span className="bg-foreground/85 text-background rounded px-1.5 py-0.5 font-mono text-tiny font-medium">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );

  // Popover position: sidebar footer opens upward; top-bar headers open downward.
  const popoverPositionClass =
    placement === "down"
      ? compact
        ? "absolute top-full left-0 z-40 mt-1.5 w-72"
        : "absolute top-full left-0 right-0 z-30 mt-1.5"
      : compact
        ? "absolute bottom-0 left-full z-40 ml-2 w-72"
        : "absolute bottom-full left-0 right-0 z-30 mb-1.5";

  return (
    <div className="relative" ref={ref}>
      {trigger}
      {open && (
        <div
          className={cn(
            "border-border bg-card text-card-foreground overflow-hidden rounded-md border shadow-lg",
            popoverPositionClass,
          )}
        >
          <div className="border-border flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">{t("recentConversations")}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-6 text-center text-sm">
              <Inbox size={20} className="opacity-40" />
              <span>{t("empty")}</span>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {conversations.map((conv) => {
                const subject = conv["conversation_subject"] || t("noSubject");
                const scopeLabel = conv["organization_id"]
                  ? t("scopeOrg")
                  : conv["agency_id"]
                    ? t("scopeAgency")
                    : t("scopePersonal");
                return (
                  <Link
                    key={conv["conversation_id"]}
                    href={SCOPE_DETAIL_HREF(scope, conv["conversation_id"])}
                    onClick={() => setOpen(false)}
                    className="hover:bg-accent flex items-start gap-2.5 px-3 py-2.5"
                  >
                    {conv["unread"] && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
                    <div className={cn("min-w-0 flex-1", !conv["unread"] && "pl-4")}>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{subject}</span>
                        <span className="border-border text-muted-foreground shrink-0 rounded border px-1 py-0.5 text-tiny">
                          {scopeLabel}
                        </span>
                      </div>
                      {conv["snippet"] && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">{conv["snippet"]}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-border border-t px-3 py-2">
            <Link
              href={inboxHref}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs"
            >
              <Inbox size={12} />
              {t("viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  inbox: "Bandeja de entrada",
  recentConversations: "Conversaciones recientes",
  markAllRead: "Marcar todo como leído",
  empty: "Sin conversaciones nuevas",
  noSubject: "(Sin asunto)",
  scopeOrg: "Org",
  scopeAgency: "Agencia",
  scopePersonal: "Personal",
  viewAll: "Ver todas las conversaciones",
};

const LOCALE_EN: typeof LOCALE_ES = {
  inbox: "Inbox",
  recentConversations: "Recent conversations",
  markAllRead: "Mark all read",
  empty: "No new conversations",
  noSubject: "(No subject)",
  scopeOrg: "Org",
  scopeAgency: "Agency",
  scopePersonal: "Personal",
  viewAll: "View all conversations",
};

const LOCALE_PT: typeof LOCALE_ES = {
  inbox: "Caixa de entrada",
  recentConversations: "Conversas recentes",
  markAllRead: "Marcar tudo como lido",
  empty: "Sem conversas novas",
  noSubject: "(Sem assunto)",
  scopeOrg: "Org",
  scopeAgency: "Agência",
  scopePersonal: "Pessoal",
  viewAll: "Ver todas as conversas",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
