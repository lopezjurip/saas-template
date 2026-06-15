"use client";

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import type { Database } from "@packages/supabase/types";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";

const log = debug("app:[locale]:home:account:notifications:matrix");

type PrefChannel = "email" | "web_push" | "whatsapp" | "sms";
type TopicRow = Database["public"]["Tables"]["conversation_topics"]["Row"];

/** Channels shown in the grid. in_app is always-on, not in this list. */
const PREF_CHANNELS: PrefChannel[] = ["email", "web_push", "whatsapp", "sms"];

/** Per-topic per-channel preference. Absence = enabled (default). */
type PrefMap = Map<string, Map<PrefChannel, boolean>>;

/** Build a lookup key for the pref map. */
function PREF_KEY(slug: string, channel: PrefChannel): string {
  return `${slug}:${channel}`;
}

/**
 * Whether the topic+channel combination is effectively enabled.
 * Absence of a row defaults to true per DB convention.
 */
function IS_ENABLED(prefs: PrefMap, slug: string, channel: PrefChannel): boolean {
  return prefs.get(slug)?.get(channel) ?? true;
}

/**
 * Per-channel preferences grid for notification topics.
 *
 * Loads topics from conversation_topics and viewer's profile_topic_channels rows.
 * Persists changes via debounced direct upsert (owner-RLS, single-table, single-row write).
 * in_app channel is always-on (locked). Outbound channels: email, web_push, whatsapp, sms.
 * "Silent" quick action = disable all outbound channels for a topic (in_app only).
 */
export function NotificationsMatrix() {
  const { t } = useRosetta(LOCALES);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [prefs, setPrefs] = useState<PrefMap>(new Map());
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef<Map<string, { slug: string; channel: PrefChannel; enabled: boolean }>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load topics + existing prefs
  useEffect(function loadData() {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function fetch() {
      const [topicsRes, prefsRes] = await Promise.all([
        supabase
          .from("conversation_topics")
          .select("*")
          .is("conversation_topic_disabled_at", null)
          .order("conversation_topic_priority"),
        supabase.from("profile_topic_channels").select("*"),
      ]);

      if (cancelled) return;

      if (topicsRes.error) {
        log.error("[loadData] topics fetch failed", { error: topicsRes.error });
      }
      if (prefsRes.error) {
        log.error("[loadData] prefs fetch failed", { error: prefsRes.error });
      }

      const topicRows = topicsRes.data ?? [];
      const prefRows = prefsRes.data ?? [];

      const prefChannelSet = new Set<string>(PREF_CHANNELS);
      const map: PrefMap = new Map();
      for (const row of prefRows) {
        const slug = row["conversation_topic_slug"];
        const channel = row["message_channel"];
        // Only track outbound channels; in_app and web_push (managed via PushPermission) are skipped
        if (!prefChannelSet.has(channel)) continue;
        if (!map.has(slug)) map.set(slug, new Map());
        map.get(slug)!.set(channel as PrefChannel, row["enabled"]);
      }

      setTopics(topicRows);
      setPrefs(map);
      setLoading(false);
    }

    void fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Flush pending upserts to DB
  const flushPending = useCallback(async function flushPending() {
    const supabase = createSupabaseBrowserClient();
    const batch = Array.from(pendingRef.current.values());
    if (batch.length === 0) return;
    pendingRef.current.clear();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const rows = batch.map((item) => ({
      profile_id: user.id,
      conversation_topic_slug: item.slug,
      message_channel: item.channel,
      enabled: item.enabled,
    }));

    const { error } = await supabase
      .from("profile_topic_channels")
      .upsert(rows, { onConflict: "profile_id,conversation_topic_slug,message_channel" });

    if (error) {
      log.error("[flushPending] upsert failed", { error, rows });
    }
  }, []);

  function scheduleFlush() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushPending, 600);
  }

  function onChannelToggle(slug: string, channel: PrefChannel, next: boolean) {
    // Optimistic local update
    setPrefs((prev) => {
      const map = new Map(prev);
      const inner = new Map(map.get(slug) ?? new Map<PrefChannel, boolean>());
      inner.set(channel, next);
      map.set(slug, inner);
      return map;
    });

    // Accumulate into pending batch
    const key = PREF_KEY(slug, channel);
    pendingRef.current.set(key, { slug, channel, enabled: next });
    scheduleFlush();
  }

  function onSilence(slug: string) {
    // Disable all outbound channels for this topic
    setPrefs((prev) => {
      const map = new Map(prev);
      const inner = new Map(map.get(slug) ?? new Map<PrefChannel, boolean>());
      for (const ch of PREF_CHANNELS) {
        inner.set(ch, false);
      }
      map.set(slug, inner);
      return map;
    });

    for (const ch of PREF_CHANNELS) {
      const key = PREF_KEY(slug, ch);
      pendingRef.current.set(key, { slug, channel: ch, enabled: false });
    }
    scheduleFlush();
  }

  function isSilent(slug: string): boolean {
    return PREF_CHANNELS.every((ch) => !IS_ENABLED(prefs, slug, ch));
  }

  const channelLabels = useMemo(
    () => ({
      email: t("channel_email"),
      web_push: t("channel_web_push"),
      whatsapp: t("channel_whatsapp"),
      sms: t("channel_sms"),
    }),
    [t],
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {t("section_title")}
          </span>
        </div>
        <div className="flex flex-col overflow-hidden rounded-md border bg-background">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3.5 border-b px-4 py-3.5 last:border-b-0">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t("section_title")}
        </span>
        {/* Channel header row */}
        <div className="hidden items-center gap-4 sm:flex">
          <span className="w-[34px] text-center text-tiny text-muted-foreground">{t("in_app_header")}</span>
          {PREF_CHANNELS.map((ch) => (
            <span key={ch} className="w-[34px] text-center text-tiny text-muted-foreground">
              {channelLabels[ch]}
            </span>
          ))}
          <span className="w-[34px] text-center text-tiny text-muted-foreground">{t("silent_header")}</span>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border bg-background">
        {topics.map((topic) => {
          const slug = topic["conversation_topic_slug"];
          const silent = isSilent(slug);

          return (
            <div
              key={slug}
              className="grid grid-cols-[1fr] items-start gap-3.5 border-b px-4 py-3.5 last:border-b-0 sm:grid-cols-[1fr_auto]"
            >
              {/* Topic info */}
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-sm font-medium text-foreground">{topic["conversation_topic_name"]}</span>
                <span className="text-pretty text-xs leading-relaxed text-muted-foreground">
                  {topic["conversation_topic_description"]}
                </span>
              </div>

              {/* Channel toggles */}
              <div className="flex items-center gap-4">
                {/* in_app — always on, locked */}
                <div className="flex w-[34px] flex-col items-center gap-1">
                  <Switch checked disabled aria-label={t("in_app_always_on")} className="sm:hidden" />
                  <Switch checked disabled aria-label={t("in_app_always_on")} className="hidden sm:flex" />
                  <span className="block text-tiny text-muted-foreground sm:hidden">{t("in_app_header")}</span>
                </div>

                {/* Outbound channels */}
                {PREF_CHANNELS.map((ch) => {
                  const enabled = IS_ENABLED(prefs, slug, ch);
                  return (
                    <div key={ch} className="flex w-[34px] flex-col items-center gap-1">
                      <Switch
                        checked={enabled}
                        onCheckedChange={(next) => onChannelToggle(slug, ch, next)}
                        aria-label={`${topic["conversation_topic_name"]} — ${channelLabels[ch]}`}
                      />
                      <span className="block text-tiny text-muted-foreground sm:hidden">{channelLabels[ch]}</span>
                    </div>
                  );
                })}

                {/* Silent quick toggle */}
                <div className="flex w-[34px] flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSilence(slug)}
                    disabled={silent}
                    title={t("silence_tooltip")}
                    className={cn(
                      "size-8 rounded-md text-tiny font-medium transition-colors",
                      silent
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-label={t("silence_tooltip")}
                  >
                    {t("silent_icon")}
                  </button>
                  <span className="block text-tiny text-muted-foreground sm:hidden">{t("silent_header")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">{t("in_app_note")}</p>
    </div>
  );
}

const LOCALE_ES = {
  section_title: "Temas",
  channel_email: "Email",
  channel_web_push: "Push",
  channel_whatsapp: "WA",
  channel_sms: "SMS",
  in_app_header: "App",
  silent_header: "Silencio",
  silent_icon: "🔕",
  in_app_always_on: "In-app siempre activo",
  silence_tooltip: "Silenciar — solo in-app",
  in_app_note: "Las notificaciones in-app llegan siempre. Los canales externos respetan tus preferencias.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  section_title: "Topics",
  channel_email: "Email",
  channel_web_push: "Push",
  channel_whatsapp: "WA",
  channel_sms: "SMS",
  in_app_header: "App",
  silent_header: "Silent",
  silent_icon: "🔕",
  in_app_always_on: "In-app always on",
  silence_tooltip: "Silence — in-app only",
  in_app_note: "In-app notifications always come through. External channels respect your preferences.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  section_title: "Tópicos",
  channel_email: "Email",
  channel_web_push: "Push",
  channel_whatsapp: "WA",
  channel_sms: "SMS",
  in_app_header: "App",
  silent_header: "Silêncio",
  silent_icon: "🔕",
  in_app_always_on: "In-app sempre ativo",
  silence_tooltip: "Silenciar — apenas in-app",
  in_app_note: "As notificações in-app chegam sempre. Os canais externos respeitam suas preferências.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
