import "server-only";

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs, OrderByDirection } from "~/generated/graphql/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const CountryGetFragment = /*#__PURE__*/ gql(`
  fragment CountryGetFragment on AddressesLevel0 {
    addressLevel0Id
    addressLevel0Name
    addressLevel0Emoji
  }
`);

export type CountryGetFragmentType = ResultOf<typeof CountryGetFragment>;

export const CountriesGet = /*#__PURE__*/ gql(`
  query CountriesGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: AddressesLevel0Filter
    $orderBy: [AddressesLevel0OrderBy!]
  ) {
    addressesLevel0: addressesLevel0Collection(
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
      filter: { addressLevel0DisabledAt: { is: FilterIs.Null } },
      orderBy: [{ addressLevel0Name: OrderByDirection.AscNullsLast }],
      ...options,
    },
  });
});
