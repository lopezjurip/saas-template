"use client";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
import { FilterIs, OrderByDirection } from "~/generated/graphql/graphql";

export const CountryHookUseFragment = /*#__PURE__*/ gql(`
  fragment CountryHookUseFragment on addresses_level0 {
    address_level0_id
    address_level0_name
    address_level0_emoji
  }
`);

export type CountryHookUseFragmentType = ResultOf<typeof CountryHookUseFragment>;

export const CountriesUse = /*#__PURE__*/ gql(`
  query CountriesUse(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: addresses_level0Filter
    $orderBy: [addresses_level0OrderBy!]
  ) {
    addresses_level0: addresses_level0Collection(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...CountryHookUseFragment
        }
      }
    }
  }
`);

type CountriesUseData = ResultOf<typeof CountriesUse>;
type CountriesUseVars = VariablesOf<typeof CountriesUse>;

/**
 * Returns the public list of countries (ISO 3166-1 alpha-2). Unauthenticated callers
 * are allowed by the `addresses_level0` SELECT policy.
 */
export function useCountries(options?: CountriesUseVars, config?: SWRConfiguration<CountriesUseData>) {
  return useGraphyQuery(
    {
      query: CountriesUse,
      variables: {
        first: 250,
        filter: { address_level0_disabled_at: { is: FilterIs.Null } },
        orderBy: [{ address_level0_name: OrderByDirection.AscNullsLast }],
        ...options,
      },
    },
    config,
  );
}
