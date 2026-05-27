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
  "\n  mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {\n    insertIntomembership_permissionsCollection(\n      objects: [{ membership_id: $membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditMembershipGrantPermissionMutationDocument;
  "\n  mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {\n    deleteFrommembership_permissionsCollection(\n      filter: { membership_id: { eq: $membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditMembershipRevokePermissionMutationDocument;
  "\n  mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: { membership_id: { eq: $membership_id } }\n      set: { membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditMembershipRevokeMembershipMutationDocument;
  "\n  query AccountPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n": typeof types.AccountPageQueryDocument;
  "\n  query DashboardPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n": typeof types.DashboardPageQueryDocument;
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  fragment CountryFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryFragmentFragmentDoc;
  "\n  query CountriesQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesQueryDocument;
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryGetFragmentFragmentDoc;
  "\n  query CountriesGetQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesGetQueryDocument;
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationGetFragmentFragmentDoc;
  "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsGetQueryDocument;
  "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationByIdGetQueryDocument;
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileGetFragmentFragmentDoc;
  "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": typeof types.ViewerProfileGetQueryDocument;
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantGetFragmentFragmentDoc;
  "\n  query ViewerTenantsGetQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsGetQueryDocument;
  "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantBySlugGetQueryDocument;
  "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryHookFragmentFragmentDoc;
  "\n  query CountriesHookQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesHookQueryDocument;
  "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationHookFragmentFragmentDoc;
  "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsHookQueryDocument;
  "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationByIdHookQueryDocument;
  "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileHookFragmentFragmentDoc;
  "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n": typeof types.ViewerProfileHookQueryDocument;
  "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantHookFragmentFragmentDoc;
  "\n  query ViewerTenantsHookQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsHookQueryDocument;
  "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantBySlugHookQueryDocument;
  "\n  fragment ViewerProfileFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileFragmentFragmentDoc;
  "\n  query ViewerProfileQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n": typeof types.ViewerProfileQueryDocument;
  "\n  fragment ViewerTenantFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantFragmentFragmentDoc;
  "\n  query ViewerTenantsQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsQueryDocument;
  "\n  query ViewerTenantBySlugQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantBySlugQueryDocument;
  "\n  fragment ViewerOrganizationFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationFragmentFragmentDoc;
  "\n  query ViewerOrganizationsQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsQueryDocument;
  "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationByIdQueryDocument;
};
const documents: Documents = {
  "\n  mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {\n    insertIntomembership_permissionsCollection(\n      objects: [{ membership_id: $membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipGrantPermissionMutationDocument,
  "\n  mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {\n    deleteFrommembership_permissionsCollection(\n      filter: { membership_id: { eq: $membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipRevokePermissionMutationDocument,
  "\n  mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: { membership_id: { eq: $membership_id } }\n      set: { membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipRevokeMembershipMutationDocument,
  "\n  query AccountPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n":
    types.AccountPageQueryDocument,
  "\n  query DashboardPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n":
    types.DashboardPageQueryDocument,
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
  "\n  fragment CountryFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryFragmentFragmentDoc,
  "\n  query CountriesQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesQueryDocument,
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryGetFragmentFragmentDoc,
  "\n  query CountriesGetQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesGetQueryDocument,
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationGetFragmentFragmentDoc,
  "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsGetQueryDocument,
  "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationByIdGetQueryDocument,
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileGetFragmentFragmentDoc,
  "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n":
    types.ViewerProfileGetQueryDocument,
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantGetFragmentFragmentDoc,
  "\n  query ViewerTenantsGetQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsGetQueryDocument,
  "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantBySlugGetQueryDocument,
  "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryHookFragmentFragmentDoc,
  "\n  query CountriesHookQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesHookQueryDocument,
  "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationHookFragmentFragmentDoc,
  "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsHookQueryDocument,
  "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationByIdHookQueryDocument,
  "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileHookFragmentFragmentDoc,
  "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n":
    types.ViewerProfileHookQueryDocument,
  "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantHookFragmentFragmentDoc,
  "\n  query ViewerTenantsHookQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsHookQueryDocument,
  "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantBySlugHookQueryDocument,
  "\n  fragment ViewerProfileFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileFragmentFragmentDoc,
  "\n  query ViewerProfileQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n":
    types.ViewerProfileQueryDocument,
  "\n  fragment ViewerTenantFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantFragmentFragmentDoc,
  "\n  query ViewerTenantsQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsQueryDocument,
  "\n  query ViewerTenantBySlugQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantBySlugQueryDocument,
  "\n  fragment ViewerOrganizationFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationFragmentFragmentDoc,
  "\n  query ViewerOrganizationsQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsQueryDocument,
  "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationByIdQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {\n    insertIntomembership_permissionsCollection(\n      objects: [{ membership_id: $membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditMembershipGrantPermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {\n    deleteFrommembership_permissionsCollection(\n      filter: { membership_id: { eq: $membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditMembershipRevokePermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: { membership_id: { eq: $membership_id } }\n      set: { membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditMembershipRevokeMembershipMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query AccountPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").AccountPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query DashboardPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").DashboardPageQueryDocument;
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
  source: "\n  fragment CountryFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n",
): typeof import("./graphql").CountryFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n",
): typeof import("./graphql").CountryGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesGetQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n",
): typeof import("./graphql").ViewerOrganizationGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n",
): typeof import("./graphql").ViewerProfileGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n",
): typeof import("./graphql").ViewerTenantGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsGetQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n",
): typeof import("./graphql").CountryHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesHookQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n",
): typeof import("./graphql").ViewerOrganizationHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n",
): typeof import("./graphql").ViewerProfileHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n",
): typeof import("./graphql").ViewerTenantHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsHookQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugHookQueryDocument;
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
  source: "\n  query ViewerProfileQuery {\n    profile: viewer_profile {\n      ...ViewerProfileFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n",
): typeof import("./graphql").ViewerTenantFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsQuery {\n    tenantsCollection(\n      filter: { tenant_disabled_at: { is: NULL } }\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugQuery($tenant_slug: String!) {\n    tenantsCollection(\n      filter: { tenant_slug: { eq: $tenant_slug }, tenant_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerTenantFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n",
): typeof import("./graphql").ViewerOrganizationFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsQuery($tenant_id: Int) {\n    organizationsCollection(\n      filter: {\n        tenant_id: { eq: $tenant_id }\n        organization_disabled_at: { is: NULL }\n      }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organizationsCollection(\n      filter: { organization_id: { eq: $organization_id }, organization_disabled_at: { is: NULL } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdQueryDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
