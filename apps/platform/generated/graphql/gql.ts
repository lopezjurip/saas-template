/* eslint-disable */
import * as types from './graphql';



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
    "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.OnboardingProfileFormUpdateNameMutationDocument,
    "\n  query ProfileSectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n    }\n  }\n": typeof types.ProfileSectionPageQueryDocument,
    "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileSectionUpdateNameMutationDocument,
    "\n  query SecuritySectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n": typeof types.SecuritySectionPageQueryDocument,
    "\n  mutation SecurityPasskeysListDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromprofile_webauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.SecurityPasskeysListDeleteMutationDocument,
    "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n": typeof types.HomePickerPageQueryDocument,
    "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipGrantPermissionMutationDocument,
    "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokePermissionMutationDocument,
    "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument,
    "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.MembersPendingInvitationsCancelMutationDocument,
    "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument,
    "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryGetFragmentFragmentDoc,
    "\n  query CountriesGetQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesGetQueryDocument,
    "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationGetFragmentFragmentDoc,
    "\n  query ViewerOrganizationsGetQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsGetQueryDocument,
    "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdGetQueryDocument,
    "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileGetFragmentFragmentDoc,
    "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": typeof types.ViewerProfileGetQueryDocument,
    "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantGetFragmentFragmentDoc,
    "\n  query ViewerTenantsGetQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsGetQueryDocument,
    "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugGetQueryDocument,
    "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryHookFragmentFragmentDoc,
    "\n  query CountriesHookQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesHookQueryDocument,
    "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationHookFragmentFragmentDoc,
    "\n  query ViewerOrganizationsHookQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsHookQueryDocument,
    "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdHookQueryDocument,
    "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileHookFragmentFragmentDoc,
    "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n": typeof types.ViewerProfileHookQueryDocument,
    "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantHookFragmentFragmentDoc,
    "\n  query ViewerTenantsHookQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsHookQueryDocument,
    "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugHookQueryDocument,
    "\n  fragment PasskeyCredentialFragment on profile_webauthn_credentials {\n    profile_id\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n  }\n": typeof types.PasskeyCredentialFragmentFragmentDoc,
    "\n  query PasskeyCredentialsCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_credentialsFilter\n    $orderBy: [profile_webauthn_credentialsOrderBy!]\n  ) {\n    profile_webauthn_credentialsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n": typeof types.PasskeyCredentialsCollectionQueryDocument,
    "\n  mutation PasskeyCredentialsInsertMutation($objects: [profile_webauthn_credentialsInsertInput!]!) {\n    insertIntoprofile_webauthn_credentialsCollection(objects: $objects) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n": typeof types.PasskeyCredentialsInsertMutationDocument,
    "\n  mutation PasskeyCredentialsUpdateMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_credentialsFilter\n    $set: profile_webauthn_credentialsUpdateInput!\n  ) {\n    updateprofile_webauthn_credentialsCollection(atMost: $atMost, filter: $filter, set: $set) {\n      affectedCount\n    }\n  }\n": typeof types.PasskeyCredentialsUpdateMutationDocument,
    "\n  query PasskeyChallengesCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_challengesFilter\n    $orderBy: [profile_webauthn_challengesOrderBy!]\n  ) {\n    profile_webauthn_challengesCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n": typeof types.PasskeyChallengesCollectionQueryDocument,
    "\n  mutation PasskeyChallengesInsertMutation($objects: [profile_webauthn_challengesInsertInput!]!) {\n    insertIntoprofile_webauthn_challengesCollection(objects: $objects) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n": typeof types.PasskeyChallengesInsertMutationDocument,
    "\n  mutation PasskeyChallengesDeleteMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_challengesFilter\n  ) {\n    deleteFromprofile_webauthn_challengesCollection(atMost: $atMost, filter: $filter) {\n      affectedCount\n    }\n  }\n": typeof types.PasskeyChallengesDeleteMutationDocument,
    "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n": typeof types.PasskeyProfileIdByEmailQueryDocument,
};
const documents: Documents = {
    "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": types.OnboardingProfileFormUpdateNameMutationDocument,
    "\n  query ProfileSectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n    }\n  }\n": types.ProfileSectionPageQueryDocument,
    "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": types.ProfileSectionUpdateNameMutationDocument,
    "\n  query SecuritySectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n": types.SecuritySectionPageQueryDocument,
    "\n  mutation SecurityPasskeysListDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromprofile_webauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n": types.SecurityPasskeysListDeleteMutationDocument,
    "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n": types.HomePickerPageQueryDocument,
    "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n": types.EditOrganizationMembershipGrantPermissionMutationDocument,
    "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n": types.EditOrganizationMembershipRevokePermissionMutationDocument,
    "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n": types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument,
    "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n": types.MembersPendingInvitationsCancelMutationDocument,
    "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
    "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": types.CountryGetFragmentFragmentDoc,
    "\n  query CountriesGetQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": types.CountriesGetQueryDocument,
    "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": types.ViewerOrganizationGetFragmentFragmentDoc,
    "\n  query ViewerOrganizationsGetQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": types.ViewerOrganizationsGetQueryDocument,
    "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n": types.ViewerOrganizationByIdGetQueryDocument,
    "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": types.ViewerProfileGetFragmentFragmentDoc,
    "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": types.ViewerProfileGetQueryDocument,
    "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": types.ViewerTenantGetFragmentFragmentDoc,
    "\n  query ViewerTenantsGetQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": types.ViewerTenantsGetQueryDocument,
    "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": types.ViewerTenantBySlugGetQueryDocument,
    "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": types.CountryHookFragmentFragmentDoc,
    "\n  query CountriesHookQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n": types.CountriesHookQueryDocument,
    "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": types.ViewerOrganizationHookFragmentFragmentDoc,
    "\n  query ViewerOrganizationsHookQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n": types.ViewerOrganizationsHookQueryDocument,
    "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n": types.ViewerOrganizationByIdHookQueryDocument,
    "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": types.ViewerProfileHookFragmentFragmentDoc,
    "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n": types.ViewerProfileHookQueryDocument,
    "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": types.ViewerTenantHookFragmentFragmentDoc,
    "\n  query ViewerTenantsHookQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n": types.ViewerTenantsHookQueryDocument,
    "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n": types.ViewerTenantBySlugHookQueryDocument,
    "\n  fragment PasskeyCredentialFragment on profile_webauthn_credentials {\n    profile_id\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n  }\n": types.PasskeyCredentialFragmentFragmentDoc,
    "\n  query PasskeyCredentialsCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_credentialsFilter\n    $orderBy: [profile_webauthn_credentialsOrderBy!]\n  ) {\n    profile_webauthn_credentialsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n": types.PasskeyCredentialsCollectionQueryDocument,
    "\n  mutation PasskeyCredentialsInsertMutation($objects: [profile_webauthn_credentialsInsertInput!]!) {\n    insertIntoprofile_webauthn_credentialsCollection(objects: $objects) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n": types.PasskeyCredentialsInsertMutationDocument,
    "\n  mutation PasskeyCredentialsUpdateMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_credentialsFilter\n    $set: profile_webauthn_credentialsUpdateInput!\n  ) {\n    updateprofile_webauthn_credentialsCollection(atMost: $atMost, filter: $filter, set: $set) {\n      affectedCount\n    }\n  }\n": types.PasskeyCredentialsUpdateMutationDocument,
    "\n  query PasskeyChallengesCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_challengesFilter\n    $orderBy: [profile_webauthn_challengesOrderBy!]\n  ) {\n    profile_webauthn_challengesCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n": types.PasskeyChallengesCollectionQueryDocument,
    "\n  mutation PasskeyChallengesInsertMutation($objects: [profile_webauthn_challengesInsertInput!]!) {\n    insertIntoprofile_webauthn_challengesCollection(objects: $objects) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n": types.PasskeyChallengesInsertMutationDocument,
    "\n  mutation PasskeyChallengesDeleteMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_challengesFilter\n  ) {\n    deleteFromprofile_webauthn_challengesCollection(atMost: $atMost, filter: $filter) {\n      affectedCount\n    }\n  }\n": types.PasskeyChallengesDeleteMutationDocument,
    "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n": types.PasskeyProfileIdByEmailQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').OnboardingProfileFormUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ProfileSectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n    }\n  }\n"): typeof import('./graphql').ProfileSectionPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').ProfileSectionUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query SecuritySectionPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').SecuritySectionPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SecurityPasskeysListDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromprofile_webauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').SecurityPasskeysListDeleteMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').HomePickerPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').EditOrganizationMembershipGrantPermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').EditOrganizationMembershipRevokePermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').MembersPendingInvitationsCancelMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query HealthQuery {\n    health_current_timestamp\n  }\n"): typeof import('./graphql').HealthQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n"): typeof import('./graphql').CountryGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CountriesGetQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').CountriesGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n"): typeof import('./graphql').ViewerOrganizationGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerOrganizationsGetQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ViewerOrganizationsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n"): typeof import('./graphql').ViewerOrganizationByIdGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n"): typeof import('./graphql').ViewerProfileGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n"): typeof import('./graphql').ViewerProfileGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n"): typeof import('./graphql').ViewerTenantGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerTenantsGetQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ViewerTenantsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n"): typeof import('./graphql').ViewerTenantBySlugGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n"): typeof import('./graphql').CountryHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CountriesHookQuery {\n    addresses_level0: addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').CountriesHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n"): typeof import('./graphql').ViewerOrganizationHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerOrganizationsHookQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {\n    organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ViewerOrganizationsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n"): typeof import('./graphql').ViewerOrganizationByIdHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n"): typeof import('./graphql').ViewerProfileHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n"): typeof import('./graphql').ViewerProfileHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n"): typeof import('./graphql').ViewerTenantHookFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerTenantsHookQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {\n    tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ViewerTenantsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n"): typeof import('./graphql').ViewerTenantBySlugHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment PasskeyCredentialFragment on profile_webauthn_credentials {\n    profile_id\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n  }\n"): typeof import('./graphql').PasskeyCredentialFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PasskeyCredentialsCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_credentialsFilter\n    $orderBy: [profile_webauthn_credentialsOrderBy!]\n  ) {\n    profile_webauthn_credentialsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').PasskeyCredentialsCollectionQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PasskeyCredentialsInsertMutation($objects: [profile_webauthn_credentialsInsertInput!]!) {\n    insertIntoprofile_webauthn_credentialsCollection(objects: $objects) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n"): typeof import('./graphql').PasskeyCredentialsInsertMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PasskeyCredentialsUpdateMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_credentialsFilter\n    $set: profile_webauthn_credentialsUpdateInput!\n  ) {\n    updateprofile_webauthn_credentialsCollection(atMost: $atMost, filter: $filter, set: $set) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').PasskeyCredentialsUpdateMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PasskeyChallengesCollectionQuery(\n    $first: Int\n    $filter: profile_webauthn_challengesFilter\n    $orderBy: [profile_webauthn_challengesOrderBy!]\n  ) {\n    profile_webauthn_challengesCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').PasskeyChallengesCollectionQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PasskeyChallengesInsertMutation($objects: [profile_webauthn_challengesInsertInput!]!) {\n    insertIntoprofile_webauthn_challengesCollection(objects: $objects) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n"): typeof import('./graphql').PasskeyChallengesInsertMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PasskeyChallengesDeleteMutation(\n    $atMost: Int! = 1\n    $filter: profile_webauthn_challengesFilter\n  ) {\n    deleteFromprofile_webauthn_challengesCollection(atMost: $atMost, filter: $filter) {\n      affectedCount\n    }\n  }\n"): typeof import('./graphql').PasskeyChallengesDeleteMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n"): typeof import('./graphql').PasskeyProfileIdByEmailQueryDocument;


export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
