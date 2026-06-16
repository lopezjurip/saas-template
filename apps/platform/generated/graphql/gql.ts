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
  "\n  mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {\n    agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {\n      agencyId\n    }\n  }\n": typeof types.AgencyCreateMutationDocument;
  "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileSectionUpdateNameMutationDocument;
  "\n  query SessionsSectionPageQuery {\n    viewerSessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n": typeof types.SessionsSectionPageQueryDocument;
  "\n  fragment SessionsSectionSessionFragment on UserSessions {\n    id\n    userAgent\n    ip\n    createdAt\n    refreshedAt\n    notAfter\n  }\n": typeof types.SessionsSectionSessionFragmentFragmentDoc;
  "\n  query HomePickerPageQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          organizationSlug\n          tenant {\n            tenantId\n            tenantSlug\n            tenantName\n          }\n        }\n      }\n    }\n  }\n": typeof types.HomePickerPageQueryDocument;
  "\n  mutation SetTenantOnboardingStepMutation($tenant_id: Int!, $step: String!, $status: String!) {\n    tenant: viewerTenantOnboardingSet(tenantId: $tenant_id, step: $step, status: $status) {\n      tenantId\n    }\n  }\n": typeof types.SetTenantOnboardingStepMutationDocument;
  "\n  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {\n    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {\n      tenantId\n      tenantOnboardedAt\n    }\n  }\n": typeof types.FinishTenantOnboardingMutationDocument;
  "\n  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {\n    organization: viewerOrganizationCreate(\n      organizationName: $organization_name\n      organizationSlug: $organization_slug\n      tenantId: $tenant_id\n    ) {\n      organizationId\n      organizationSlug\n    }\n  }\n": typeof types.CreateOrganizationFormMutationDocument;
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoOrganizationMembershipPermissionsCollection(\n      objects: [{ organizationMembershipId: $organization_membership_id, permissionId: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipGrantPermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromOrganizationMembershipPermissionsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id }, permissionId: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokePermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id } }\n      set: { organizationMembershipRevokedAt: $now }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
  "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: {\n        organizationMembershipId: { eq: $organization_membership_id }\n        profileId: { is: NULL }\n        organizationMembershipRevokedAt: { is: NULL }\n        organizationMembershipRejectedAt: { is: NULL }\n      }\n      set: {\n        organizationMembershipRevokedAt: $now\n        organizationMembershipInviteToken: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.MembersPendingInvitationsCancelMutationDocument;
  "\n  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {\n    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {\n      tenantId\n      tenantName\n    }\n  }\n": typeof types.UpdateTenantNameMutationDocument;
  "\n  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {\n    tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {\n      tenantId\n    }\n  }\n": typeof types.CreateTenantFormMutationDocument;
  "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.OnboardingProfileFormUpdateNameMutationDocument;
  "\n  query HealthQuery {\n    healthCurrentTimestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  query ScopeSelectorOrgsQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenant {\n            tenantSlug\n          }\n        }\n      }\n    }\n  }\n": typeof types.ScopeSelectorOrgsQueryDocument;
  "\n  query ScopeSelectorAgenciesQuery {\n    agencies: viewerAgencies(\n      orderBy: [{ agencyName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          agencyId\n          agencySlug\n          agencyName\n        }\n      }\n    }\n  }\n": typeof types.ScopeSelectorAgenciesQueryDocument;
  "\n  query PostHogIdentify {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileCreatedAt\n    }\n    tenants: viewerTenants {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantTier\n          tenantCreatedAt\n        }\n      }\n    }\n    organizations: viewerOrganizations {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenantId\n        }\n      }\n    }\n  }\n": typeof types.PostHogIdentifyDocument;
  "\n  fragment CountryGetFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n": typeof types.CountryGetFragmentFragmentDoc;
  "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesGetDocument;
  "\n  fragment ViewerAgencyGetFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n    agencyDisabledAt\n  }\n": typeof types.ViewerAgencyGetFragmentFragmentDoc;
  "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerAgenciesGetDocument;
  "\n  query ViewerAgencyByIdGet($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n": typeof types.ViewerAgencyByIdGetDocument;
  "\n  query ViewerAgencyBySlugGet($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n": typeof types.ViewerAgencyBySlugGetDocument;
  "\n  fragment ViewerOrganizationGetFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n": typeof types.ViewerOrganizationGetFragmentFragmentDoc;
  "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsGetDocument;
  "\n  query ViewerOrganizationByIdQuery($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdQueryDocument;
  "\n  query ViewerOrganizationBySlugQuery($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationBySlugQueryDocument;
  "\n  fragment ViewerProfileGetFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n": typeof types.ViewerProfileGetFragmentFragmentDoc;
  "\n  query ViewerProfileGet {\n    profile: viewerProfile {\n      ...ViewerProfileGetFragment\n    }\n  }\n": typeof types.ViewerProfileGetDocument;
  "\n  fragment ViewerTenantGetFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n": typeof types.ViewerTenantGetFragmentFragmentDoc;
  "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsGetDocument;
  "\n  query ViewerTenantByIdGet($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantByIdGetDocument;
  "\n  query ViewerTenantBySlugGet($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugGetDocument;
  "\n  fragment CountryHookUseFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n": typeof types.CountryHookUseFragmentFragmentDoc;
  "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n": typeof types.CountriesUseDocument;
  "\n  fragment ViewerAgencyUseFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n  }\n": typeof types.ViewerAgencyUseFragmentFragmentDoc;
  "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerAgenciesUseDocument;
  "\n  query ViewerAgencyByIdUse($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n": typeof types.ViewerAgencyByIdUseDocument;
  "\n  query ViewerAgencyBySlugUse($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n": typeof types.ViewerAgencyBySlugUseDocument;
  "\n  fragment ViewerOrganizationUseFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n": typeof types.ViewerOrganizationUseFragmentFragmentDoc;
  "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationsUseDocument;
  "\n  query ViewerOrganizationByIdUse($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n": typeof types.ViewerOrganizationByIdUseDocument;
  "\n  query ViewerOrganizationBySlugUse($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerOrganizationBySlugUseDocument;
  "\n  fragment ViewerProfileUseFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n": typeof types.ViewerProfileUseFragmentFragmentDoc;
  "\n  query ViewerProfileUse {\n    profile: viewerProfile {\n      ...ViewerProfileUseFragment\n    }\n  }\n": typeof types.ViewerProfileUseDocument;
  "\n  fragment ViewerTenantUseFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n": typeof types.ViewerTenantUseFragmentFragmentDoc;
  "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n": typeof types.ViewerTenantsUseDocument;
  "\n  query ViewerTenantByIdUse($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantUseFragment\n    }\n  }\n": typeof types.ViewerTenantByIdUseDocument;
  "\n  query ViewerTenantBySlugUse($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n": typeof types.ViewerTenantBySlugUseDocument;
  "\n  mutation UpdateProfileMcp($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n": typeof types.UpdateProfileMcpDocument;
  "\n  query ListTenantsMcp {\n    tenants: viewerTenants(orderBy: [{ tenantName: AscNullsLast }]) {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantName\n          tenantTier\n        }\n      }\n    }\n  }\n": typeof types.ListTenantsMcpDocument;
  "\n  query ListOrganizationsMcp {\n    organizations: viewerOrganizations(orderBy: [{ organizationName: AscNullsLast }]) {\n      edges {\n        node {\n          organizationId\n          tenantId\n          organizationSlug\n          organizationName\n        }\n      }\n    }\n  }\n": typeof types.ListOrganizationsMcpDocument;
  "\n  query WhoamiMcp {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileDisabledAt\n      profileCreatedAt\n      profileUpdatedAt\n    }\n  }\n": typeof types.WhoamiMcpDocument;
};
const documents: Documents = {
  "\n  mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {\n    agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {\n      agencyId\n    }\n  }\n":
    types.AgencyCreateMutationDocument,
  "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.ProfileSectionUpdateNameMutationDocument,
  "\n  query SessionsSectionPageQuery {\n    viewerSessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n":
    types.SessionsSectionPageQueryDocument,
  "\n  fragment SessionsSectionSessionFragment on UserSessions {\n    id\n    userAgent\n    ip\n    createdAt\n    refreshedAt\n    notAfter\n  }\n":
    types.SessionsSectionSessionFragmentFragmentDoc,
  "\n  query HomePickerPageQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          organizationSlug\n          tenant {\n            tenantId\n            tenantSlug\n            tenantName\n          }\n        }\n      }\n    }\n  }\n":
    types.HomePickerPageQueryDocument,
  "\n  mutation SetTenantOnboardingStepMutation($tenant_id: Int!, $step: String!, $status: String!) {\n    tenant: viewerTenantOnboardingSet(tenantId: $tenant_id, step: $step, status: $status) {\n      tenantId\n    }\n  }\n":
    types.SetTenantOnboardingStepMutationDocument,
  "\n  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {\n    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {\n      tenantId\n      tenantOnboardedAt\n    }\n  }\n":
    types.FinishTenantOnboardingMutationDocument,
  "\n  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {\n    organization: viewerOrganizationCreate(\n      organizationName: $organization_name\n      organizationSlug: $organization_slug\n      tenantId: $tenant_id\n    ) {\n      organizationId\n      organizationSlug\n    }\n  }\n":
    types.CreateOrganizationFormMutationDocument,
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoOrganizationMembershipPermissionsCollection(\n      objects: [{ organizationMembershipId: $organization_membership_id, permissionId: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipGrantPermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromOrganizationMembershipPermissionsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id }, permissionId: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokePermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id } }\n      set: { organizationMembershipRevokedAt: $now }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument,
  "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: {\n        organizationMembershipId: { eq: $organization_membership_id }\n        profileId: { is: NULL }\n        organizationMembershipRevokedAt: { is: NULL }\n        organizationMembershipRejectedAt: { is: NULL }\n      }\n      set: {\n        organizationMembershipRevokedAt: $now\n        organizationMembershipInviteToken: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.MembersPendingInvitationsCancelMutationDocument,
  "\n  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {\n    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {\n      tenantId\n      tenantName\n    }\n  }\n":
    types.UpdateTenantNameMutationDocument,
  "\n  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {\n    tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {\n      tenantId\n    }\n  }\n":
    types.CreateTenantFormMutationDocument,
  "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.OnboardingProfileFormUpdateNameMutationDocument,
  "\n  query HealthQuery {\n    healthCurrentTimestamp\n  }\n": types.HealthQueryDocument,
  "\n  query ScopeSelectorOrgsQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenant {\n            tenantSlug\n          }\n        }\n      }\n    }\n  }\n":
    types.ScopeSelectorOrgsQueryDocument,
  "\n  query ScopeSelectorAgenciesQuery {\n    agencies: viewerAgencies(\n      orderBy: [{ agencyName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          agencyId\n          agencySlug\n          agencyName\n        }\n      }\n    }\n  }\n":
    types.ScopeSelectorAgenciesQueryDocument,
  "\n  query PostHogIdentify {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileCreatedAt\n    }\n    tenants: viewerTenants {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantTier\n          tenantCreatedAt\n        }\n      }\n    }\n    organizations: viewerOrganizations {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenantId\n        }\n      }\n    }\n  }\n":
    types.PostHogIdentifyDocument,
  "\n  fragment CountryGetFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n":
    types.CountryGetFragmentFragmentDoc,
  "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesGetDocument,
  "\n  fragment ViewerAgencyGetFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n    agencyDisabledAt\n  }\n":
    types.ViewerAgencyGetFragmentFragmentDoc,
  "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerAgenciesGetDocument,
  "\n  query ViewerAgencyByIdGet($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n":
    types.ViewerAgencyByIdGetDocument,
  "\n  query ViewerAgencyBySlugGet($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n":
    types.ViewerAgencyBySlugGetDocument,
  "\n  fragment ViewerOrganizationGetFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n":
    types.ViewerOrganizationGetFragmentFragmentDoc,
  "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsGetDocument,
  "\n  query ViewerOrganizationByIdQuery($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdQueryDocument,
  "\n  query ViewerOrganizationBySlugQuery($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationBySlugQueryDocument,
  "\n  fragment ViewerProfileGetFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n":
    types.ViewerProfileGetFragmentFragmentDoc,
  "\n  query ViewerProfileGet {\n    profile: viewerProfile {\n      ...ViewerProfileGetFragment\n    }\n  }\n":
    types.ViewerProfileGetDocument,
  "\n  fragment ViewerTenantGetFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n":
    types.ViewerTenantGetFragmentFragmentDoc,
  "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsGetDocument,
  "\n  query ViewerTenantByIdGet($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantGetFragment\n    }\n  }\n":
    types.ViewerTenantByIdGetDocument,
  "\n  query ViewerTenantBySlugGet($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n":
    types.ViewerTenantBySlugGetDocument,
  "\n  fragment CountryHookUseFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n":
    types.CountryHookUseFragmentFragmentDoc,
  "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n":
    types.CountriesUseDocument,
  "\n  fragment ViewerAgencyUseFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n  }\n":
    types.ViewerAgencyUseFragmentFragmentDoc,
  "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerAgenciesUseDocument,
  "\n  query ViewerAgencyByIdUse($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n":
    types.ViewerAgencyByIdUseDocument,
  "\n  query ViewerAgencyBySlugUse($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n":
    types.ViewerAgencyBySlugUseDocument,
  "\n  fragment ViewerOrganizationUseFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n":
    types.ViewerOrganizationUseFragmentFragmentDoc,
  "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationsUseDocument,
  "\n  query ViewerOrganizationByIdUse($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n":
    types.ViewerOrganizationByIdUseDocument,
  "\n  query ViewerOrganizationBySlugUse($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerOrganizationBySlugUseDocument,
  "\n  fragment ViewerProfileUseFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n":
    types.ViewerProfileUseFragmentFragmentDoc,
  "\n  query ViewerProfileUse {\n    profile: viewerProfile {\n      ...ViewerProfileUseFragment\n    }\n  }\n":
    types.ViewerProfileUseDocument,
  "\n  fragment ViewerTenantUseFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n":
    types.ViewerTenantUseFragmentFragmentDoc,
  "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n":
    types.ViewerTenantsUseDocument,
  "\n  query ViewerTenantByIdUse($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantUseFragment\n    }\n  }\n":
    types.ViewerTenantByIdUseDocument,
  "\n  query ViewerTenantBySlugUse($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n":
    types.ViewerTenantBySlugUseDocument,
  "\n  mutation UpdateProfileMcp($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.UpdateProfileMcpDocument,
  "\n  query ListTenantsMcp {\n    tenants: viewerTenants(orderBy: [{ tenantName: AscNullsLast }]) {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantName\n          tenantTier\n        }\n      }\n    }\n  }\n":
    types.ListTenantsMcpDocument,
  "\n  query ListOrganizationsMcp {\n    organizations: viewerOrganizations(orderBy: [{ organizationName: AscNullsLast }]) {\n      edges {\n        node {\n          organizationId\n          tenantId\n          organizationSlug\n          organizationName\n        }\n      }\n    }\n  }\n":
    types.ListOrganizationsMcpDocument,
  "\n  query WhoamiMcp {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileDisabledAt\n      profileCreatedAt\n      profileUpdatedAt\n    }\n  }\n":
    types.WhoamiMcpDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {\n    agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {\n      agencyId\n    }\n  }\n",
): typeof import("./graphql").AgencyCreateMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").ProfileSectionUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query SessionsSectionPageQuery {\n    viewerSessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").SessionsSectionPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment SessionsSectionSessionFragment on UserSessions {\n    id\n    userAgent\n    ip\n    createdAt\n    refreshedAt\n    notAfter\n  }\n",
): typeof import("./graphql").SessionsSectionSessionFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HomePickerPageQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          organizationSlug\n          tenant {\n            tenantId\n            tenantSlug\n            tenantName\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").HomePickerPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SetTenantOnboardingStepMutation($tenant_id: Int!, $step: String!, $status: String!) {\n    tenant: viewerTenantOnboardingSet(tenantId: $tenant_id, step: $step, status: $status) {\n      tenantId\n    }\n  }\n",
): typeof import("./graphql").SetTenantOnboardingStepMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {\n    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {\n      tenantId\n      tenantOnboardedAt\n    }\n  }\n",
): typeof import("./graphql").FinishTenantOnboardingMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {\n    organization: viewerOrganizationCreate(\n      organizationName: $organization_name\n      organizationSlug: $organization_slug\n      tenantId: $tenant_id\n    ) {\n      organizationId\n      organizationSlug\n    }\n  }\n",
): typeof import("./graphql").CreateOrganizationFormMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    insertIntoOrganizationMembershipPermissionsCollection(\n      objects: [{ organizationMembershipId: $organization_membership_id, permissionId: $permission_id }]\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipGrantPermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {\n    deleteFromOrganizationMembershipPermissionsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id }, permissionId: { eq: $permission_id } }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokePermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: { organizationMembershipId: { eq: $organization_membership_id } }\n      set: { organizationMembershipRevokedAt: $now }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {\n    updateOrganizationMembershipsCollection(\n      filter: {\n        organizationMembershipId: { eq: $organization_membership_id }\n        profileId: { is: NULL }\n        organizationMembershipRevokedAt: { is: NULL }\n        organizationMembershipRejectedAt: { is: NULL }\n      }\n      set: {\n        organizationMembershipRevokedAt: $now\n        organizationMembershipInviteToken: null\n      }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").MembersPendingInvitationsCancelMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {\n    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {\n      tenantId\n      tenantName\n    }\n  }\n",
): typeof import("./graphql").UpdateTenantNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {\n    tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {\n      tenantId\n    }\n  }\n",
): typeof import("./graphql").CreateTenantFormMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").OnboardingProfileFormUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query HealthQuery {\n    healthCurrentTimestamp\n  }\n",
): typeof import("./graphql").HealthQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ScopeSelectorOrgsQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenant {\n            tenantSlug\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ScopeSelectorOrgsQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ScopeSelectorAgenciesQuery {\n    agencies: viewerAgencies(\n      orderBy: [{ agencyName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          agencyId\n          agencySlug\n          agencyName\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ScopeSelectorAgenciesQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query PostHogIdentify {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileCreatedAt\n    }\n    tenants: viewerTenants {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantTier\n          tenantCreatedAt\n        }\n      }\n    }\n    organizations: viewerOrganizations {\n      edges {\n        node {\n          organizationId\n          organizationName\n          tenantId\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").PostHogIdentifyDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CountryGetFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n",
): typeof import("./graphql").CountryGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerAgencyGetFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n    agencyDisabledAt\n  }\n",
): typeof import("./graphql").ViewerAgencyGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgenciesGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerAgenciesGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyByIdGet($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyByIdGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyBySlugGet($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyBySlugGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationGetFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n",
): typeof import("./graphql").ViewerOrganizationGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdQuery($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationBySlugQuery($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationBySlugQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileGetFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n",
): typeof import("./graphql").ViewerProfileGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerProfileGet {\n    profile: viewerProfile {\n      ...ViewerProfileGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantGetFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n",
): typeof import("./graphql").ViewerTenantGetFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsGet(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantGetFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantByIdGet($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantByIdGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugGet($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantGetFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugGetDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CountryHookUseFragment on AddressesLevel0 {\n    addressLevel0Id\n    addressLevel0Name\n    addressLevel0Emoji\n  }\n",
): typeof import("./graphql").CountryHookUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query CountriesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AddressesLevel0Filter\n    $orderBy: [AddressesLevel0OrderBy!]\n  ) {\n    addressesLevel0: addressesLevel0Collection(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...CountryHookUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").CountriesUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerAgencyUseFragment on Agencies {\n    agencyId\n    agencySlug\n    agencyName\n  }\n",
): typeof import("./graphql").ViewerAgencyUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgenciesUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: AgenciesFilter\n    $orderBy: [AgenciesOrderBy!]\n  ) {\n    agencies: viewerAgencies(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerAgencyUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerAgenciesUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyByIdUse($agencyId: Int!) {\n    agency: viewerAgencyById(agencyId: $agencyId) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerAgencyBySlugUse($agencySlug: String!) {\n    agency: viewerAgencyBySlug(agencySlug: $agencySlug) {\n      ...ViewerAgencyUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerAgencyBySlugUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerOrganizationUseFragment on Organizations {\n    organizationId\n    tenantId\n    organizationSlug\n    organizationName\n  }\n",
): typeof import("./graphql").ViewerOrganizationUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: OrganizationsFilter\n    $orderBy: [OrganizationsOrderBy!]\n  ) {\n    organizations: viewerOrganizations(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationsUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationByIdUse($organizationId: Int!) {\n    organization: viewerOrganizationById(organizationId: $organizationId) {\n      ...ViewerOrganizationUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerOrganizationBySlugUse($organizationSlug: String!) {\n    organizations: viewerOrganizations(\n      first: 1\n      filter: { organizationSlug: { eq: $organizationSlug } }\n    ) {\n      edges {\n        node {\n          ...ViewerOrganizationUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerOrganizationBySlugUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerProfileUseFragment on Profiles {\n    profileId\n    profileNameFull\n    profileOnboardedAt\n    profileDisabledAt\n    profileCreatedAt\n    profileUpdatedAt\n  }\n",
): typeof import("./graphql").ViewerProfileUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerProfileUse {\n    profile: viewerProfile {\n      ...ViewerProfileUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerProfileUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ViewerTenantUseFragment on Tenants {\n    tenantId\n    tenantSlug\n    tenantName\n    tenantTier\n  }\n",
): typeof import("./graphql").ViewerTenantUseFragmentFragmentDoc;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantsUse(\n    $first: Int\n    $last: Int\n    $after: Cursor\n    $before: Cursor\n    $filter: TenantsFilter\n    $orderBy: [TenantsOrderBy!]\n  ) {\n    tenants: viewerTenants(\n      first: $first\n      last: $last\n      after: $after\n      before: $before\n      filter: $filter\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          ...ViewerTenantUseFragment\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantsUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantByIdUse($tenantId: Int!) {\n    tenant: viewerTenantById(tenantId: $tenantId) {\n      ...ViewerTenantUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantByIdUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ViewerTenantBySlugUse($tenantSlug: String!) {\n    tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {\n      ...ViewerTenantUseFragment\n    }\n  }\n",
): typeof import("./graphql").ViewerTenantBySlugUseDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateProfileMcp($profile_id: UUID!, $profile_name_full: String!) {\n    updateProfilesCollection(\n      filter: { profileId: { eq: $profile_id } }\n      set: { profileNameFull: $profile_name_full }\n    ) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").UpdateProfileMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ListTenantsMcp {\n    tenants: viewerTenants(orderBy: [{ tenantName: AscNullsLast }]) {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantName\n          tenantTier\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ListTenantsMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ListOrganizationsMcp {\n    organizations: viewerOrganizations(orderBy: [{ organizationName: AscNullsLast }]) {\n      edges {\n        node {\n          organizationId\n          tenantId\n          organizationSlug\n          organizationName\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ListOrganizationsMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query WhoamiMcp {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileDisabledAt\n      profileCreatedAt\n      profileUpdatedAt\n    }\n  }\n",
): typeof import("./graphql").WhoamiMcpDocument;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}
