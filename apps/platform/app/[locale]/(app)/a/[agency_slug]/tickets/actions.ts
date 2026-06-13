"use server";
import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:[locale]:(app):a:[agency_slug]:tickets:actions");

const claimSchema = z.object({
  ticket_id: z.string().uuid(),
  agency_slug: z.string().min(1),
});

/**
 * Claim an open ticket for this agency. The RPC enforces the open-status
 * mutex and permission check atomically.
 *
 * @example
 * const [, err] = await ErrorSafeAction.unwrap(actionClaimTicket({ ticket_id, agency_slug }));
 */
export const actionClaimTicket = authedAction.inputSchema(claimSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);
  const supabase = await createServerClient();

  const { error: rpcError } = await supabase.rpc("ticket_claim", {
    p_ticket_id: parsedInput.ticket_id,
  });

  if (rpcError) {
    const key = rpcError.message as keyof typeof LOCALE_ES;
    if (key in LOCALE_ES) throw new TError(key);
    log.error("[actionClaimTicket] ticket_claim failed", {
      ticket_id: parsedInput.ticket_id,
      error: rpcError.message,
    });
    throw new TError("claim_failed");
  }

  const locale = await getServerLocale();
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets`);
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets/${parsedInput.ticket_id}`);
  return { ticket_id: parsedInput.ticket_id };
});

const resolveSchema = z.object({
  ticket_id: z.string().uuid(),
  agency_slug: z.string().min(1),
  resolution: z.string().trim().max(2000).optional(),
});

/**
 * Resolve a ticket. Stamps conversation resolved_at in the same RPC.
 *
 * @example
 * const [, err] = await ErrorSafeAction.unwrap(actionResolveTicket({ ticket_id, agency_slug, resolution }));
 */
export const actionResolveTicket = authedAction.inputSchema(resolveSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);
  const supabase = await createServerClient();

  const resolutionPayload = parsedInput.resolution ? { note: parsedInput.resolution } : undefined;

  const { error: rpcError } = await supabase.rpc("ticket_resolve", {
    p_ticket_id: parsedInput.ticket_id,
    ...(resolutionPayload !== undefined && { resolution: resolutionPayload }),
  });

  if (rpcError) {
    const key = rpcError.message as keyof typeof LOCALE_ES;
    if (key in LOCALE_ES) throw new TError(key);
    log.error("[actionResolveTicket] ticket_resolve failed", {
      ticket_id: parsedInput.ticket_id,
      error: rpcError.message,
    });
    throw new TError("resolve_failed");
  }

  const locale = await getServerLocale();
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets`);
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets/${parsedInput.ticket_id}`);
  return { ticket_id: parsedInput.ticket_id };
});

const postMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  ticket_id: z.string().uuid(),
  agency_slug: z.string().min(1),
});

/**
 * Post an agent reply message to the conversation thread.
 *
 * @example
 * const [, err] = await ErrorSafeAction.unwrap(actionPostMessage({ conversation_id, body, ticket_id, agency_slug }));
 */
export const actionPostMessage = authedAction.inputSchema(postMessageSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);
  const supabase = await createServerClient();

  const { error: rpcError } = await supabase.rpc("conversation_post_user_message", {
    conversation_id: parsedInput.conversation_id,
    body: parsedInput.body,
  });

  if (rpcError) {
    const key = rpcError.message as keyof typeof LOCALE_ES;
    if (key in LOCALE_ES) throw new TError(key);
    log.error("[actionPostMessage] conversation_post_user_message failed", {
      conversation_id: parsedInput.conversation_id,
      error: rpcError.message,
    });
    throw new TError("post_failed");
  }

  const locale = await getServerLocale();
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets/${parsedInput.ticket_id}`);
  return { conversation_id: parsedInput.conversation_id };
});

const escalateSchema = z.object({
  conversation_id: z.string().uuid(),
  subject: z.string().trim().min(1).max(255),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  agency_slug: z.string().min(1),
});

/**
 * Escalate a conversation to a support ticket.
 *
 * @example
 * const [data, err] = await ErrorSafeAction.unwrap(actionEscalateTicket({ conversation_id, subject, priority, agency_slug }));
 * const ticket_id = data?.ticket_id;
 */
export const actionEscalateTicket = authedAction.inputSchema(escalateSchema).action(async ({ parsedInput }) => {
  const { TError } = await getRosetta(LOCALES);
  const supabase = await createServerClient();

  const { data: ticketId, error: rpcError } = await supabase.rpc("ticket_escalate", {
    p_conversation_id: parsedInput.conversation_id,
    subject: parsedInput.subject,
    ...(parsedInput.priority !== undefined && { priority: parsedInput.priority }),
  });

  if (rpcError) {
    const key = rpcError.message as keyof typeof LOCALE_ES;
    if (key in LOCALE_ES) throw new TError(key);
    log.error("[actionEscalateTicket] ticket_escalate failed", {
      conversation_id: parsedInput.conversation_id,
      error: rpcError.message,
    });
    throw new TError("escalate_failed");
  }

  const locale = await getServerLocale();
  revalidatePath(`/${locale}/a/${parsedInput.agency_slug}/tickets`);
  return { ticket_id: ticketId as string };
});

const LOCALE_ES = {
  ticket_already_claimed: "Este ticket ya fue reclamado por otro agente",
  no_permission: "No tienes permiso para realizar esta acción",
  ticket_not_found: "Ticket no encontrado",
  claim_failed: "No pudimos reclamar el ticket",
  ticket_already_resolved: "Este ticket ya está resuelto",
  resolve_failed: "No pudimos resolver el ticket",
  post_failed: "No pudimos enviar el mensaje",
  conversation_not_found: "Conversación no encontrada",
  ticket_exists: "Ya existe un ticket para esta conversación",
  escalate_failed: "No pudimos escalar el ticket",
  not_authenticated: "No autenticado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  ticket_already_claimed: "This ticket was already claimed by another agent",
  no_permission: "You don't have permission to perform this action",
  ticket_not_found: "Ticket not found",
  claim_failed: "We couldn't claim the ticket",
  ticket_already_resolved: "This ticket is already resolved",
  resolve_failed: "We couldn't resolve the ticket",
  post_failed: "We couldn't send the message",
  conversation_not_found: "Conversation not found",
  ticket_exists: "A ticket already exists for this conversation",
  escalate_failed: "We couldn't escalate the ticket",
  not_authenticated: "Not authenticated",
};

const LOCALE_PT: typeof LOCALE_ES = {
  ticket_already_claimed: "Este ticket já foi reivindicado por outro agente",
  no_permission: "Você não tem permissão para realizar esta ação",
  ticket_not_found: "Ticket não encontrado",
  claim_failed: "Não conseguimos reivindicar o ticket",
  ticket_already_resolved: "Este ticket já está resolvido",
  resolve_failed: "Não conseguimos resolver o ticket",
  post_failed: "Não conseguimos enviar a mensagem",
  conversation_not_found: "Conversa não encontrada",
  ticket_exists: "Já existe um ticket para esta conversa",
  escalate_failed: "Não conseguimos escalar o ticket",
  not_authenticated: "Não autenticado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
