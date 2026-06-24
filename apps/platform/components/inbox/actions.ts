"use server";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { debug } from "~/lib/debug";

const log = debug("app:(app):components:inbox:actions");

/**
 * Marks a list of conversation messages as read.
 */
export async function actionMarkRead(message_ids: string[]): Promise<void> {
  if (message_ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("conversation_mark_read", { message_ids });
  if (error) {
    log.error("[actionMarkRead] failed: %o", { message_ids, error });
    throw new Error("mark_read_failed");
  }
}

/**
 * Archives a conversation.
 */
export async function actionArchive(conversation_id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("conversation_archive", { p_conversation_id: conversation_id });
  if (error) {
    log.error("[actionArchive] failed: %o", { conversation_id, error });
    throw new Error("archive_failed");
  }
}
