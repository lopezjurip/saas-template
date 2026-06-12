import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs, OrderByDirection } from "~/generated/graphql/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const CountryGetFragment = /*#__PURE__*/ gql(`
  fragment CountryGetFragment on addresses_level0 {
    address_level0_id
    address_level0_name
    address_level0_emoji
  }
`);

export type CountryGetFragmentType = ResultOf<typeof CountryGetFragment>;

export const CountriesGet = /*#__PURE__*/ gql(`
  query CountriesGet(
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
          ...CountryGetFragment
        }
      }
    }
  }
`);

type CountriesGetVars = VariablesOf<typeof CountriesGet>;

/**
 * Fetches the public list of countries (server-side).
 */
export const getCountries = cache(async (options?: CountriesGetVars) => {
  const graphy = await getGraphySession();
  return await graphy.query({
    query: CountriesGet,
    variables: {
      first: 250,
      filter: { address_level0_disabled_at: { is: FilterIs.Null } },
      orderBy: [{ address_level0_name: OrderByDirection.AscNullsLast }],
      ...options,
    },
  });
});
