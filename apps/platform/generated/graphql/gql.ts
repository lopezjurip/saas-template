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
  "\n  mutation MembersPendingInvitationsCancelMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: {\n        membership_id: { eq: $membership_id }\n        profile_id: { is: NULL }\n        membership_revoked_at: { is: NULL }\n        membership_rejected_at: { is: NULL }\n      }\n      set: {\n        membership_revoked_at: $now\n        membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.MembersPendingInvitationsCancelMutationDocument;
  "\n  query AccountPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n": typeof types.AccountPageQueryDocument;
  "\n  mutation AccountPasskeysSectionDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromwebauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.AccountPasskeysSectionDeleteMutationDocument;
  "\n  mutation AccountProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.AccountProfileFormUpdateNameMutationDocument;
  "\n  query DashboardPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n": typeof types.DashboardPageQueryDocument;
  "\n  mutation OnboardingNameStepUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.OnboardingNameStepUpdateNameMutationDocument;
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryGetFragmentFragmentDoc;
  "\n  query CountriesGetQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesGetQueryDocument;
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationGetFragmentFragmentDoc;
  "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsGetQueryDocument;
  "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdGetQueryDocument;
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileGetFragmentFragmentDoc;
  "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": typeof types.ViewerProfileGetQueryDocument;
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantGetFragmentFragmentDoc;
  "\n  query ViewerTenantsGetQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsGetQueryDocument;
  "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugGetQueryDocument;
  "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryHookFragmentFragmentDoc;
  "\n  query CountriesHookQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesHookQueryDocument;
  "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationHookFragmentFragmentDoc;
  "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsHookQueryDocument;
  "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdHookQueryDocument;
  "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileHookFragmentFragmentDoc;
  "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n": typeof types.ViewerProfileHookQueryDocument;
  "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantHookFragmentFragmentDoc;
  "\n  query ViewerTenantsHookQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsHookQueryDocument;
  "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugHookQueryDocument;
  "\n  fragment PasskeyCredentialFragment on webauthn_credentials {\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n    profile_id\n  }\n": typeof types.PasskeyCredentialFragmentFragmentDoc;
  "\n  query PasskeyListByProfileQuery($profile_id: UUID!) {\n    webauthn_credentialsCollection(filter: { profile_id: { eq: $profile_id } }) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n": typeof types.PasskeyListByProfileQueryDocument;
  "\n  query PasskeyByExternalIdQuery($external_id: String!) {\n    webauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n": typeof types.PasskeyByExternalIdQueryDocument;
  "\n  mutation PasskeyUpdateSignCountMutation(\n    $external_id: String!\n    $sign_count: Int!\n    $last_used_at: Datetime!\n  ) {\n    updatewebauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      set: {\n        webauthn_credential_sign_count: $sign_count\n        webauthn_credential_last_used_at: $last_used_at\n      }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.PasskeyUpdateSignCountMutationDocument;
  "\n  mutation PasskeyInsertCredentialMutation($input: webauthn_credentialsInsertInput!) {\n    insertIntowebauthn_credentialsCollection(objects: [$input]) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n": typeof types.PasskeyInsertCredentialMutationDocument;
  "\n  mutation PasskeyAnonChallengeInsertMutation($challenge_value: String!) {\n    insertIntowebauthn_challengesCollection(objects: [{ webauthn_challenge_value: $challenge_value }]) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n": typeof types.PasskeyAnonChallengeInsertMutationDocument;
  "\n  query PasskeyChallengeByProfileQuery($profile_id: UUID!) {\n    webauthn_challengesCollection(filter: { profile_id: { eq: $profile_id } }, first: 1) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n": typeof types.PasskeyChallengeByProfileQueryDocument;
  "\n  query PasskeyChallengeByIdQuery($challenge_id: UUID!) {\n    webauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n": typeof types.PasskeyChallengeByIdQueryDocument;
  "\n  mutation PasskeyChallengeDeleteMutation($challenge_id: UUID!) {\n    deleteFromwebauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.PasskeyChallengeDeleteMutationDocument;
  "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n": typeof types.PasskeyProfileIdByEmailQueryDocument;
};
const documents: Documents = {
  "\n  mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {\n    insertIntomembership_permissionsCollection(\n      objects: [{ membership_id: $membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipGrantPermissionMutationDocument,
  "\n  mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {\n    deleteFrommembership_permissionsCollection(\n      filter: { membership_id: { eq: $membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipRevokePermissionMutationDocument,
  "\n  mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: { membership_id: { eq: $membership_id } }\n      set: { membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditMembershipRevokeMembershipMutationDocument,
  "\n  mutation MembersPendingInvitationsCancelMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: {\n        membership_id: { eq: $membership_id }\n        profile_id: { is: NULL }\n        membership_revoked_at: { is: NULL }\n        membership_rejected_at: { is: NULL }\n      }\n      set: {\n        membership_revoked_at: $now\n        membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.MembersPendingInvitationsCancelMutationDocument,
  "\n  query AccountPageQuery {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      webauthn_credentialsCollection(\n        orderBy: [{ webauthn_credential_created_at: DescNullsLast }]\n      ) {\n        edges {\n          node {\n            webauthn_credential_id\n            webauthn_credential_friendly_name\n            webauthn_credential_device_type\n            webauthn_credential_backup_state\n            webauthn_credential_created_at\n            webauthn_credential_last_used_at\n          }\n        }\n      }\n    }\n  }\n":
    types.AccountPageQueryDocument,
  "\n  mutation AccountPasskeysSectionDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromwebauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.AccountPasskeysSectionDeleteMutationDocument,
  "\n  mutation AccountProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.AccountProfileFormUpdateNameMutationDocument,
  "\n  query DashboardPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n":
    types.DashboardPageQueryDocument,
  "\n  mutation OnboardingNameStepUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.OnboardingNameStepUpdateNameMutationDocument,
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryGetFragmentFragmentDoc,
  "\n  query CountriesGetQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesGetQueryDocument,
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationGetFragmentFragmentDoc,
  "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsGetQueryDocument,
  "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdGetQueryDocument,
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileGetFragmentFragmentDoc,
  "\n  query ViewerProfileGetQuery {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n":
    types.ViewerProfileGetQueryDocument,
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantGetFragmentFragmentDoc,
  "\n  query ViewerTenantsGetQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsGetQueryDocument,
  "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n":
    types.ViewerTenantBySlugGetQueryDocument,
  "\n  fragment CountryHookFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryHookFragmentFragmentDoc,
  "\n  query CountriesHookQuery {\n    addresses_level0Collection(\n      filter: { address_level0_disabled_at: { is: NULL } }\n      orderBy: [{ address_level0_name: AscNullsLast }]\n      first: 250\n    ) {\n      edges {\n        node {\n          ...CountryHookFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesHookQueryDocument,
  "\n  fragment ViewerOrganizationHookFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationHookFragmentFragmentDoc,
  "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsHookQueryDocument,
  "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdHookQueryDocument,
  "\n  fragment ViewerProfileHookFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileHookFragmentFragmentDoc,
  "\n  query ViewerProfileHookQuery {\n    profile: viewer_profile {\n      ...ViewerProfileHookFragment\n    }\n  }\n":
    types.ViewerProfileHookQueryDocument,
  "\n  fragment ViewerTenantHookFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantHookFragmentFragmentDoc,
  "\n  query ViewerTenantsHookQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsHookQueryDocument,
  "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n":
    types.ViewerTenantBySlugHookQueryDocument,
  "\n  fragment PasskeyCredentialFragment on webauthn_credentials {\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n    profile_id\n  }\n":
    types.PasskeyCredentialFragmentFragmentDoc,
  "\n  query PasskeyListByProfileQuery($profile_id: UUID!) {\n    webauthn_credentialsCollection(filter: { profile_id: { eq: $profile_id } }) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n":
    types.PasskeyListByProfileQueryDocument,
  "\n  query PasskeyByExternalIdQuery($external_id: String!) {\n    webauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n":
    types.PasskeyByExternalIdQueryDocument,
  "\n  mutation PasskeyUpdateSignCountMutation(\n    $external_id: String!\n    $sign_count: Int!\n    $last_used_at: Datetime!\n  ) {\n    updatewebauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      set: {\n        webauthn_credential_sign_count: $sign_count\n        webauthn_credential_last_used_at: $last_used_at\n      }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.PasskeyUpdateSignCountMutationDocument,
  "\n  mutation PasskeyInsertCredentialMutation($input: webauthn_credentialsInsertInput!) {\n    insertIntowebauthn_credentialsCollection(objects: [$input]) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n":
    types.PasskeyInsertCredentialMutationDocument,
  "\n  mutation PasskeyAnonChallengeInsertMutation($challenge_value: String!) {\n    insertIntowebauthn_challengesCollection(objects: [{ webauthn_challenge_value: $challenge_value }]) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n":
    types.PasskeyAnonChallengeInsertMutationDocument,
  "\n  query PasskeyChallengeByProfileQuery($profile_id: UUID!) {\n    webauthn_challengesCollection(filter: { profile_id: { eq: $profile_id } }, first: 1) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n":
    types.PasskeyChallengeByProfileQueryDocument,
  "\n  query PasskeyChallengeByIdQuery($challenge_id: UUID!) {\n    webauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n":
    types.PasskeyChallengeByIdQueryDocument,
  "\n  mutation PasskeyChallengeDeleteMutation($challenge_id: UUID!) {\n    deleteFromwebauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.PasskeyChallengeDeleteMutationDocument,
  "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n":
    types.PasskeyProfileIdByEmailQueryDocument,
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
  source: "\n  mutation MembersPendingInvitationsCancelMutation($membership_id: Int!, $now: Datetime!) {\n    updatemembershipsCollection(\n      filter: {\n        membership_id: { eq: $membership_id }\n        profile_id: { is: NULL }\n        membership_revoked_at: { is: NULL }\n        membership_rejected_at: { is: NULL }\n      }\n      set: {\n        membership_revoked_at: $now\n        membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").MembersPendingInvitationsCancelMutationDocument;
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
  source: "\n  mutation AccountPasskeysSectionDeleteMutation($webauthn_credential_id: UUID!) {\n    deleteFromwebauthn_credentialsCollection(\n      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").AccountPasskeysSectionDeleteMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AccountProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").AccountProfileFormUpdateNameMutationDocument;
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
  source: "\n  mutation OnboardingNameStepUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").OnboardingNameStepUpdateNameMutationDocument;
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
  source: "\n  query ViewerOrganizationsGetQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdGetQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n",
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
  source: "\n  query ViewerTenantsGetQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsGetQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugGetQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n",
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
  source: "\n  query ViewerOrganizationsHookQuery($tenant_id: Int) {\n    viewer_organizations(\n      filter: { tenant_id: { eq: $tenant_id } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdHookQuery($organization_id: Int!) {\n    viewer_organization_by_id(target_organization_id: $organization_id) {\n      ...ViewerOrganizationHookFragment\n    }\n  }\n",
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
  source: "\n  query ViewerTenantsHookQuery {\n    viewer_tenants(\n      orderBy: [{ tenant_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          ...ViewerTenantHookFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugHookQuery($tenant_slug: String!) {\n    viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {\n      ...ViewerTenantHookFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugHookQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment PasskeyCredentialFragment on webauthn_credentials {\n    webauthn_credential_external_id\n    webauthn_credential_type\n    webauthn_credential_transports\n    webauthn_credential_public_key\n    webauthn_credential_sign_count\n    profile_id\n  }\n",
): typeof import("./graphql").PasskeyCredentialFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PasskeyListByProfileQuery($profile_id: UUID!) {\n    webauthn_credentialsCollection(filter: { profile_id: { eq: $profile_id } }) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyListByProfileQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PasskeyByExternalIdQuery($external_id: String!) {\n    webauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          ...PasskeyCredentialFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyByExternalIdQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation PasskeyUpdateSignCountMutation(\n    $external_id: String!\n    $sign_count: Int!\n    $last_used_at: Datetime!\n  ) {\n    updatewebauthn_credentialsCollection(\n      filter: { webauthn_credential_external_id: { eq: $external_id } }\n      set: {\n        webauthn_credential_sign_count: $sign_count\n        webauthn_credential_last_used_at: $last_used_at\n      }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").PasskeyUpdateSignCountMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation PasskeyInsertCredentialMutation($input: webauthn_credentialsInsertInput!) {\n    insertIntowebauthn_credentialsCollection(objects: [$input]) {\n      records {\n        webauthn_credential_id\n        webauthn_credential_friendly_name\n        webauthn_credential_device_type\n        webauthn_credential_backup_state\n        webauthn_credential_created_at\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyInsertCredentialMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation PasskeyAnonChallengeInsertMutation($challenge_value: String!) {\n    insertIntowebauthn_challengesCollection(objects: [{ webauthn_challenge_value: $challenge_value }]) {\n      records {\n        webauthn_challenge_id\n        webauthn_challenge_value\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyAnonChallengeInsertMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PasskeyChallengeByProfileQuery($profile_id: UUID!) {\n    webauthn_challengesCollection(filter: { profile_id: { eq: $profile_id } }, first: 1) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyChallengeByProfileQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PasskeyChallengeByIdQuery($challenge_id: UUID!) {\n    webauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n      first: 1\n    ) {\n      edges {\n        node {\n          webauthn_challenge_id\n          webauthn_challenge_value\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PasskeyChallengeByIdQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation PasskeyChallengeDeleteMutation($challenge_id: UUID!) {\n    deleteFromwebauthn_challengesCollection(\n      filter: { webauthn_challenge_id: { eq: $challenge_id } }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").PasskeyChallengeDeleteMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {\n    profile_id_by_email(email_to_check: $email_to_check)\n  }\n",
): typeof import("./graphql").PasskeyProfileIdByEmailQueryDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
