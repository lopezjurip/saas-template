"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";

export const CountryHookFragment = /*#__PURE__*/ gql(`
  fragment CountryHookFragment on addresses_level0 {
    address_level0_id
    address_level0_name
    address_level0_emoji
  }
`);

export type CountryHookFragmentType = ResultOf<typeof CountryHookFragment>;

// `first: 250` overrides pg_graphql's default page size so a single call returns
// every country (currently 247 rows in addresses_level0). The schema-wide `max_rows`
// directive in schema.sql also caps page size at 250.
export const CountriesHookQuery = /*#__PURE__*/ gql(`
  query CountriesHookQuery {
    addresses_level0Collection(
      filter: { address_level0_disabled_at: { is: NULL } }
      orderBy: [{ address_level0_name: AscNullsLast }]
      first: 250
    ) {
      edges {
        node {
          ...CountryHookFragment
        }
      }
    }
  }
`);

type CountriesHookQueryData = ResultOf<typeof CountriesHookQuery>;

/**
 * Returns the public list of countries (ISO 3166-1 alpha-2). Unauthenticated callers
 * are allowed by the `addresses_level0` SELECT policy.
 */
export function useCountries(config?: SWRConfiguration<CountriesHookQueryData>) {
  return useGraphyQuery({ query: CountriesHookQuery }, config);
}
