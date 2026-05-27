import "server-only";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

export const CountryGetFragment = /*#__PURE__*/ gql(`
  fragment CountryGetFragment on addresses_level0 {
    address_level0_id
    address_level0_name
    address_level0_emoji
  }
`);

export type CountryGetFragmentType = ResultOf<typeof CountryGetFragment>;

export const CountriesGetQuery = /*#__PURE__*/ gql(`
  query CountriesGetQuery {
    addresses_level0Collection(
      filter: { address_level0_disabled_at: { is: NULL } }
      orderBy: [{ address_level0_name: AscNullsLast }]
      first: 250
    ) {
      edges {
        node {
          ...CountryGetFragment
        }
      }
    }
  }
`);

/**
 * Fetches the public list of countries (server-side).
 */
export async function getCountries() {
  const graphy = await getGraphySession();
  return await graphy.query({ query: CountriesGetQuery });
}
