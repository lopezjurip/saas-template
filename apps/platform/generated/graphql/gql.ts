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
  "\n  query TenantHomeQuery($tenantId: Int!) {\n    profile: viewer_profile {\n      profile_name_full\n    }\n    organizationsCollection(\n      filter: {\n        organization_disabled_at: { is: NULL }\n        tenant_id: { eq: $tenantId }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n        }\n      }\n    }\n  }\n": typeof types.TenantHomeQueryDocument;
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  fragment ViewerProfileFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileFragmentFragmentDoc;
  "\n  query UseViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n": typeof types.UseViewerProfileHookQueryDocument;
};
const documents: Documents = {
  "\n  query TenantHomeQuery($tenantId: Int!) {\n    profile: viewer_profile {\n      profile_name_full\n    }\n    organizationsCollection(\n      filter: {\n        organization_disabled_at: { is: NULL }\n        tenant_id: { eq: $tenantId }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n        }\n      }\n    }\n  }\n":
    types.TenantHomeQueryDocument,
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
  "\n  fragment ViewerProfileFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileFragmentFragmentDoc,
  "\n  query UseViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n":
    types.UseViewerProfileHookQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query TenantHomeQuery($tenantId: Int!) {\n    profile: viewer_profile {\n      profile_name_full\n    }\n    organizationsCollection(\n      filter: {\n        organization_disabled_at: { is: NULL }\n        tenant_id: { eq: $tenantId }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").TenantHomeQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HealthQuery {\n    health_current_timestamp\n  }\n",
): typeof import("./graphql").HealthQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n",
): typeof import("./graphql").ViewerProfileFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query UseViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n",
): typeof import("./graphql").UseViewerProfileHookQueryDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
