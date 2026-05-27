// Shared GraphQL fragment + query for the country list. Lives in its own module —
// no "use client" / "server-only" directive — so both bundles can import it.

import type { ResultOf } from "@graphql-typed-document-node/core";
import { gql } from "~/generated/graphql";

export const CountryFragment = /*#__PURE__*/ gql(`
  fragment CountryFragment on addresses_level0 {
    address_level0_id
    address_level0_name
    address_level0_emoji
  }
`);

export type CountryFragmentType = ResultOf<typeof CountryFragment>;

// `first: 250` overrides pg_graphql's default page size so a single call returns
// every country (currently 247 rows in addresses_level0). The schema-wide `max_rows`
// directive in schema.sql also caps page size at 250.
export const CountriesQuery = /*#__PURE__*/ gql(`
  query CountriesQuery {
    addresses_level0Collection(
      filter: { address_level0_disabled_at: { is: NULL } }
      orderBy: [{ address_level0_name: AscNullsLast }]
      first: 250
    ) {
      edges {
        node {
          ...CountryFragment
        }
      }
    }
  }
`);
