import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";
import { type PoolTicket, TicketPool } from "./ticket-pool";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyTicketsPage(props: PageProps<"/a/[agency_slug]/tickets">) {
  const { agency_slug } = await props.params;

  // The cached, RLS-scoped gql fetch is also the affiliate gate (non-members → 404),
  // so no hand-rolled membership check is needed here anymore.
  const { data } = await getViewerAgencyBySlugAssert(agency_slug);
  const agency = data["agency"];

  // Fetch tickets accessible to this agency via RLS (viewer_agency_permission_org_ids).
  // Query via authenticated client — RLS policy allows agency members with tickets_manage.
  const supabase = await createSupabaseServerClient();
  const ticketsRes = await supabase
    .from("tickets")
    .select(
      "ticket_id, ticket_subject, ticket_status, ticket_priority, ticket_claimed_at, ticket_resolved_at, ticket_created_at, assigned_profile_id, assigned_agency_id, organization_id, tenant_id, conversation_id, organizations(organization_name, organization_slug), tenants(tenant_name, tenant_slug)",
    )
    .order("ticket_created_at", { ascending: false })
    .limit(200);

  const tickets: PoolTicket[] = (ticketsRes.data ?? []).map((row) => ({
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
  }));

  return <TicketPool tickets={tickets} agency_id={agency["agencyId"]} agency_slug={agency["agencySlug"]} />;
}

const LOCALE_ES = { page_title: "Tickets de soporte" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Support tickets" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Tickets de suporte" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
