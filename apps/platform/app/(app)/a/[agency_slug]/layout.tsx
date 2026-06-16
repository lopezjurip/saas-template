import { notFound } from "next/navigation";
import { OrderByDirection } from "~/generated/graphql/graphql";
import { getViewerAgencies, getViewerAgencyBySlug } from "~/hooks/get-viewer-agencies";
import { AgencyNav, type NavAgency } from "./agency-nav";

export default async function AgencyShellLayout(props: LayoutProps<"/a/[agency_slug]">) {
  const { agency_slug } = await props.params;

  // RLS-scoped gql fetch doubles as the affiliate gate: non-members get null → 404.
  // `cache()`-wrapped so each child page re-fetches the same row with zero extra round-trips.
  const [agencyRes, agenciesRes] = await Promise.all([
    getViewerAgencyBySlug(agency_slug),
    getViewerAgencies({ orderBy: [{ agencyName: OrderByDirection.AscNullsLast }] }),
  ]);
  const agency = agencyRes.data?.["agency"];
  if (!agency) notFound();

  const agencies: NavAgency[] = (agenciesRes.data?.["agencies"]?.["edges"] ?? []).map((edge) => {
    const node = edge["node"];
    return {
      agency_id: node["agencyId"],
      agency_slug: node["agencySlug"],
      agency_name: node["agencyName"],
    };
  });

  const current: NavAgency = {
    agency_id: agency["agencyId"],
    agency_slug: agency["agencySlug"],
    agency_name: agency["agencyName"],
  };

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      <AgencyNav agency={current} agencies={agencies} />
      <main className="flex min-h-0 flex-1 flex-col overflow-auto">{props.children}</main>
    </div>
  );
}
