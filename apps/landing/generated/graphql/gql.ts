/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument;
};
const documents: Documents = {
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HealthQuery {\n    health_current_timestamp\n  }\n",
): typeof import("./graphql").HealthQueryDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
