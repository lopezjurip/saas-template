import { cache } from "react";
import { createServiceRoleClient } from "@packages/supabase/client.service";

export const getTenantReservedSlugs = cache(async (): Promise<Set<string>> => {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("reserved_slugs").select("reserved_slug");

  return new Set(data?.map((row) => row["reserved_slug"].toLowerCase()) ?? []);
});
