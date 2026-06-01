import { createServiceRoleClient } from "@packages/supabase/client.service";
import { cache } from "react";

export const getTenantReservedSlugs = cache(async (): Promise<Set<string>> => {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("reserved_slugs").select("reserved_slug");

  return new Set(data?.map((row) => row["reserved_slug"].toLowerCase()) ?? []);
});
