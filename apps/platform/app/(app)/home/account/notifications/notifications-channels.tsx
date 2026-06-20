"use client";

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";

const log = debug("app:home:account:notifications:channels");

type PrefChannel = "email" | "web_push" | "whatsapp" | "sms";

/** Outbound channels shown as master toggles. in_app is always-on, not in this list. */
const PREF_CHANNELS: PrefChannel[] = ["email", "web_push", "whatsapp", "sms"];

/**
 * Whether a channel is effectively enabled across the account.
 * A channel is on unless at least one topic explicitly disabled it (absence = enabled per DB default).
 */
function CHANNEL_ON(disabled: Set<PrefChannel>, channel: PrefChannel): boolean {
  return !disabled.has(channel);
}

/**
 * Per-channel master toggles for personal notifications.
 *
 * Each toggle applies a channel across *every* topic at once — there is no per-topic matrix.
 * Loads topics from conversation_topics (to know which rows to write) and the viewer's
 * profile_topic_channels rows (to derive each channel's on/off state). Toggling a channel
 * batches one upsert writing that channel's `enabled` flag for all topics in a single
 * round-trip (owner-RLS, single table). in_app is always-on (locked).
 */
export function NotificationsChannels() {
  const { t } = useRosetta(LOCALES);
  const [topicSlugs, setTopicSlugs] = useState<string[]>([]);
  // Channels that are explicitly disabled for at least one topic.
  const [disabledChannels, setDisabledChannels] = useState<Set<PrefChannel>>(new Set());
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef<Map<string, { slug: string; channel: PrefChannel; enabled: boolean }>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load topic slugs + existing prefs, then derive each channel's master state.
  useEffect(function loadData() {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function fetch() {
      const [topicsRes, prefsRes] = await Promise.all([
        supabase
          .from("conversation_topics")
          .select("conversation_topic_slug")
          .is("conversation_topic_disabled_at", null)
          .order("conversation_topic_priority"),
        supabase.from("profile_topic_channels").select("message_channel, enabled"),
      ]);

      if (cancelled) return;

      if (topicsRes.error) {
        log.error("[loadData] topics fetch failed: %o", { error: topicsRes.error });
      }
      if (prefsRes.error) {
        log.error("[loadData] prefs fetch failed: %o", { error: prefsRes.error });
      }

      const slugs = (topicsRes.data ?? []).map((row) => row["conversation_topic_slug"]);
      const prefRows = prefsRes.data ?? [];

      const prefChannelSet = new Set<string>(PREF_CHANNELS);
      const disabled = new Set<PrefChannel>();
      for (const row of prefRows) {
        const channel = row["message_channel"];
        if (!prefChannelSet.has(channel)) continue;
        if (row["enabled"] === false) disabled.add(channel as PrefChannel);
      }

      setTopicSlugs(slugs);
      setDisabledChannels(disabled);
      setLoading(false);
    }

    void fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Flush pending upserts to DB in a single batched write.
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
      log.error("[flushPending] upsert failed: %o", { error, rows });
    }
  }, []);

  function scheduleFlush() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushPending, 600);
  }

  /**
   * Toggle a channel across every topic at once. Optimistically flips the master state, then
   * batches one `enabled = next` row per topic for that channel into the pending upsert.
   */
  function onChannelToggle(channel: PrefChannel, next: boolean) {
    setDisabledChannels((prev) => {
      const updated = new Set(prev);
      if (next) updated.delete(channel);
      else updated.add(channel);
      return updated;
    });

    for (const slug of topicSlugs) {
      pendingRef.current.set(`${slug}:${channel}`, { slug, channel, enabled: next });
    }
    scheduleFlush();
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
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("section_title")}
          </span>
        </div>
        <div className="bg-background flex flex-col overflow-hidden rounded-md border">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 border-b px-4 py-3.5 last:border-b-0">
              <div className="bg-muted h-4 w-40 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t("section_title")}
        </span>
      </div>

      <div className="bg-background flex flex-col overflow-hidden rounded-md border">
        {/* in_app — always on, locked */}
        <div className="flex items-center justify-between gap-3.5 border-b px-4 py-3.5 last:border-b-0">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-foreground text-sm font-medium">{t("channel_in_app")}</span>
            <span className="text-muted-foreground text-xs leading-relaxed text-pretty">{t("in_app_desc")}</span>
          </div>
          <Switch checked disabled aria-label={t("in_app_always_on")} />
        </div>

        {/* Outbound channels */}
        {PREF_CHANNELS.map((ch) => {
          const enabled = CHANNEL_ON(disabledChannels, ch);
          return (
            <div key={ch} className="flex items-center justify-between gap-3.5 border-b px-4 py-3.5 last:border-b-0">
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-foreground text-sm font-medium">{channelLabels[ch]}</span>
                <span className="text-muted-foreground text-xs leading-relaxed text-pretty">
                  {t("channel_desc", { channel: channelLabels[ch] })}
                </span>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(next) => onChannelToggle(ch, next)}
                aria-label={channelLabels[ch]}
              />
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">{t("in_app_note")}</p>
    </div>
  );
}

const LOCALE_ES = {
  section_title: "Canales",
  channel_in_app: "En la app",
  channel_email: "Correo",
  channel_web_push: "Notificaciones push",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  channel_desc: (p: { channel: string }) => `Recibe avisos por ${p.channel} en todos los temas`,
  in_app_desc: "Siempre activo dentro de la aplicación",
  in_app_always_on: "En la app siempre activo",
  in_app_note: "Las notificaciones en la app llegan siempre. Los canales externos respetan estas preferencias.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  section_title: "Channels",
  channel_in_app: "In-app",
  channel_email: "Email",
  channel_web_push: "Push notifications",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  channel_desc: (p: { channel: string }) => `Get alerts by ${p.channel} across every topic`,
  in_app_desc: "Always on inside the app",
  in_app_always_on: "In-app always on",
  in_app_note: "In-app notifications always come through. External channels respect these preferences.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  section_title: "Canais",
  channel_in_app: "No app",
  channel_email: "E-mail",
  channel_web_push: "Notificações push",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  channel_desc: (p: { channel: string }) => `Receba avisos por ${p.channel} em todos os tópicos`,
  in_app_desc: "Sempre ativo dentro do app",
  in_app_always_on: "No app sempre ativo",
  in_app_note: "As notificações no app chegam sempre. Os canais externos respeitam estas preferências.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
