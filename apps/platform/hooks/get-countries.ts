import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { cache } from "react";

export type CountryRow = {
  address_level0_id: string;
  address_level0_name: string;
  address_level0_emoji: string | null;
};

/**
 * Fetches the public list of active countries ordered by display name (server-side).
 * @example
 * const countries = await getCountries();
 */
export const getCountries = cache(async (): Promise<CountryRow[]> => {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("addresses_level0")
    .select("address_level0_id, address_level0_name, address_level0_emoji")
    .is("address_level0_disabled_at", null)
    .order("address_level0_name");
  return (data ?? []) as CountryRow[];
});
