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
  "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileSectionUpdateNameMutationDocument;
  "\n  query SessionsSectionPageQuery {\n    viewer_sessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n": typeof types.SessionsSectionPageQueryDocument;
  "\n  fragment SessionsSectionSessionFragment on user_sessions {\n    id\n    user_agent\n    ip\n    created_at\n    refreshed_at\n    not_after\n  }\n": typeof types.SessionsSectionSessionFragmentFragmentDoc;
  "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n": typeof types.HomePickerPageQueryDocument;
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipGrantPermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokePermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
  "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.MembersPendingInvitationsCancelMutationDocument;
  "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.OnboardingProfileFormUpdateNameMutationDocument;
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  query PostHogIdentify {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      profile_onboarded_at\n      profile_created_at\n    }\n    tenants: viewer_tenants {\n      edges {\n        node {\n          tenant_id\n          tenant_slug\n          tenant_tier\n          tenant_created_at\n        }\n      }\n    }\n    organizations: viewer_organizations {\n      edges {\n        node {\n          organization_id\n          organization_name\n          tenant_id\n        }\n      }\n    }\n  }\n": typeof types.PostHogIdentifyDocument;
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryGetFragmentFragmentDoc;
  "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesGetDocument;
  "\n  fragment ViewerAgencyGetFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n": typeof types.ViewerAgencyGetFragmentFragmentDoc;
  "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerAgenciesGetDocument;
  "\n  query ViewerAgencyByIdGet($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n": typeof types.ViewerAgencyByIdGetDocument;
  "\n  query ViewerAgencyBySlugGet($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n": typeof types.ViewerAgencyBySlugGetDocument;
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationGetFragmentFragmentDoc;
  "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsGetDocument;
  "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdQueryDocument;
  "\n  query ViewerOrganizationBySlugQuery($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationBySlugQueryDocument;
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileGetFragmentFragmentDoc;
  "\n  query ViewerProfileGet {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": typeof types.ViewerProfileGetDocument;
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantGetFragmentFragmentDoc;
  "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsGetDocument;
  "\n  query ViewerTenantByIdGet($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantByIdGetDocument;
  "\n  query ViewerTenantBySlugGet($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugGetDocument;
  "\n  fragment CountryHookUseFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n": typeof types.CountryHookUseFragmentFragmentDoc;
  "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesUseDocument;
  "\n  fragment ViewerAgencyUseFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n": typeof types.ViewerAgencyUseFragmentFragmentDoc;
  "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerAgenciesUseDocument;
  "\n  query ViewerAgencyByIdUse($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n": typeof types.ViewerAgencyByIdUseDocument;
  "\n  query ViewerAgencyBySlugUse($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n": typeof types.ViewerAgencyBySlugUseDocument;
  "\n  fragment ViewerOrganizationUseFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n": typeof types.ViewerOrganizationUseFragmentFragmentDoc;
  "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsUseDocument;
  "\n  query ViewerOrganizationByIdUse($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdUseDocument;
  "\n  query ViewerOrganizationBySlugUse($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationBySlugUseDocument;
  "\n  fragment ViewerProfileUseFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n": typeof types.ViewerProfileUseFragmentFragmentDoc;
  "\n  query ViewerProfileUse {\n    profile: viewer_profile {\n      ...ViewerProfileUseFragment\n    }\n  }\n": typeof types.ViewerProfileUseDocument;
  "\n  fragment ViewerTenantUseFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n": typeof types.ViewerTenantUseFragmentFragmentDoc;
  "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsUseDocument;
  "\n  query ViewerTenantByIdUse($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantUseFragment\n    }\n  }\n": typeof types.ViewerTenantByIdUseDocument;
  "\n  query ViewerTenantBySlugUse($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugUseDocument;
};
const documents: Documents = {
  "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.ProfileSectionUpdateNameMutationDocument,
  "\n  query SessionsSectionPageQuery {\n    viewer_sessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n":
    types.SessionsSectionPageQueryDocument,
  "\n  fragment SessionsSectionSessionFragment on user_sessions {\n    id\n    user_agent\n    ip\n    created_at\n    refreshed_at\n    not_after\n  }\n":
    types.SessionsSectionSessionFragmentFragmentDoc,
  "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n":
    types.HomePickerPageQueryDocument,
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipGrantPermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokePermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument,
  "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.MembersPendingInvitationsCancelMutationDocument,
  "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.OnboardingProfileFormUpdateNameMutationDocument,
  "\n  query HealthQuery {\n    health_current_timestamp\n  }\n": types.HealthQueryDocument,
  "\n  query PostHogIdentify {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      profile_onboarded_at\n      profile_created_at\n    }\n    tenants: viewer_tenants {\n      edges {\n        node {\n          tenant_id\n          tenant_slug\n          tenant_tier\n          tenant_created_at\n        }\n      }\n    }\n    organizations: viewer_organizations {\n      edges {\n        node {\n          organization_id\n          organization_name\n          tenant_id\n        }\n      }\n    }\n  }\n":
    types.PostHogIdentifyDocument,
  "\n  fragment CountryGetFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryGetFragmentFragmentDoc,
  "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesGetDocument,
  "\n  fragment ViewerAgencyGetFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n":
    types.ViewerAgencyGetFragmentFragmentDoc,
  "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerAgenciesGetDocument,
  "\n  query ViewerAgencyByIdGet($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n":
    types.ViewerAgencyByIdGetDocument,
  "\n  query ViewerAgencyBySlugGet($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n":
    types.ViewerAgencyBySlugGetDocument,
  "\n  fragment ViewerOrganizationGetFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationGetFragmentFragmentDoc,
  "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsGetDocument,
  "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdQueryDocument,
  "\n  query ViewerOrganizationBySlugQuery($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationBySlugQueryDocument,
  "\n  fragment ViewerProfileGetFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileGetFragmentFragmentDoc,
  "\n  query ViewerProfileGet {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n":
    types.ViewerProfileGetDocument,
  "\n  fragment ViewerTenantGetFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantGetFragmentFragmentDoc,
  "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsGetDocument,
  "\n  query ViewerTenantByIdGet($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantGetFragment\n    }\n  }\n":
    types.ViewerTenantByIdGetDocument,
  "\n  query ViewerTenantBySlugGet($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n":
    types.ViewerTenantBySlugGetDocument,
  "\n  fragment CountryHookUseFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n":
    types.CountryHookUseFragmentFragmentDoc,
  "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesUseDocument,
  "\n  fragment ViewerAgencyUseFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n":
    types.ViewerAgencyUseFragmentFragmentDoc,
  "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerAgenciesUseDocument,
  "\n  query ViewerAgencyByIdUse($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n":
    types.ViewerAgencyByIdUseDocument,
  "\n  query ViewerAgencyBySlugUse($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n":
    types.ViewerAgencyBySlugUseDocument,
  "\n  fragment ViewerOrganizationUseFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n":
    types.ViewerOrganizationUseFragmentFragmentDoc,
  "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsUseDocument,
  "\n  query ViewerOrganizationByIdUse($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdUseDocument,
  "\n  query ViewerOrganizationBySlugUse($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationBySlugUseDocument,
  "\n  fragment ViewerProfileUseFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n":
    types.ViewerProfileUseFragmentFragmentDoc,
  "\n  query ViewerProfileUse {\n    profile: viewer_profile {\n      ...ViewerProfileUseFragment\n    }\n  }\n":
    types.ViewerProfileUseDocument,
  "\n  fragment ViewerTenantUseFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n":
    types.ViewerTenantUseFragmentFragmentDoc,
  "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsUseDocument,
  "\n  query ViewerTenantByIdUse($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantUseFragment\n    }\n  }\n":
    types.ViewerTenantByIdUseDocument,
  "\n  query ViewerTenantBySlugUse($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n":
    types.ViewerTenantBySlugUseDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").ProfileSectionUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query SessionsSectionPageQuery {\n    viewer_sessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").SessionsSectionPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SessionsSectionSessionFragment on user_sessions {\n    id\n    user_agent\n    ip\n    created_at\n    refreshed_at\n    not_after\n  }\n",
): typeof import("./graphql").SessionsSectionSessionFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HomePickerPageQuery {\n    viewer_organizations(\n      filter: { organization_disabled_at: { is: NULL } }\n      orderBy: [{ organization_name: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organization_id\n          organization_name\n          organization_slug\n          tenants {\n            tenant_id\n            tenant_slug\n            tenant_name\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").HomePickerPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoorganization_membership_permissionsCollection(\n      objects: [{ organization_membership_id: $organization_membership_id, permission_id: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipGrantPermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromorganization_membership_permissionsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id }, permission_id: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokePermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: { organization_membership_id: { eq: $organization_membership_id } }\n      set: { organization_membership_revoked_at: $now }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateorganization_membershipsCollection(\n      filter: {\n        organization_membership_id: { eq: $organization_membership_id }\n        profile_id: { is: NULL }\n        organization_membership_revoked_at: { is: NULL }\n        organization_membership_rejected_at: { is: NULL }\n      }\n      set: {\n        organization_membership_revoked_at: $now\n        organization_membership_invite_token: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").MembersPendingInvitationsCancelMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateprofilesCollection(\n      filter: { profile_id: { eq: $profile_id } }\n      set: { profile_name_full: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").OnboardingProfileFormUpdateNameMutationDocument;
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
  source: "\n  query PostHogIdentify {\n    profile: viewer_profile {\n      profile_id\n      profile_name_full\n      profile_onboarded_at\n      profile_created_at\n    }\n    tenants: viewer_tenants {\n      edges {\n        node {\n          tenant_id\n          tenant_slug\n          tenant_tier\n          tenant_created_at\n        }\n      }\n    }\n    organizations: viewer_organizations {\n      edges {\n        node {\n          organization_id\n          organization_name\n          tenant_id\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PostHogIdentifyDocument;
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
  source: "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerAgencyGetFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n",
): typeof import("./graphql").ViewerAgencyGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerAgenciesGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyByIdGet($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyByIdGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyBySlugGet($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyBySlugGetDocument;
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
  source: "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdQuery($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationBySlugQuery($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationBySlugQueryDocument;
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
  source: "\n  query ViewerProfileGet {\n    profile: viewer_profile {\n      ...ViewerProfileGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileGetDocument;
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
  source: "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantByIdGet($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantByIdGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugGet($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CountryHookUseFragment on addresses_level0 {\n    address_level0_id\n    address_level0_name\n    address_level0_emoji\n  }\n",
): typeof import("./graphql").CountryHookUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: addresses_level0Filter\n    $orderBy: [addresses_level0OrderBy!]\n  ) {\n    addresses_level0: addresses_level0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerAgencyUseFragment on agencies {\n    agency_id\n    agency_slug\n    agency_name\n  }\n",
): typeof import("./graphql").ViewerAgencyUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: agenciesFilter\n    $orderBy: [agenciesOrderBy!]\n  ) {\n    agencies: viewer_agencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerAgenciesUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyByIdUse($agency_id: UUID!) {\n    agency: viewer_agency_by_id(agency_id: $agency_id) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyBySlugUse($agency_slug: String!) {\n    agency: viewer_agency_by_slug(agency_slug: $agency_slug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyBySlugUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationUseFragment on organizations {\n    organization_id\n    tenant_id\n    organization_slug\n    organization_name\n  }\n",
): typeof import("./graphql").ViewerOrganizationUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: organizationsFilter\n    $orderBy: [organizationsOrderBy!]\n  ) {\n    organizations: viewer_organizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdUse($organization_id: Int!) {\n    organization: viewer_organization_by_id(organization_id: $organization_id) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationBySlugUse($organization_slug: String!) {\n    organizations: viewer_organizations(\n      first: 1\n      filter: { organization_slug: { eq: $organization_slug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationBySlugUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileUseFragment on profiles {\n    profile_id\n    profile_name_full\n    profile_onboarded_at\n    profile_disabled_at\n    profile_created_at\n    profile_updated_at\n  }\n",
): typeof import("./graphql").ViewerProfileUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerProfileUse {\n    profile: viewer_profile {\n      ...ViewerProfileUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantUseFragment on tenants {\n    tenant_id\n    tenant_slug\n    tenant_name\n    tenant_tier\n  }\n",
): typeof import("./graphql").ViewerTenantUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: tenantsFilter\n    $orderBy: [tenantsOrderBy!]\n  ) {\n    tenants: viewer_tenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantByIdUse($tenant_id: Int!) {\n    tenant: viewer_tenant_by_id(tenant_id: $tenant_id) {\n      ...ViewerTenantUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugUse($tenant_slug: String!) {\n    tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugUseDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
