"use server";

import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { debug } from "~/lib/debug";

const log = debug("app:[locale]:(app):home:inbox:[conversation_id]:actions");

/**
 * Marks a list of conversation messages as read.
 */
export async function actionMarkRead(message_ids: string[]): Promise<void> {
  if (message_ids.length === 0) return;
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("conversation_archive", { p_conversation_id: conversation_id });
  if (error) {
    log.error("[actionArchive] failed: %o", { conversation_id, error });
    throw new Error("archive_failed");
  }
}

/**
 * Posts a user message to a conversation.
 * Returns the new message_id on success.
 */
export async function actionPostMessage(conversation_id: string, body: string): Promise<string> {
  const user = await getSupabaseServerUser();
  if (!user) throw new Error("unauthenticated");

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("conversation_post_user_message", {
    conversation_id,
    body,
  });
  if (error) {
    log.error("[actionPostMessage] failed: %o", { conversation_id, error });
    throw new Error(error.message || "post_failed");
  }
  return data as string;
}
