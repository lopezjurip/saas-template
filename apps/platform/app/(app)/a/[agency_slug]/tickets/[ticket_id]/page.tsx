import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";
import { type ConversationMessage, TicketDetail, type TicketDetailData } from "./ticket-detail";

export async function generateMetadata(props: PageProps<"/a/[agency_slug]/tickets/[ticket_id]">): Promise<Metadata> {
  const { ticket_id } = await props.params;
  const { t } = await getRosetta(LOCALES);
  // Ticket RLS already scopes to agency affiliates → authenticated client, no service role.
  const supabase = await createSupabaseServerClient();
  const res = await supabase.from("tickets").select("ticket_subject").eq("ticket_id", ticket_id).maybeSingle();
  return { title: res.data?.["ticket_subject"] ?? t("page_title") };
}

export default async function AgencyTicketDetailPage(props: PageProps<"/a/[agency_slug]/tickets/[ticket_id]">) {
  const { agency_slug, ticket_id } = await props.params;

  const supabase = await createSupabaseServerClient();

  // RLS-scoped gql fetch is itself the active-affiliate gate (viewer_agency_ids()
  // is accepted-and-not-revoked) → non-members get 404. No service-role client.
  const { data: agencyData } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = agencyData["agency"];

  // Load ticket via authenticated client (RLS enforces agency access).
  const ticketRes = await supabase
    .from("tickets")
    .select(
      "ticket_id, ticket_subject, ticket_status, ticket_priority, ticket_claimed_at, ticket_resolved_at, ticket_created_at, assigned_profile_id, assigned_agency_id, organization_id, tenant_id, conversation_id, organizations(organization_name, organization_slug), tenants(tenant_name, tenant_slug)",
    )
    .eq("ticket_id", ticket_id)
    .maybeSingle();

  if (!ticketRes.data) notFound();
  const row = ticketRes.data;

  // Load conversation messages via the viewer RPC.
  const messagesRes = await supabase.rpc("viewer_conversation_messages_collection", {
    p_conversation_id: row["conversation_id"],
  });

  const messages: ConversationMessage[] = (messagesRes.data ?? []).map((msg) => ({
    conversation_message_id: msg["conversation_message_id"],
    conversation_id: msg["conversation_id"],
    message_author: msg["message_author"],
    message_body: msg["message_body"],
    message_direction: msg["message_direction"],
    message_created_at: msg["message_created_at"],
    message_priority: msg["message_priority"],
    message_channel: msg["message_channel"],
  }));

  const data: TicketDetailData = {
    ticket_id: row["ticket_id"],
    ticket_subject: row["ticket_subject"],
    ticket_status: row["ticket_status"],
    ticket_priority: row["ticket_priority"],
    ticket_claimed_at: row["ticket_claimed_at"],
    ticket_resolved_at: row["ticket_resolved_at"],
    ticket_created_at: row["ticket_created_at"],
    assigned_profile_id: row["assigned_profile_id"],
    assigned_agency_id: row["assigned_agency_id"],
    organization_id: row["organization_id"],
    tenant_id: row["tenant_id"],
    conversation_id: row["conversation_id"],
    organization_name: row["organizations"]?.["organization_name"] ?? null,
    organization_slug: row["organizations"]?.["organization_slug"] ?? null,
    tenant_name: row["tenants"]?.["tenant_name"] ?? null,
    tenant_slug: row["tenants"]?.["tenant_slug"] ?? null,
    agency_id: agency["agencyId"],
    agency_slug: agency["agencySlug"],
    agency_name: agency["agencyName"],
    messages,
  };

  return <TicketDetail data={data} />;
}

const LOCALE_ES = { page_title: "Ticket" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Ticket" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Ticket" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
