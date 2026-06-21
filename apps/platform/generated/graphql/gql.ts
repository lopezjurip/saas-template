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
  "\n  query AgencyInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n": typeof types.AgencyInboxConversationPageQueryDocument;
  "\n  mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {\n    agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {\n      agencyId\n    }\n  }\n": typeof types.AgencyCreateMutationDocument;
  "\n  query DangerPageQuery {\n    viewerOrganizations(filter: { organizationDisabledAt: { is: NULL } }) {\n      edges {\n        node {\n          organizationId\n        }\n      }\n    }\n  }\n": typeof types.DangerPageQueryDocument;
  "\n  query ProfileContactsManageQuery(\n    $orderBy: [ProfileContactsOrderBy!] = [{ profileContactCreatedAt: AscNullsLast }]\n  ) {\n    profileContactsCollection(orderBy: $orderBy) {\n      edges {\n        node {\n          profileContactId\n          messageChannel\n          contactValue\n          contactVerifiedAt\n        }\n      }\n    }\n  }\n": typeof types.ProfileContactsManageQueryDocument;
  "\n  mutation ProfileContactsManageInsertMutation($objects: [ProfileContactsInsertInput!]!) {\n    insertIntoProfileContactsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileContactsManageInsertMutationDocument;
  "\n  mutation ProfileContactsManageDeleteMutation($filter: ProfileContactsFilter!, $atMost: Int! = 1) {\n    deleteFromProfileContactsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileContactsManageDeleteMutationDocument;
  '\n  query AccountProfilePageQuery {\n    profile: viewerProfile {\n      profileNameFull\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n': typeof types.AccountProfilePageQueryDocument;
  "\n  mutation ProfileSectionUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.ProfileSectionUpdateNameMutationDocument;
  "\n  query SessionsSectionPageQuery {\n    viewerSessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n": typeof types.SessionsSectionPageQueryDocument;
  "\n  fragment SessionsSectionSessionFragment on UserSessions {\n    id\n    userAgent\n    ip\n    createdAt\n    refreshedAt\n    notAfter\n  }\n": typeof types.SessionsSectionSessionFragmentFragmentDoc;
  "\n  query HomeInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n": typeof types.HomeInboxConversationPageQueryDocument;
  "\n  query HomePickerPageQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          organizationSlug\n          tenant {\n            tenantId\n            tenantSlug\n            tenantName\n          }\n        }\n      }\n    }\n  }\n": typeof types.HomePickerPageQueryDocument;
  "\n  query OrgInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n": typeof types.OrgInboxConversationPageQueryDocument;
  "\n  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {\n    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {\n      tenantId\n      tenantOnboardedAt\n    }\n  }\n": typeof types.FinishTenantOnboardingMutationDocument;
  '\n  query TenantOnboardingStateGet($tenant_id: Int!) {\n    tenant: viewerTenantById(tenantId: $tenant_id) {\n      tenantOnboardedAt\n      logo: storage_tenants(filter: { folder: { eq: "avatar" } }, first: 1) {\n        edges {\n          node {\n            storageTenantId\n          }\n        }\n      }\n      organizations: organizationsCollection {\n        edges {\n          node {\n            memberships: organizationMembershipsCollection {\n              totalCount\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.TenantOnboardingStateGetDocument;
  "\n  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {\n    organization: viewerOrganizationCreate(\n      organizationName: $organization_name\n      organizationSlug: $organization_slug\n      tenantId: $tenant_id\n    ) {\n      organizationId\n      organizationSlug\n    }\n  }\n": typeof types.CreateOrganizationFormMutationDocument;
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipGrantPermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokePermissionMutationDocument;
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
  "\n  mutation EditOrganizationMembershipSetPermissionsMutation($organizationMembershipId: Int!, $permissionIds: [String]!) {\n    viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organizationMembershipId\n      permissionIds: $permissionIds\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n": typeof types.EditOrganizationMembershipSetPermissionsMutationDocument;
  "\n  query OrganizationMembershipEditPageQuery(\n    $membershipFilter: OrganizationMembershipsFilter\n    $presetsFilter: PermissionPresetsFilter\n    $permissionsOrderBy: [PermissionsOrderBy!] = [{ permissionId: AscNullsLast }]\n    $presetsOrderBy: [PermissionPresetsOrderBy!] = [{ permissionPresetId: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: 1, filter: $membershipFilter) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipAcceptedAt\n          organizationMembershipRevokedAt\n          organizationMembershipRejectedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n    permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {\n      edges { node { permissionId permissionDescription } }\n    }\n    presets: permissionPresetsCollection(first: $first, filter: $presetsFilter, orderBy: $presetsOrderBy) {\n      edges { node { permissionPresetId permissionPresetName permissionPresetSlugs organizationId } }\n    }\n  }\n": typeof types.OrganizationMembershipEditPageQueryDocument;
  "\n  query MembersAdminPageQuery(\n    $filter: OrganizationMembershipsFilter\n    $orderBy: [OrganizationMembershipsOrderBy!] = [{ organizationMembershipCreatedAt: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipInviteExpiresAt\n          organizationMembershipAcceptedAt\n          organizationMembershipCreatedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n  }\n": typeof types.MembersAdminPageQueryDocument;
  "\n  mutation MembersPendingInvitationsCancelMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.MembersPendingInvitationsCancelMutationDocument;
  "\n  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {\n    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {\n      tenantId\n      tenantName\n    }\n  }\n": typeof types.UpdateTenantNameMutationDocument;
  "\n  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {\n    tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {\n      tenantId\n    }\n  }\n": typeof types.CreateTenantFormMutationDocument;
  "\n  mutation OnboardingProfileFormUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.OnboardingProfileFormUpdateNameMutationDocument;
  '\n  query ViewerOnboardingStateGet {\n    profile: viewerProfile {\n      profileNameFull\n      profileOnboardedAt\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n': typeof types.ViewerOnboardingStateGetDocument;
  "\n  query HealthQuery {\n    healthCurrentTimestamp\n  }\n": typeof types.HealthQueryDocument;
  "\n  fragment ConversationThreadFragment on Conversations {\n    conversationId\n    conversationSubject\n    conversationStatus\n    organizationId\n    agencyId\n    messages: conversationMessagesCollection(first: 250, orderBy: [{ messageCreatedAt: AscNullsLast }]) {\n      edges {\n        node {\n          conversationMessageId\n          messageBody\n          messageDirection\n          messageAuthor\n          messageChannel\n          messagePriority\n          messageCreatedAt\n          messageReadAt\n        }\n      }\n    }\n  }\n": typeof types.ConversationThreadFragmentFragmentDoc;
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
  "\n  mutation GrantAgencyOrgAccessMcp($objects: [AgenciesOrganizationsGrantsInsertInput!]!) {\n    insertIntoAgenciesOrganizationsGrantsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n": typeof types.GrantAgencyOrgAccessMcpDocument;
  "\n  mutation RevokeAgencyOrgAccessMcp($filter: AgenciesOrganizationsGrantsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgenciesOrganizationsGrantsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.RevokeAgencyOrgAccessMcpDocument;
  "\n  mutation InviteAffiliateMcp($agency_id: Int!, $email: String!) {\n    membership: viewerAgencyMembershipInviteByEmail(agencyId: $agency_id, email: $email) {\n      agencyMembershipId\n    }\n  }\n": typeof types.InviteAffiliateMcpDocument;
  "\n  mutation UpdateAffiliateMcp($agency_membership_id: Int!, $operation: String!) {\n    membership: viewerAgencyMembershipUpdate(agencyMembershipId: $agency_membership_id, operation: $operation) {\n      agencyMembershipId\n    }\n  }\n": typeof types.UpdateAffiliateMcpDocument;
  "\n  mutation GrantAgencyMemberPermissionMcp($objects: [AgencyMembershipPermissionsInsertInput!]!) {\n    insertIntoAgencyMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n": typeof types.GrantAgencyMemberPermissionMcpDocument;
  "\n  mutation RevokeAgencyMemberPermissionMcp($filter: AgencyMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgencyMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.RevokeAgencyMemberPermissionMcpDocument;
  "\n  mutation GrantMemberPermissionMcp($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n": typeof types.GrantMemberPermissionMcpDocument;
  "\n  mutation RevokeMemberPermissionMcp($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.RevokeMemberPermissionMcpDocument;
  "\n  mutation SetMemberPermissionsMcp($organization_membership_id: Int!, $permission_ids: [String]!) {\n    result: viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organization_membership_id\n      permissionIds: $permission_ids\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n": typeof types.SetMemberPermissionsMcpDocument;
  "\n  mutation UpdateMemberStatusMcp($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.UpdateMemberStatusMcpDocument;
  "\n  mutation CreatePresetMcp($objects: [PermissionPresetsInsertInput!]!) {\n    insertIntoPermissionPresetsCollection(objects: $objects) {\n      records { permissionPresetId }\n    }\n  }\n": typeof types.CreatePresetMcpDocument;
  "\n  mutation UpdatePresetMcp($filter: PermissionPresetsFilter!, $set: PermissionPresetsUpdateInput!, $atMost: Int! = 1000) {\n    updatePermissionPresetsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.UpdatePresetMcpDocument;
  "\n  mutation DeletePresetMcp($filter: PermissionPresetsFilter!, $atMost: Int! = 1000) {\n    deleteFromPermissionPresetsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.DeletePresetMcpDocument;
  "\n  mutation UpdateProfileMcp($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.UpdateProfileMcpDocument;
  "\n  mutation UpdateTenantMcp($filter: TenantsFilter!, $set: TenantsUpdateInput!, $atMost: Int! = 1000) {\n    updateTenantsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n      records {\n        tenantName\n        tenantOnboardedAt\n      }\n    }\n  }\n": typeof types.UpdateTenantMcpDocument;
  "\n  mutation UpdateOrganizationMcp($filter: OrganizationsFilter!, $set: OrganizationsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n": typeof types.UpdateOrganizationMcpDocument;
  "\n  query ListTenantsMcp {\n    tenants: viewerTenants(orderBy: [{ tenantName: AscNullsLast }]) {\n      edges {\n        node {\n          tenantId\n          tenantSlug\n          tenantName\n          tenantTier\n        }\n      }\n    }\n  }\n": typeof types.ListTenantsMcpDocument;
  "\n  query ListOrganizationsMcp {\n    organizations: viewerOrganizations(orderBy: [{ organizationName: AscNullsLast }]) {\n      edges {\n        node {\n          organizationId\n          tenantId\n          organizationSlug\n          organizationName\n        }\n      }\n    }\n  }\n": typeof types.ListOrganizationsMcpDocument;
  "\n  query WhoamiMcp {\n    profile: viewerProfile {\n      profileId\n      profileNameFull\n      profileOnboardedAt\n      profileDisabledAt\n      profileCreatedAt\n      profileUpdatedAt\n    }\n  }\n": typeof types.WhoamiMcpDocument;
};
const documents: Documents = {
  "\n  query AgencyInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n":
    types.AgencyInboxConversationPageQueryDocument,
  "\n  mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {\n    agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {\n      agencyId\n    }\n  }\n":
    types.AgencyCreateMutationDocument,
  "\n  query DangerPageQuery {\n    viewerOrganizations(filter: { organizationDisabledAt: { is: NULL } }) {\n      edges {\n        node {\n          organizationId\n        }\n      }\n    }\n  }\n":
    types.DangerPageQueryDocument,
  "\n  query ProfileContactsManageQuery(\n    $orderBy: [ProfileContactsOrderBy!] = [{ profileContactCreatedAt: AscNullsLast }]\n  ) {\n    profileContactsCollection(orderBy: $orderBy) {\n      edges {\n        node {\n          profileContactId\n          messageChannel\n          contactValue\n          contactVerifiedAt\n        }\n      }\n    }\n  }\n":
    types.ProfileContactsManageQueryDocument,
  "\n  mutation ProfileContactsManageInsertMutation($objects: [ProfileContactsInsertInput!]!) {\n    insertIntoProfileContactsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n":
    types.ProfileContactsManageInsertMutationDocument,
  "\n  mutation ProfileContactsManageDeleteMutation($filter: ProfileContactsFilter!, $atMost: Int! = 1) {\n    deleteFromProfileContactsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.ProfileContactsManageDeleteMutationDocument,
  '\n  query AccountProfilePageQuery {\n    profile: viewerProfile {\n      profileNameFull\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n':
    types.AccountProfilePageQueryDocument,
  "\n  mutation ProfileSectionUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.ProfileSectionUpdateNameMutationDocument,
  "\n  query SessionsSectionPageQuery {\n    viewerSessions {\n      edges {\n        node {\n          ...SessionsSectionSessionFragment\n        }\n      }\n    }\n  }\n":
    types.SessionsSectionPageQueryDocument,
  "\n  fragment SessionsSectionSessionFragment on UserSessions {\n    id\n    userAgent\n    ip\n    createdAt\n    refreshedAt\n    notAfter\n  }\n":
    types.SessionsSectionSessionFragmentFragmentDoc,
  "\n  query HomeInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n":
    types.HomeInboxConversationPageQueryDocument,
  "\n  query HomePickerPageQuery {\n    viewerOrganizations(\n      filter: { organizationDisabledAt: { is: NULL } }\n      orderBy: [{ organizationName: AscNullsLast }]\n    ) {\n      edges {\n        node {\n          organizationId\n          organizationName\n          organizationSlug\n          tenant {\n            tenantId\n            tenantSlug\n            tenantName\n          }\n        }\n      }\n    }\n  }\n":
    types.HomePickerPageQueryDocument,
  "\n  query OrgInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n":
    types.OrgInboxConversationPageQueryDocument,
  "\n  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {\n    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {\n      tenantId\n      tenantOnboardedAt\n    }\n  }\n":
    types.FinishTenantOnboardingMutationDocument,
  '\n  query TenantOnboardingStateGet($tenant_id: Int!) {\n    tenant: viewerTenantById(tenantId: $tenant_id) {\n      tenantOnboardedAt\n      logo: storage_tenants(filter: { folder: { eq: "avatar" } }, first: 1) {\n        edges {\n          node {\n            storageTenantId\n          }\n        }\n      }\n      organizations: organizationsCollection {\n        edges {\n          node {\n            memberships: organizationMembershipsCollection {\n              totalCount\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.TenantOnboardingStateGetDocument,
  "\n  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {\n    organization: viewerOrganizationCreate(\n      organizationName: $organization_name\n      organizationSlug: $organization_slug\n      tenantId: $tenant_id\n    ) {\n      organizationId\n      organizationSlug\n    }\n  }\n":
    types.CreateOrganizationFormMutationDocument,
  "\n  mutation EditOrganizationMembershipGrantPermissionMutation($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipGrantPermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokePermissionMutation($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokePermissionMutationDocument,
  "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument,
  "\n  mutation EditOrganizationMembershipSetPermissionsMutation($organizationMembershipId: Int!, $permissionIds: [String]!) {\n    viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organizationMembershipId\n      permissionIds: $permissionIds\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n":
    types.EditOrganizationMembershipSetPermissionsMutationDocument,
  "\n  query OrganizationMembershipEditPageQuery(\n    $membershipFilter: OrganizationMembershipsFilter\n    $presetsFilter: PermissionPresetsFilter\n    $permissionsOrderBy: [PermissionsOrderBy!] = [{ permissionId: AscNullsLast }]\n    $presetsOrderBy: [PermissionPresetsOrderBy!] = [{ permissionPresetId: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: 1, filter: $membershipFilter) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipAcceptedAt\n          organizationMembershipRevokedAt\n          organizationMembershipRejectedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n    permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {\n      edges { node { permissionId permissionDescription } }\n    }\n    presets: permissionPresetsCollection(first: $first, filter: $presetsFilter, orderBy: $presetsOrderBy) {\n      edges { node { permissionPresetId permissionPresetName permissionPresetSlugs organizationId } }\n    }\n  }\n":
    types.OrganizationMembershipEditPageQueryDocument,
  "\n  query MembersAdminPageQuery(\n    $filter: OrganizationMembershipsFilter\n    $orderBy: [OrganizationMembershipsOrderBy!] = [{ organizationMembershipCreatedAt: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipInviteExpiresAt\n          organizationMembershipAcceptedAt\n          organizationMembershipCreatedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n  }\n":
    types.MembersAdminPageQueryDocument,
  "\n  mutation MembersPendingInvitationsCancelMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.MembersPendingInvitationsCancelMutationDocument,
  "\n  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {\n    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {\n      tenantId\n      tenantName\n    }\n  }\n":
    types.UpdateTenantNameMutationDocument,
  "\n  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {\n    tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {\n      tenantId\n    }\n  }\n":
    types.CreateTenantFormMutationDocument,
  "\n  mutation OnboardingProfileFormUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.OnboardingProfileFormUpdateNameMutationDocument,
  '\n  query ViewerOnboardingStateGet {\n    profile: viewerProfile {\n      profileNameFull\n      profileOnboardedAt\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n':
    types.ViewerOnboardingStateGetDocument,
  "\n  query HealthQuery {\n    healthCurrentTimestamp\n  }\n": types.HealthQueryDocument,
  "\n  fragment ConversationThreadFragment on Conversations {\n    conversationId\n    conversationSubject\n    conversationStatus\n    organizationId\n    agencyId\n    messages: conversationMessagesCollection(first: 250, orderBy: [{ messageCreatedAt: AscNullsLast }]) {\n      edges {\n        node {\n          conversationMessageId\n          messageBody\n          messageDirection\n          messageAuthor\n          messageChannel\n          messagePriority\n          messageCreatedAt\n          messageReadAt\n        }\n      }\n    }\n  }\n":
    types.ConversationThreadFragmentFragmentDoc,
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
  "\n  mutation GrantAgencyOrgAccessMcp($objects: [AgenciesOrganizationsGrantsInsertInput!]!) {\n    insertIntoAgenciesOrganizationsGrantsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n":
    types.GrantAgencyOrgAccessMcpDocument,
  "\n  mutation RevokeAgencyOrgAccessMcp($filter: AgenciesOrganizationsGrantsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgenciesOrganizationsGrantsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.RevokeAgencyOrgAccessMcpDocument,
  "\n  mutation InviteAffiliateMcp($agency_id: Int!, $email: String!) {\n    membership: viewerAgencyMembershipInviteByEmail(agencyId: $agency_id, email: $email) {\n      agencyMembershipId\n    }\n  }\n":
    types.InviteAffiliateMcpDocument,
  "\n  mutation UpdateAffiliateMcp($agency_membership_id: Int!, $operation: String!) {\n    membership: viewerAgencyMembershipUpdate(agencyMembershipId: $agency_membership_id, operation: $operation) {\n      agencyMembershipId\n    }\n  }\n":
    types.UpdateAffiliateMcpDocument,
  "\n  mutation GrantAgencyMemberPermissionMcp($objects: [AgencyMembershipPermissionsInsertInput!]!) {\n    insertIntoAgencyMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n":
    types.GrantAgencyMemberPermissionMcpDocument,
  "\n  mutation RevokeAgencyMemberPermissionMcp($filter: AgencyMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgencyMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.RevokeAgencyMemberPermissionMcpDocument,
  "\n  mutation GrantMemberPermissionMcp($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n":
    types.GrantMemberPermissionMcpDocument,
  "\n  mutation RevokeMemberPermissionMcp($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.RevokeMemberPermissionMcpDocument,
  "\n  mutation SetMemberPermissionsMcp($organization_membership_id: Int!, $permission_ids: [String]!) {\n    result: viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organization_membership_id\n      permissionIds: $permission_ids\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n":
    types.SetMemberPermissionsMcpDocument,
  "\n  mutation UpdateMemberStatusMcp($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.UpdateMemberStatusMcpDocument,
  "\n  mutation CreatePresetMcp($objects: [PermissionPresetsInsertInput!]!) {\n    insertIntoPermissionPresetsCollection(objects: $objects) {\n      records { permissionPresetId }\n    }\n  }\n":
    types.CreatePresetMcpDocument,
  "\n  mutation UpdatePresetMcp($filter: PermissionPresetsFilter!, $set: PermissionPresetsUpdateInput!, $atMost: Int! = 1000) {\n    updatePermissionPresetsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.UpdatePresetMcpDocument,
  "\n  mutation DeletePresetMcp($filter: PermissionPresetsFilter!, $atMost: Int! = 1000) {\n    deleteFromPermissionPresetsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.DeletePresetMcpDocument,
  "\n  mutation UpdateProfileMcp($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.UpdateProfileMcpDocument,
  "\n  mutation UpdateTenantMcp($filter: TenantsFilter!, $set: TenantsUpdateInput!, $atMost: Int! = 1000) {\n    updateTenantsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n      records {\n        tenantName\n        tenantOnboardedAt\n      }\n    }\n  }\n":
    types.UpdateTenantMcpDocument,
  "\n  mutation UpdateOrganizationMcp($filter: OrganizationsFilter!, $set: OrganizationsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n":
    types.UpdateOrganizationMcpDocument,
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
  source: "\n  query AgencyInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n",
): typeof import("./graphql").AgencyInboxConversationPageQueryDocument;
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
  source: "\n  query DangerPageQuery {\n    viewerOrganizations(filter: { organizationDisabledAt: { is: NULL } }) {\n      edges {\n        node {\n          organizationId\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").DangerPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ProfileContactsManageQuery(\n    $orderBy: [ProfileContactsOrderBy!] = [{ profileContactCreatedAt: AscNullsLast }]\n  ) {\n    profileContactsCollection(orderBy: $orderBy) {\n      edges {\n        node {\n          profileContactId\n          messageChannel\n          contactValue\n          contactVerifiedAt\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ProfileContactsManageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ProfileContactsManageInsertMutation($objects: [ProfileContactsInsertInput!]!) {\n    insertIntoProfileContactsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").ProfileContactsManageInsertMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ProfileContactsManageDeleteMutation($filter: ProfileContactsFilter!, $atMost: Int! = 1) {\n    deleteFromProfileContactsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").ProfileContactsManageDeleteMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: '\n  query AccountProfilePageQuery {\n    profile: viewerProfile {\n      profileNameFull\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n',
): typeof import("./graphql").AccountProfilePageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ProfileSectionUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
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
  source: "\n  query HomeInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n",
): typeof import("./graphql").HomeInboxConversationPageQueryDocument;
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
  source: "\n  query OrgInboxConversationPageQuery($conversationId: UUID!) {\n    conversation: viewerConversationById(conversationId: $conversationId) {\n      ...ConversationThreadFragment\n    }\n  }\n",
): typeof import("./graphql").OrgInboxConversationPageQueryDocument;
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
  source: '\n  query TenantOnboardingStateGet($tenant_id: Int!) {\n    tenant: viewerTenantById(tenantId: $tenant_id) {\n      tenantOnboardedAt\n      logo: storage_tenants(filter: { folder: { eq: "avatar" } }, first: 1) {\n        edges {\n          node {\n            storageTenantId\n          }\n        }\n      }\n      organizations: organizationsCollection {\n        edges {\n          node {\n            memberships: organizationMembershipsCollection {\n              totalCount\n            }\n          }\n        }\n      }\n    }\n  }\n',
): typeof import("./graphql").TenantOnboardingStateGetDocument;
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
  source: "\n  mutation EditOrganizationMembershipGrantPermissionMutation($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipGrantPermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokePermissionMutation($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokePermissionMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation EditOrganizationMembershipSetPermissionsMutation($organizationMembershipId: Int!, $permissionIds: [String]!) {\n    viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organizationMembershipId\n      permissionIds: $permissionIds\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n",
): typeof import("./graphql").EditOrganizationMembershipSetPermissionsMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query OrganizationMembershipEditPageQuery(\n    $membershipFilter: OrganizationMembershipsFilter\n    $presetsFilter: PermissionPresetsFilter\n    $permissionsOrderBy: [PermissionsOrderBy!] = [{ permissionId: AscNullsLast }]\n    $presetsOrderBy: [PermissionPresetsOrderBy!] = [{ permissionPresetId: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: 1, filter: $membershipFilter) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipAcceptedAt\n          organizationMembershipRevokedAt\n          organizationMembershipRejectedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n    permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {\n      edges { node { permissionId permissionDescription } }\n    }\n    presets: permissionPresetsCollection(first: $first, filter: $presetsFilter, orderBy: $presetsOrderBy) {\n      edges { node { permissionPresetId permissionPresetName permissionPresetSlugs organizationId } }\n    }\n  }\n",
): typeof import("./graphql").OrganizationMembershipEditPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query MembersAdminPageQuery(\n    $filter: OrganizationMembershipsFilter\n    $orderBy: [OrganizationMembershipsOrderBy!] = [{ organizationMembershipCreatedAt: AscNullsLast }]\n    $first: Int = 250\n  ) {\n    memberships: organizationMembershipsCollection(first: $first, filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          organizationMembershipId\n          profileId\n          organizationMembershipInviteEmail\n          organizationMembershipInvitePhone\n          organizationMembershipInviteAddressLevel0Id\n          organizationMembershipInviteDocumentKind\n          organizationMembershipInviteDocumentValue\n          organizationMembershipInviteExpiresAt\n          organizationMembershipAcceptedAt\n          organizationMembershipCreatedAt\n          profile { profileNameFull }\n          organizationMembershipPermissionsCollection(first: 250) {\n            edges { node { permissionId } }\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").MembersAdminPageQueryDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation MembersPendingInvitationsCancelMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
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
  source: "\n  mutation OnboardingProfileFormUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").OnboardingProfileFormUpdateNameMutationDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: '\n  query ViewerOnboardingStateGet {\n    profile: viewerProfile {\n      profileNameFull\n      profileOnboardedAt\n      avatar: storage_profiles(\n        filter: { folder: { eq: "avatar" } }\n        orderBy: [{ createdAt: DescNullsLast }]\n        first: 1\n      ) {\n        edges {\n          node {\n            src\n          }\n        }\n      }\n    }\n  }\n',
): typeof import("./graphql").ViewerOnboardingStateGetDocument;
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
  source: "\n  fragment ConversationThreadFragment on Conversations {\n    conversationId\n    conversationSubject\n    conversationStatus\n    organizationId\n    agencyId\n    messages: conversationMessagesCollection(first: 250, orderBy: [{ messageCreatedAt: AscNullsLast }]) {\n      edges {\n        node {\n          conversationMessageId\n          messageBody\n          messageDirection\n          messageAuthor\n          messageChannel\n          messagePriority\n          messageCreatedAt\n          messageReadAt\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ConversationThreadFragmentFragmentDoc;
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
  source: "\n  mutation GrantAgencyOrgAccessMcp($objects: [AgenciesOrganizationsGrantsInsertInput!]!) {\n    insertIntoAgenciesOrganizationsGrantsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").GrantAgencyOrgAccessMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RevokeAgencyOrgAccessMcp($filter: AgenciesOrganizationsGrantsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgenciesOrganizationsGrantsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").RevokeAgencyOrgAccessMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation InviteAffiliateMcp($agency_id: Int!, $email: String!) {\n    membership: viewerAgencyMembershipInviteByEmail(agencyId: $agency_id, email: $email) {\n      agencyMembershipId\n    }\n  }\n",
): typeof import("./graphql").InviteAffiliateMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateAffiliateMcp($agency_membership_id: Int!, $operation: String!) {\n    membership: viewerAgencyMembershipUpdate(agencyMembershipId: $agency_membership_id, operation: $operation) {\n      agencyMembershipId\n    }\n  }\n",
): typeof import("./graphql").UpdateAffiliateMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation GrantAgencyMemberPermissionMcp($objects: [AgencyMembershipPermissionsInsertInput!]!) {\n    insertIntoAgencyMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").GrantAgencyMemberPermissionMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RevokeAgencyMemberPermissionMcp($filter: AgencyMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromAgencyMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").RevokeAgencyMemberPermissionMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation GrantMemberPermissionMcp($objects: [OrganizationMembershipPermissionsInsertInput!]!) {\n    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").GrantMemberPermissionMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RevokeMemberPermissionMcp($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {\n    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").RevokeMemberPermissionMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SetMemberPermissionsMcp($organization_membership_id: Int!, $permission_ids: [String]!) {\n    result: viewerOrganizationMembershipSetPermissions(\n      organizationMembershipId: $organization_membership_id\n      permissionIds: $permission_ids\n    ) {\n      edges { node { permissionId } }\n    }\n  }\n",
): typeof import("./graphql").SetMemberPermissionsMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateMemberStatusMcp($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").UpdateMemberStatusMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreatePresetMcp($objects: [PermissionPresetsInsertInput!]!) {\n    insertIntoPermissionPresetsCollection(objects: $objects) {\n      records { permissionPresetId }\n    }\n  }\n",
): typeof import("./graphql").CreatePresetMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdatePresetMcp($filter: PermissionPresetsFilter!, $set: PermissionPresetsUpdateInput!, $atMost: Int! = 1000) {\n    updatePermissionPresetsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").UpdatePresetMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeletePresetMcp($filter: PermissionPresetsFilter!, $atMost: Int! = 1000) {\n    deleteFromPermissionPresetsCollection(filter: $filter, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").DeletePresetMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateProfileMcp($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {\n    updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").UpdateProfileMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateTenantMcp($filter: TenantsFilter!, $set: TenantsUpdateInput!, $atMost: Int! = 1000) {\n    updateTenantsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n      records {\n        tenantName\n        tenantOnboardedAt\n      }\n    }\n  }\n",
): typeof import("./graphql").UpdateTenantMcpDocument;
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateOrganizationMcp($filter: OrganizationsFilter!, $set: OrganizationsUpdateInput!, $atMost: Int! = 1000) {\n    updateOrganizationsCollection(filter: $filter, set: $set, atMost: $atMost) {\n      affectedCount\n    }\n  }\n",
): typeof import("./graphql").UpdateOrganizationMcpDocument;
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
