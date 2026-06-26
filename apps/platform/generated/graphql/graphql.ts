/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AddressesLevel0Filter = {
  addressLevel0CreatedAt?: DatetimeFilter | null | undefined;
  addressLevel0DeletedAt?: DatetimeFilter | null | undefined;
  addressLevel0Emoji?: StringFilter | null | undefined;
  addressLevel0HiddenAt?: DatetimeFilter | null | undefined;
  addressLevel0Id?: StringFilter | null | undefined;
  addressLevel0Name?: StringFilter | null | undefined;
  addressLevel0UpdatedAt?: DatetimeFilter | null | undefined;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<AddressesLevel0Filter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: AddressesLevel0Filter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<AddressesLevel0Filter> | null | undefined;
};

export type AddressesLevel0OrderBy = {
  addressLevel0CreatedAt?: OrderByDirection | null | undefined;
  addressLevel0DeletedAt?: OrderByDirection | null | undefined;
  addressLevel0Emoji?: OrderByDirection | null | undefined;
  addressLevel0HiddenAt?: OrderByDirection | null | undefined;
  addressLevel0Id?: OrderByDirection | null | undefined;
  addressLevel0Name?: OrderByDirection | null | undefined;
  addressLevel0UpdatedAt?: OrderByDirection | null | undefined;
};

export type AgenciesFilter = {
  agencyCreatedAt?: DatetimeFilter | null | undefined;
  agencyDeletedAt?: DatetimeFilter | null | undefined;
  agencyId?: IntFilter | null | undefined;
  agencyName?: StringFilter | null | undefined;
  agencySlug?: StringFilter | null | undefined;
  agencyUpdatedAt?: DatetimeFilter | null | undefined;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<AgenciesFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: AgenciesFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<AgenciesFilter> | null | undefined;
};

export type AgenciesOrderBy = {
  agencyCreatedAt?: OrderByDirection | null | undefined;
  agencyDeletedAt?: OrderByDirection | null | undefined;
  agencyId?: OrderByDirection | null | undefined;
  agencyName?: OrderByDirection | null | undefined;
  agencySlug?: OrderByDirection | null | undefined;
  agencyUpdatedAt?: OrderByDirection | null | undefined;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: string | null | undefined;
  gt?: string | null | undefined;
  gte?: string | null | undefined;
  in?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  lt?: string | null | undefined;
  lte?: string | null | undefined;
  neq?: string | null | undefined;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: string | null | undefined;
  gt?: string | null | undefined;
  gte?: string | null | undefined;
  in?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  lt?: string | null | undefined;
  lte?: string | null | undefined;
  neq?: string | null | undefined;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: string | number | null | undefined;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: number | null | undefined;
  gt?: number | null | undefined;
  gte?: number | null | undefined;
  in?: Array<number> | null | undefined;
  is?: FilterIs | null | undefined;
  lt?: number | null | undefined;
  lte?: number | null | undefined;
  neq?: number | null | undefined;
};

export enum MessageChannel {
  Email = 'email',
  InApp = 'in_app',
  Sms = 'sms',
  WebPush = 'web_push',
  Whatsapp = 'whatsapp'
}

/** Boolean expression comparing fields on type "MessageChannel" */
export type MessageChannelFilter = {
  eq?: MessageChannel | null | undefined;
  in?: Array<MessageChannel> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: MessageChannel | null | undefined;
};

export enum NotificationPriority {
  Critical = 'critical',
  High = 'high',
  Low = 'low',
  Medium = 'medium'
}

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type OrganizationMembershipsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<OrganizationMembershipsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: OrganizationMembershipsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<OrganizationMembershipsFilter> | null | undefined;
  organizationId?: IntFilter | null | undefined;
  organizationMembershipAcceptedAt?: DatetimeFilter | null | undefined;
  organizationMembershipCreatedAt?: DatetimeFilter | null | undefined;
  organizationMembershipId?: IntFilter | null | undefined;
  organizationMembershipInviteAddressLevel0Id?: StringFilter | null | undefined;
  organizationMembershipInviteDocumentKind?: ProfileIdentityDocumentKindFilter | null | undefined;
  organizationMembershipInviteDocumentValue?: StringFilter | null | undefined;
  organizationMembershipInviteEmail?: StringFilter | null | undefined;
  organizationMembershipInviteExpiresAt?: DatetimeFilter | null | undefined;
  organizationMembershipInvitePhone?: StringFilter | null | undefined;
  organizationMembershipInviteToken?: StringFilter | null | undefined;
  organizationMembershipRejectedAt?: DatetimeFilter | null | undefined;
  organizationMembershipRevokedAt?: DatetimeFilter | null | undefined;
  organizationMembershipUpdatedAt?: DatetimeFilter | null | undefined;
  profileId?: UuidFilter | null | undefined;
};

export type OrganizationMembershipsOrderBy = {
  organizationId?: OrderByDirection | null | undefined;
  organizationMembershipAcceptedAt?: OrderByDirection | null | undefined;
  organizationMembershipCreatedAt?: OrderByDirection | null | undefined;
  organizationMembershipId?: OrderByDirection | null | undefined;
  organizationMembershipInviteAddressLevel0Id?: OrderByDirection | null | undefined;
  organizationMembershipInviteDocumentKind?: OrderByDirection | null | undefined;
  organizationMembershipInviteDocumentValue?: OrderByDirection | null | undefined;
  organizationMembershipInviteEmail?: OrderByDirection | null | undefined;
  organizationMembershipInviteExpiresAt?: OrderByDirection | null | undefined;
  organizationMembershipInvitePhone?: OrderByDirection | null | undefined;
  organizationMembershipInviteToken?: OrderByDirection | null | undefined;
  organizationMembershipRejectedAt?: OrderByDirection | null | undefined;
  organizationMembershipRevokedAt?: OrderByDirection | null | undefined;
  organizationMembershipUpdatedAt?: OrderByDirection | null | undefined;
  profileId?: OrderByDirection | null | undefined;
};

export type OrganizationMembershipsUpdateInput = {
  organizationId?: number | null | undefined;
  organizationMembershipAcceptedAt?: string | null | undefined;
  organizationMembershipCreatedAt?: string | null | undefined;
  organizationMembershipInviteAddressLevel0Id?: string | null | undefined;
  organizationMembershipInviteDocumentKind?: ProfileIdentityDocumentKind | null | undefined;
  organizationMembershipInviteDocumentValue?: string | null | undefined;
  organizationMembershipInviteEmail?: string | null | undefined;
  organizationMembershipInviteExpiresAt?: string | null | undefined;
  organizationMembershipInvitePhone?: string | null | undefined;
  organizationMembershipInviteToken?: string | null | undefined;
  organizationMembershipRejectedAt?: string | null | undefined;
  organizationMembershipRevokedAt?: string | null | undefined;
  organizationMembershipUpdatedAt?: string | null | undefined;
  profileId?: string | null | undefined;
};

export type OrganizationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<OrganizationsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: OrganizationsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<OrganizationsFilter> | null | undefined;
  organizationCreatedAt?: DatetimeFilter | null | undefined;
  organizationDeletedAt?: DatetimeFilter | null | undefined;
  organizationId?: IntFilter | null | undefined;
  organizationName?: StringFilter | null | undefined;
  organizationSlug?: StringFilter | null | undefined;
  organizationUpdatedAt?: DatetimeFilter | null | undefined;
  tenantId?: IntFilter | null | undefined;
};

export type OrganizationsOrderBy = {
  organizationCreatedAt?: OrderByDirection | null | undefined;
  organizationDeletedAt?: OrderByDirection | null | undefined;
  organizationId?: OrderByDirection | null | undefined;
  organizationName?: OrderByDirection | null | undefined;
  organizationSlug?: OrderByDirection | null | undefined;
  organizationUpdatedAt?: OrderByDirection | null | undefined;
  tenantId?: OrderByDirection | null | undefined;
};

export type OrganizationsUpdateInput = {
  organizationCreatedAt?: string | null | undefined;
  organizationDeletedAt?: string | null | undefined;
  organizationName?: string | null | undefined;
  organizationSlug?: string | null | undefined;
  organizationUpdatedAt?: string | null | undefined;
  tenantId?: number | null | undefined;
};

export type PermissionGrantsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<PermissionGrantsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: PermissionGrantsFilter | null | undefined;
  objectOrganizationId?: IntFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<PermissionGrantsFilter> | null | undefined;
  permissionGrantCreatedAt?: DatetimeFilter | null | undefined;
  permissionGrantId?: BigIntFilter | null | undefined;
  permissionId?: StringFilter | null | undefined;
  subjectAgencyId?: IntFilter | null | undefined;
  subjectAgencyMembershipId?: IntFilter | null | undefined;
  subjectOrganizationMembershipId?: IntFilter | null | undefined;
};

export type PermissionGrantsInsertInput = {
  objectOrganizationId?: number | null | undefined;
  permissionGrantCreatedAt?: string | null | undefined;
  permissionId?: string | null | undefined;
  subjectAgencyId?: number | null | undefined;
  subjectAgencyMembershipId?: number | null | undefined;
  subjectOrganizationMembershipId?: number | null | undefined;
};

export type PermissionPresetsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<PermissionPresetsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: PermissionPresetsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<PermissionPresetsFilter> | null | undefined;
  organizationId?: IntFilter | null | undefined;
  permissionPresetCreatedAt?: DatetimeFilter | null | undefined;
  permissionPresetId?: IntFilter | null | undefined;
  permissionPresetName?: StringFilter | null | undefined;
  permissionPresetSlugs?: StringListFilter | null | undefined;
  permissionPresetUpdatedAt?: DatetimeFilter | null | undefined;
};

export type PermissionPresetsInsertInput = {
  organizationId?: number | null | undefined;
  permissionPresetCreatedAt?: string | null | undefined;
  permissionPresetName?: string | null | undefined;
  permissionPresetSlugs?: Array<string | null | undefined> | null | undefined;
  permissionPresetUpdatedAt?: string | null | undefined;
};

export type PermissionPresetsOrderBy = {
  organizationId?: OrderByDirection | null | undefined;
  permissionPresetCreatedAt?: OrderByDirection | null | undefined;
  permissionPresetId?: OrderByDirection | null | undefined;
  permissionPresetName?: OrderByDirection | null | undefined;
  permissionPresetUpdatedAt?: OrderByDirection | null | undefined;
};

export type PermissionPresetsUpdateInput = {
  organizationId?: number | null | undefined;
  permissionPresetCreatedAt?: string | null | undefined;
  permissionPresetName?: string | null | undefined;
  permissionPresetSlugs?: Array<string | null | undefined> | null | undefined;
  permissionPresetUpdatedAt?: string | null | undefined;
};

export type PermissionsOrderBy = {
  permissionCreatedAt?: OrderByDirection | null | undefined;
  permissionDescription?: OrderByDirection | null | undefined;
  permissionId?: OrderByDirection | null | undefined;
  permissionUpdatedAt?: OrderByDirection | null | undefined;
};

export type ProfileContactsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<ProfileContactsFilter> | null | undefined;
  contactValue?: StringFilter | null | undefined;
  contactVerifiedAt?: DatetimeFilter | null | undefined;
  messageChannel?: MessageChannelFilter | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: ProfileContactsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<ProfileContactsFilter> | null | undefined;
  profileContactCreatedAt?: DatetimeFilter | null | undefined;
  profileContactId?: UuidFilter | null | undefined;
  profileContactUpdatedAt?: DatetimeFilter | null | undefined;
  profileId?: UuidFilter | null | undefined;
};

export type ProfileContactsInsertInput = {
  contactValue?: string | null | undefined;
  contactVerifiedAt?: string | null | undefined;
  messageChannel?: MessageChannel | null | undefined;
  profileContactCreatedAt?: string | null | undefined;
  profileContactId?: string | null | undefined;
  profileContactUpdatedAt?: string | null | undefined;
  profileId?: string | null | undefined;
};

export type ProfileContactsOrderBy = {
  contactValue?: OrderByDirection | null | undefined;
  contactVerifiedAt?: OrderByDirection | null | undefined;
  messageChannel?: OrderByDirection | null | undefined;
  profileContactCreatedAt?: OrderByDirection | null | undefined;
  profileContactId?: OrderByDirection | null | undefined;
  profileContactUpdatedAt?: OrderByDirection | null | undefined;
  profileId?: OrderByDirection | null | undefined;
};

export enum ProfileIdentityDocumentKind {
  Nin = 'nin',
  Passport = 'passport'
}

/** Boolean expression comparing fields on type "ProfileIdentityDocumentKind" */
export type ProfileIdentityDocumentKindFilter = {
  eq?: ProfileIdentityDocumentKind | null | undefined;
  in?: Array<ProfileIdentityDocumentKind> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: ProfileIdentityDocumentKind | null | undefined;
};

export type ProfilesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<ProfilesFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: ProfilesFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<ProfilesFilter> | null | undefined;
  profileCreatedAt?: DatetimeFilter | null | undefined;
  profileDeletedAt?: DatetimeFilter | null | undefined;
  profileId?: UuidFilter | null | undefined;
  profileNameFull?: StringFilter | null | undefined;
  profileOnboardedAt?: DatetimeFilter | null | undefined;
  profileUpdatedAt?: DatetimeFilter | null | undefined;
};

export type ProfilesUpdateInput = {
  profileCreatedAt?: string | null | undefined;
  profileDeletedAt?: string | null | undefined;
  profileId?: string | null | undefined;
  profileNameFull?: string | null | undefined;
  profileOnboardedAt?: string | null | undefined;
  profileUpdatedAt?: string | null | undefined;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: string | null | undefined;
  gt?: string | null | undefined;
  gte?: string | null | undefined;
  ilike?: string | null | undefined;
  in?: Array<string> | null | undefined;
  iregex?: string | null | undefined;
  is?: FilterIs | null | undefined;
  like?: string | null | undefined;
  lt?: string | null | undefined;
  lte?: string | null | undefined;
  neq?: string | null | undefined;
  regex?: string | null | undefined;
  startsWith?: string | null | undefined;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: Array<string> | null | undefined;
  contains?: Array<string> | null | undefined;
  eq?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  overlaps?: Array<string> | null | undefined;
};

export enum TenantTier {
  Enterprise = 'enterprise',
  Free = 'free',
  Pro = 'pro'
}

/** Boolean expression comparing fields on type "TenantTier" */
export type TenantTierFilter = {
  eq?: TenantTier | null | undefined;
  in?: Array<TenantTier> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: TenantTier | null | undefined;
};

export type TenantsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<TenantsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: TenantsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<TenantsFilter> | null | undefined;
  tenantCreatedAt?: DatetimeFilter | null | undefined;
  tenantDeletedAt?: DatetimeFilter | null | undefined;
  tenantId?: IntFilter | null | undefined;
  tenantName?: StringFilter | null | undefined;
  tenantOnboardedAt?: DatetimeFilter | null | undefined;
  tenantSlug?: StringFilter | null | undefined;
  tenantTier?: TenantTierFilter | null | undefined;
  tenantUpdatedAt?: DatetimeFilter | null | undefined;
};

export type TenantsOrderBy = {
  tenantCreatedAt?: OrderByDirection | null | undefined;
  tenantDeletedAt?: OrderByDirection | null | undefined;
  tenantId?: OrderByDirection | null | undefined;
  tenantName?: OrderByDirection | null | undefined;
  tenantOnboardedAt?: OrderByDirection | null | undefined;
  tenantSlug?: OrderByDirection | null | undefined;
  tenantTier?: OrderByDirection | null | undefined;
  tenantUpdatedAt?: OrderByDirection | null | undefined;
};

export type TenantsUpdateInput = {
  tenantCreatedAt?: string | null | undefined;
  tenantDeletedAt?: string | null | undefined;
  tenantName?: string | null | undefined;
  tenantOnboardedAt?: string | null | undefined;
  tenantSlug?: string | null | undefined;
  tenantTier?: TenantTier | null | undefined;
  tenantUpdatedAt?: string | null | undefined;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: string | null | undefined;
  in?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: string | null | undefined;
};

export type AgencyInboxConversationPageQueryQueryVariables = Exact<{
  conversationId: string;
}>;


export type AgencyInboxConversationPageQueryQuery = { conversation: { conversationId: string, conversationSubject: string | null, conversationStatus: string, organizationId: number | null, agencyId: number | null, messages: { edges: Array<{ node: { conversationMessageId: string, messageBody: string | null, messageDirection: string, messageAuthor: string, messageChannel: MessageChannel | null, messagePriority: NotificationPriority | null, messageCreatedAt: string, messageReadAt: string | null } }> } | null } | null };

export type AgencyOverviewPageQueryQueryVariables = Exact<{
  agencyId: number;
}>;


export type AgencyOverviewPageQueryQuery = { activeMemberships: { totalCount: number } | null, pendingMemberships: { totalCount: number } | null, grants: { edges: Array<{ node: { objectOrganizationId: number | null, permissionId: string } }> } | null };

export type AgencyCreateMutationMutationVariables = Exact<{
  agency_name: string;
  agency_slug: string;
}>;


export type AgencyCreateMutationMutation = { agency: { agencyId: number } | null };

export type DangerPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DangerPageQueryQuery = { organizations: { edges: Array<{ node: { organizationId: number } }> } | null };

export type ProfileContactsManageQueryQueryVariables = Exact<{
  orderBy?: Array<ProfileContactsOrderBy> | ProfileContactsOrderBy | null | undefined;
}>;


export type ProfileContactsManageQueryQuery = { profileContactsCollection: { edges: Array<{ node: { profileContactId: string, messageChannel: MessageChannel, contactValue: string, contactVerifiedAt: string | null } }> } | null };

export type ProfileContactsManageInsertMutationMutationVariables = Exact<{
  objects: Array<ProfileContactsInsertInput> | ProfileContactsInsertInput;
}>;


export type ProfileContactsManageInsertMutationMutation = { insertIntoProfileContactsCollection: { affectedCount: number } | null };

export type ProfileContactsManageDeleteMutationMutationVariables = Exact<{
  filter: ProfileContactsFilter;
  atMost?: number;
}>;


export type ProfileContactsManageDeleteMutationMutation = { deleteFromProfileContactsCollection: { affectedCount: number } };

export type AccountProfilePageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountProfilePageQueryQuery = { profile: { profileNameFull: string | null, avatar: { edges: Array<{ node: { src: string | null } }> } | null } | null };

export type ProfileSectionUpdateNameMutationMutationVariables = Exact<{
  filter: ProfilesFilter;
  set: ProfilesUpdateInput;
  atMost?: number;
}>;


export type ProfileSectionUpdateNameMutationMutation = { updateProfilesCollection: { affectedCount: number } };

export type SessionsSectionPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionsSectionPageQueryQuery = { sessions: { edges: Array<{ node: { id: string | null, userAgent: string | null, ip: string | null, createdAt: string | null, refreshedAt: string | null, notAfter: string | null } }> } | null };

export type SessionsSectionSessionFragmentFragment = { id: string | null, userAgent: string | null, ip: string | null, createdAt: string | null, refreshedAt: string | null, notAfter: string | null };

export type HomeInboxConversationPageQueryQueryVariables = Exact<{
  conversationId: string;
}>;


export type HomeInboxConversationPageQueryQuery = { conversation: { conversationId: string, conversationSubject: string | null, conversationStatus: string, organizationId: number | null, agencyId: number | null, messages: { edges: Array<{ node: { conversationMessageId: string, messageBody: string | null, messageDirection: string, messageAuthor: string, messageChannel: MessageChannel | null, messagePriority: NotificationPriority | null, messageCreatedAt: string, messageReadAt: string | null } }> } | null } | null };

export type HomePickerPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HomePickerPageQueryQuery = { organizations: { edges: Array<{ node: { organizationId: number, organizationName: string, organizationSlug: string, tenant: { tenantId: number, tenantSlug: string, tenantName: string } | null } }> } | null };

export type OrgInboxConversationPageQueryQueryVariables = Exact<{
  conversationId: string;
}>;


export type OrgInboxConversationPageQueryQuery = { conversation: { conversationId: string, conversationSubject: string | null, conversationStatus: string, organizationId: number | null, agencyId: number | null, messages: { edges: Array<{ node: { conversationMessageId: string, messageBody: string | null, messageDirection: string, messageAuthor: string, messageChannel: MessageChannel | null, messagePriority: NotificationPriority | null, messageCreatedAt: string, messageReadAt: string | null } }> } | null } | null };

export type FinishTenantOnboardingMutationMutationVariables = Exact<{
  tenant_id: number;
}>;


export type FinishTenantOnboardingMutationMutation = { tenant: { tenantId: number, tenantOnboardedAt: string | null } | null };

export type TenantOnboardingStateGetQueryVariables = Exact<{
  tenant_id: number;
}>;


export type TenantOnboardingStateGetQuery = { tenant: { tenantOnboardedAt: string | null, logo: { edges: Array<{ node: { storageTenantId: string | null } }> } | null, organizations: { edges: Array<{ node: { memberships: { totalCount: number } | null } }> } | null } | null };

export type CreateOrganizationFormMutationMutationVariables = Exact<{
  organization_name: string;
  organization_slug: string;
  tenant_id: number;
}>;


export type CreateOrganizationFormMutationMutation = { organization: { organizationId: number, organizationSlug: string } | null };

export type ExternalAccessGrantMutationMutationVariables = Exact<{
  organization_id: number;
  agency_id: number;
}>;


export type ExternalAccessGrantMutationMutation = { grant: { permissionGrantId: string } | null };

export type ExternalAccessRevokeMutationMutationVariables = Exact<{
  organization_id: number;
  agency_id: number;
}>;


export type ExternalAccessRevokeMutationMutation = { revoke: { permissionGrantId: string } | null };

export type EditOrganizationMembershipGrantPermissionMutationMutationVariables = Exact<{
  objects: Array<PermissionGrantsInsertInput> | PermissionGrantsInsertInput;
}>;


export type EditOrganizationMembershipGrantPermissionMutationMutation = { insertIntoPermissionGrantsCollection: { affectedCount: number } | null };

export type EditOrganizationMembershipRevokePermissionMutationMutationVariables = Exact<{
  filter: PermissionGrantsFilter;
  atMost?: number;
}>;


export type EditOrganizationMembershipRevokePermissionMutationMutation = { deleteFromPermissionGrantsCollection: { affectedCount: number } };

export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables = Exact<{
  filter: OrganizationMembershipsFilter;
  set: OrganizationMembershipsUpdateInput;
  atMost?: number;
}>;


export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation = { updateOrganizationMembershipsCollection: { affectedCount: number } };

export type EditOrganizationMembershipSetPermissionsMutationMutationVariables = Exact<{
  organizationMembershipId: number;
  permissionIds: Array<string | null | undefined> | string;
}>;


export type EditOrganizationMembershipSetPermissionsMutationMutation = { viewerOrganizationMembershipSetPermissionsCollection: { edges: Array<{ node: { permissionId: string } }> } | null };

export type EditPermissionsFormPermissionFragmentFragment = { permissionId: string, permissionDescription: string | null };

export type EditPermissionsFormPresetFragmentFragment = { permissionPresetId: number, permissionPresetName: string, permissionPresetSlugs: Array<string | null>, organizationId: number | null };

export type OrganizationMembershipEditPageQueryQueryVariables = Exact<{
  organizationId: number;
  organizationMembershipId: number;
  presetsFilter?: PermissionPresetsFilter | null | undefined;
  permissionsOrderBy?: Array<PermissionsOrderBy> | PermissionsOrderBy | null | undefined;
  presetsOrderBy?: Array<PermissionPresetsOrderBy> | PermissionPresetsOrderBy | null | undefined;
  first?: number | null | undefined;
}>;


export type OrganizationMembershipEditPageQueryQuery = { canManage: boolean | null, organization: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } | null, membership: { organizationMembershipId: number, profileId: string | null, organizationMembershipLabel: string | null, organizationMembershipEmail: string | null, organizationMembershipInviteEmail: string | null, organizationMembershipInvitePhone: string | null, organizationMembershipInviteAddressLevel0Id: string | null, organizationMembershipInviteDocumentKind: ProfileIdentityDocumentKind | null, organizationMembershipInviteDocumentValue: string | null, organizationMembershipAcceptedAt: string | null, organizationMembershipRevokedAt: string | null, organizationMembershipRejectedAt: string | null, profile: { profileNameFull: string | null } | null, permissionGrantsCollection: { edges: Array<{ node: { permissionId: string } }> } | null } | null, permissions: { edges: Array<{ node: { permissionId: string, permissionDescription: string | null } }> } | null, presets: { edges: Array<{ node: { permissionPresetId: number, permissionPresetName: string, permissionPresetSlugs: Array<string | null>, organizationId: number | null } }> } | null };

export type MembersAdminPageQueryQueryVariables = Exact<{
  filter?: OrganizationMembershipsFilter | null | undefined;
  orderBy?: Array<OrganizationMembershipsOrderBy> | OrganizationMembershipsOrderBy | null | undefined;
  first?: number | null | undefined;
}>;


export type MembersAdminPageQueryQuery = { memberships: { edges: Array<{ node: { organizationMembershipId: number, profileId: string | null, organizationMembershipInviteEmail: string | null, organizationMembershipInvitePhone: string | null, organizationMembershipInviteAddressLevel0Id: string | null, organizationMembershipInviteDocumentKind: ProfileIdentityDocumentKind | null, organizationMembershipInviteDocumentValue: string | null, organizationMembershipInviteExpiresAt: string | null, organizationMembershipAcceptedAt: string | null, organizationMembershipCreatedAt: string, profile: { profileNameFull: string | null } | null, permissionGrantsCollection: { edges: Array<{ node: { permissionId: string } }> } | null } }> } | null };

export type MembersPendingInvitationsCancelMutationMutationVariables = Exact<{
  filter: OrganizationMembershipsFilter;
  set: OrganizationMembershipsUpdateInput;
  atMost?: number;
}>;


export type MembersPendingInvitationsCancelMutationMutation = { updateOrganizationMembershipsCollection: { affectedCount: number } };

export type UpdateTenantNameMutationMutationVariables = Exact<{
  tenant_id: number;
  tenant_name: string;
}>;


export type UpdateTenantNameMutationMutation = { tenant: { tenantId: number, tenantName: string } | null };

export type CheckTenantPermissionQueryVariables = Exact<{
  tenantId: number;
  permissionId: string;
}>;


export type CheckTenantPermissionQuery = { viewerHasTenantPermission: boolean | null };

export type InsertSsoProviderMutationVariables = Exact<{
  tenantId: number;
  ssoProviderId: string;
  label: string;
  domains: Array<string | null | undefined> | string;
  enabled: boolean;
}>;


export type InsertSsoProviderMutation = { insertIntoTenantSsoProvidersCollection: { affectedCount: number } | null };

export type DeleteSsoProviderMutationVariables = Exact<{
  tenantId: number;
  ssoProviderId: string;
}>;


export type DeleteSsoProviderMutation = { deleteFromTenantSsoProvidersCollection: { affectedCount: number } };

export type TenantSsoPageQueryQueryVariables = Exact<{
  tenantId: number;
}>;


export type TenantSsoPageQueryQuery = { tenantSsoProvidersCollection: { edges: Array<{ node: { ssoProviderId: string, ssoProviderLabel: string, ssoProviderDomains: Array<string | null>, ssoProviderEnabled: boolean } }> } | null };

export type CreateTenantFormMutationMutationVariables = Exact<{
  tenant_name: string;
  tenant_slug: string;
}>;


export type CreateTenantFormMutationMutation = { tenant: { tenantId: number } | null };

export type CheckEmailQueryQueryVariables = Exact<{
  email: string;
}>;


export type CheckEmailQueryQuery = { emailDomainHasSso: string | null, emailExists: boolean | null, emailHasPassword: boolean | null };

export type OnboardingProfileFormUpdateNameMutationMutationVariables = Exact<{
  filter: ProfilesFilter;
  set: ProfilesUpdateInput;
  atMost?: number;
}>;


export type OnboardingProfileFormUpdateNameMutationMutation = { updateProfilesCollection: { affectedCount: number } };

export type ViewerOnboardingStateGetQueryVariables = Exact<{
  email: string;
}>;


export type ViewerOnboardingStateGetQuery = { emailHasPassword: boolean | null, profile: { profileNameFull: string | null, profileOnboardedAt: string | null, identity: { profileIdentityId: string } | null, avatar: { src: string | null } | null } | null };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { healthCurrentTimestamp: string | null };

export type ConversationThreadFragmentFragment = { conversationId: string, conversationSubject: string | null, conversationStatus: string, organizationId: number | null, agencyId: number | null, messages: { edges: Array<{ node: { conversationMessageId: string, messageBody: string | null, messageDirection: string, messageAuthor: string, messageChannel: MessageChannel | null, messagePriority: NotificationPriority | null, messageCreatedAt: string, messageReadAt: string | null } }> } | null };

export type ScopeSelectorOrgsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ScopeSelectorOrgsQueryQuery = { viewerOrganizationsCollection: { edges: Array<{ node: { organizationId: number, organizationName: string, tenant: { tenantSlug: string } | null } }> } | null };

export type ScopeSelectorAgenciesQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ScopeSelectorAgenciesQueryQuery = { agencies: { edges: Array<{ node: { agencyId: number, agencySlug: string, agencyName: string } }> } | null };

export type PostHogIdentifyQueryVariables = Exact<{ [key: string]: never; }>;


export type PostHogIdentifyQuery = { profile: { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileCreatedAt: string } | null, tenants: { edges: Array<{ node: { tenantId: number, tenantSlug: string, tenantTier: TenantTier, tenantCreatedAt: string } }> } | null, organizations: { edges: Array<{ node: { organizationId: number, organizationName: string, tenantId: number } }> } | null };

export type CountryGetFragmentFragment = { addressLevel0Id: string, addressLevel0Name: string, addressLevel0Emoji: string | null };

export type CountriesGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AddressesLevel0Filter | null | undefined;
  orderBy?: Array<AddressesLevel0OrderBy> | AddressesLevel0OrderBy | null | undefined;
}>;


export type CountriesGetQuery = { addressesLevel0: { edges: Array<{ node: { addressLevel0Id: string, addressLevel0Name: string, addressLevel0Emoji: string | null } }> } | null };

export type ViewerAgencyGetFragmentFragment = { agencyId: number, agencySlug: string, agencyName: string, agencyDeletedAt: string | null };

export type ViewerAgenciesGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AgenciesFilter | null | undefined;
  orderBy?: Array<AgenciesOrderBy> | AgenciesOrderBy | null | undefined;
}>;


export type ViewerAgenciesGetQuery = { agencies: { edges: Array<{ node: { agencyId: number, agencySlug: string, agencyName: string, agencyDeletedAt: string | null } }> } | null };

export type ViewerAgencyByIdGetQueryVariables = Exact<{
  agencyId: number;
}>;


export type ViewerAgencyByIdGetQuery = { agency: { agencyId: number, agencySlug: string, agencyName: string, agencyDeletedAt: string | null } | null };

export type ViewerAgencyBySlugGetQueryVariables = Exact<{
  agencySlug: string;
}>;


export type ViewerAgencyBySlugGetQuery = { agency: { agencyId: number, agencySlug: string, agencyName: string, agencyDeletedAt: string | null } | null };

export type ViewerOrganizationGetFragmentFragment = { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string };

export type ViewerOrganizationsGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;


export type ViewerOrganizationsGetQuery = { organizations: { edges: Array<{ node: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } }> } | null };

export type ViewerOrganizationByIdQueryQueryVariables = Exact<{
  organizationId: number;
}>;


export type ViewerOrganizationByIdQueryQuery = { organization: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } | null };

export type ViewerOrganizationBySlugQueryQueryVariables = Exact<{
  organizationSlug: string;
}>;


export type ViewerOrganizationBySlugQueryQuery = { organizations: { edges: Array<{ node: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } }> } | null };

export type ViewerProfileGetFragmentFragment = { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileDeletedAt: string | null, profileCreatedAt: string, profileUpdatedAt: string };

export type ViewerProfileGetQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerProfileGetQuery = { profile: { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileDeletedAt: string | null, profileCreatedAt: string, profileUpdatedAt: string } | null };

export type ViewerTenantGetFragmentFragment = { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier };

export type ViewerTenantsGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;


export type ViewerTenantsGetQuery = { tenants: { edges: Array<{ node: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } }> } | null };

export type ViewerTenantByIdGetQueryVariables = Exact<{
  tenantId: number;
}>;


export type ViewerTenantByIdGetQuery = { tenant: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } | null };

export type ViewerTenantBySlugGetQueryVariables = Exact<{
  tenantSlug: string;
}>;


export type ViewerTenantBySlugGetQuery = { tenant: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } | null };

export type CountryHookUseFragmentFragment = { addressLevel0Id: string, addressLevel0Name: string, addressLevel0Emoji: string | null };

export type CountriesUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AddressesLevel0Filter | null | undefined;
  orderBy?: Array<AddressesLevel0OrderBy> | AddressesLevel0OrderBy | null | undefined;
}>;


export type CountriesUseQuery = { addressesLevel0: { edges: Array<{ node: { addressLevel0Id: string, addressLevel0Name: string, addressLevel0Emoji: string | null } }> } | null };

export type ViewerAgencyUseFragmentFragment = { agencyId: number, agencySlug: string, agencyName: string };

export type ViewerAgenciesUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AgenciesFilter | null | undefined;
  orderBy?: Array<AgenciesOrderBy> | AgenciesOrderBy | null | undefined;
}>;


export type ViewerAgenciesUseQuery = { agencies: { edges: Array<{ node: { agencyId: number, agencySlug: string, agencyName: string } }> } | null };

export type ViewerAgencyByIdUseQueryVariables = Exact<{
  agencyId: number;
}>;


export type ViewerAgencyByIdUseQuery = { agency: { agencyId: number, agencySlug: string, agencyName: string } | null };

export type ViewerAgencyBySlugUseQueryVariables = Exact<{
  agencySlug: string;
}>;


export type ViewerAgencyBySlugUseQuery = { agency: { agencyId: number, agencySlug: string, agencyName: string } | null };

export type ViewerOrganizationUseFragmentFragment = { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string };

export type ViewerOrganizationsUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;


export type ViewerOrganizationsUseQuery = { organizations: { edges: Array<{ node: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } }> } | null };

export type ViewerOrganizationByIdUseQueryVariables = Exact<{
  organizationId: number;
}>;


export type ViewerOrganizationByIdUseQuery = { organization: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } | null };

export type ViewerOrganizationBySlugUseQueryVariables = Exact<{
  organizationSlug: string;
}>;


export type ViewerOrganizationBySlugUseQuery = { organizations: { edges: Array<{ node: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } }> } | null };

export type ViewerProfileUseFragmentFragment = { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileDeletedAt: string | null, profileCreatedAt: string, profileUpdatedAt: string };

export type ViewerProfileUseQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerProfileUseQuery = { profile: { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileDeletedAt: string | null, profileCreatedAt: string, profileUpdatedAt: string } | null };

export type ViewerTenantUseFragmentFragment = { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier };

export type ViewerTenantsUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;


export type ViewerTenantsUseQuery = { tenants: { edges: Array<{ node: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } }> } | null };

export type ViewerTenantByIdUseQueryVariables = Exact<{
  tenantId: number;
}>;


export type ViewerTenantByIdUseQuery = { tenant: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } | null };

export type ViewerTenantBySlugUseQueryVariables = Exact<{
  tenantSlug: string;
}>;


export type ViewerTenantBySlugUseQuery = { tenant: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } | null };

export type GrantAgencyOrgAccessMcpMutationVariables = Exact<{
  objects: Array<PermissionGrantsInsertInput> | PermissionGrantsInsertInput;
}>;


export type GrantAgencyOrgAccessMcpMutation = { insertIntoPermissionGrantsCollection: { affectedCount: number } | null };

export type RevokeAgencyOrgAccessMcpMutationVariables = Exact<{
  filter: PermissionGrantsFilter;
  atMost?: number;
}>;


export type RevokeAgencyOrgAccessMcpMutation = { deleteFromPermissionGrantsCollection: { affectedCount: number } };

export type InviteAffiliateMcpMutationVariables = Exact<{
  agency_id: number;
  email: string;
}>;


export type InviteAffiliateMcpMutation = { membership: { agencyMembershipId: number } | null };

export type UpdateAffiliateMcpMutationVariables = Exact<{
  agency_membership_id: number;
  operation: string;
}>;


export type UpdateAffiliateMcpMutation = { membership: { agencyMembershipId: number } | null };

export type GrantAgencyMemberPermissionMcpMutationVariables = Exact<{
  objects: Array<PermissionGrantsInsertInput> | PermissionGrantsInsertInput;
}>;


export type GrantAgencyMemberPermissionMcpMutation = { insertIntoPermissionGrantsCollection: { affectedCount: number } | null };

export type RevokeAgencyMemberPermissionMcpMutationVariables = Exact<{
  filter: PermissionGrantsFilter;
  atMost?: number;
}>;


export type RevokeAgencyMemberPermissionMcpMutation = { deleteFromPermissionGrantsCollection: { affectedCount: number } };

export type GrantMemberPermissionMcpMutationVariables = Exact<{
  objects: Array<PermissionGrantsInsertInput> | PermissionGrantsInsertInput;
}>;


export type GrantMemberPermissionMcpMutation = { insertIntoPermissionGrantsCollection: { affectedCount: number } | null };

export type RevokeMemberPermissionMcpMutationVariables = Exact<{
  filter: PermissionGrantsFilter;
  atMost?: number;
}>;


export type RevokeMemberPermissionMcpMutation = { deleteFromPermissionGrantsCollection: { affectedCount: number } };

export type SetMemberPermissionsMcpMutationVariables = Exact<{
  organization_membership_id: number;
  permission_ids: Array<string | null | undefined> | string;
}>;


export type SetMemberPermissionsMcpMutation = { result: { edges: Array<{ node: { permissionId: string } }> } | null };

export type UpdateMemberStatusMcpMutationVariables = Exact<{
  filter: OrganizationMembershipsFilter;
  set: OrganizationMembershipsUpdateInput;
  atMost?: number;
}>;


export type UpdateMemberStatusMcpMutation = { updateOrganizationMembershipsCollection: { affectedCount: number } };

export type CreatePresetMcpMutationVariables = Exact<{
  objects: Array<PermissionPresetsInsertInput> | PermissionPresetsInsertInput;
}>;


export type CreatePresetMcpMutation = { insertIntoPermissionPresetsCollection: { records: Array<{ permissionPresetId: number }> } | null };

export type UpdatePresetMcpMutationVariables = Exact<{
  filter: PermissionPresetsFilter;
  set: PermissionPresetsUpdateInput;
  atMost?: number;
}>;


export type UpdatePresetMcpMutation = { updatePermissionPresetsCollection: { affectedCount: number } };

export type DeletePresetMcpMutationVariables = Exact<{
  filter: PermissionPresetsFilter;
  atMost?: number;
}>;


export type DeletePresetMcpMutation = { deleteFromPermissionPresetsCollection: { affectedCount: number } };

export type UpdateProfileMcpMutationVariables = Exact<{
  filter: ProfilesFilter;
  set: ProfilesUpdateInput;
  atMost?: number;
}>;


export type UpdateProfileMcpMutation = { updateProfilesCollection: { affectedCount: number } };

export type UpdateTenantMcpMutationVariables = Exact<{
  filter: TenantsFilter;
  set: TenantsUpdateInput;
  atMost?: number;
}>;


export type UpdateTenantMcpMutation = { updateTenantsCollection: { affectedCount: number, records: Array<{ tenantName: string, tenantOnboardedAt: string | null }> } };

export type UpdateOrganizationMcpMutationVariables = Exact<{
  filter: OrganizationsFilter;
  set: OrganizationsUpdateInput;
  atMost?: number;
}>;


export type UpdateOrganizationMcpMutation = { updateOrganizationsCollection: { affectedCount: number } };

export type ListTenantsMcpQueryVariables = Exact<{ [key: string]: never; }>;


export type ListTenantsMcpQuery = { tenants: { edges: Array<{ node: { tenantId: number, tenantSlug: string, tenantName: string, tenantTier: TenantTier } }> } | null };

export type ListOrganizationsMcpQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsMcpQuery = { organizations: { edges: Array<{ node: { organizationId: number, tenantId: number, organizationSlug: string, organizationName: string } }> } | null };

export type WhoamiMcpQueryVariables = Exact<{ [key: string]: never; }>;


export type WhoamiMcpQuery = { profile: { profileId: string, profileNameFull: string | null, profileOnboardedAt: string | null, profileDeletedAt: string | null, profileCreatedAt: string, profileUpdatedAt: string } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const SessionsSectionSessionFragmentFragmentDoc = new TypedDocumentString(`
    fragment SessionsSectionSessionFragment on UserSessions {
  id
  userAgent
  ip
  createdAt
  refreshedAt
  notAfter
}
    `, {"fragmentName":"SessionsSectionSessionFragment"}) as unknown as TypedDocumentString<SessionsSectionSessionFragmentFragment, unknown>;
export const EditPermissionsFormPermissionFragmentFragmentDoc = new TypedDocumentString(`
    fragment EditPermissionsFormPermissionFragment on Permissions {
  permissionId
  permissionDescription
}
    `, {"fragmentName":"EditPermissionsFormPermissionFragment"}) as unknown as TypedDocumentString<EditPermissionsFormPermissionFragmentFragment, unknown>;
export const EditPermissionsFormPresetFragmentFragmentDoc = new TypedDocumentString(`
    fragment EditPermissionsFormPresetFragment on PermissionPresets {
  permissionPresetId
  permissionPresetName
  permissionPresetSlugs
  organizationId
}
    `, {"fragmentName":"EditPermissionsFormPresetFragment"}) as unknown as TypedDocumentString<EditPermissionsFormPresetFragmentFragment, unknown>;
export const ConversationThreadFragmentFragmentDoc = new TypedDocumentString(`
    fragment ConversationThreadFragment on Conversations {
  conversationId
  conversationSubject
  conversationStatus
  organizationId
  agencyId
  messages: conversationMessagesCollection(
    first: 250
    orderBy: [{messageCreatedAt: AscNullsLast}]
  ) {
    edges {
      node {
        conversationMessageId
        messageBody
        messageDirection
        messageAuthor
        messageChannel
        messagePriority
        messageCreatedAt
        messageReadAt
      }
    }
  }
}
    `, {"fragmentName":"ConversationThreadFragment"}) as unknown as TypedDocumentString<ConversationThreadFragmentFragment, unknown>;
export const CountryGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment CountryGetFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}
    `, {"fragmentName":"CountryGetFragment"}) as unknown as TypedDocumentString<CountryGetFragmentFragment, unknown>;
export const ViewerAgencyGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
  agencyDeletedAt
}
    `, {"fragmentName":"ViewerAgencyGetFragment"}) as unknown as TypedDocumentString<ViewerAgencyGetFragmentFragment, unknown>;
export const ViewerOrganizationGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}
    `, {"fragmentName":"ViewerOrganizationGetFragment"}) as unknown as TypedDocumentString<ViewerOrganizationGetFragmentFragment, unknown>;
export const ViewerProfileGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerProfileGetFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDeletedAt
  profileCreatedAt
  profileUpdatedAt
}
    `, {"fragmentName":"ViewerProfileGetFragment"}) as unknown as TypedDocumentString<ViewerProfileGetFragmentFragment, unknown>;
export const ViewerTenantGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerTenantGetFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}
    `, {"fragmentName":"ViewerTenantGetFragment"}) as unknown as TypedDocumentString<ViewerTenantGetFragmentFragment, unknown>;
export const CountryHookUseFragmentFragmentDoc = new TypedDocumentString(`
    fragment CountryHookUseFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}
    `, {"fragmentName":"CountryHookUseFragment"}) as unknown as TypedDocumentString<CountryHookUseFragmentFragment, unknown>;
export const ViewerAgencyUseFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerAgencyUseFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}
    `, {"fragmentName":"ViewerAgencyUseFragment"}) as unknown as TypedDocumentString<ViewerAgencyUseFragmentFragment, unknown>;
export const ViewerOrganizationUseFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerOrganizationUseFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}
    `, {"fragmentName":"ViewerOrganizationUseFragment"}) as unknown as TypedDocumentString<ViewerOrganizationUseFragmentFragment, unknown>;
export const ViewerProfileUseFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerProfileUseFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDeletedAt
  profileCreatedAt
  profileUpdatedAt
}
    `, {"fragmentName":"ViewerProfileUseFragment"}) as unknown as TypedDocumentString<ViewerProfileUseFragmentFragment, unknown>;
export const ViewerTenantUseFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerTenantUseFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}
    `, {"fragmentName":"ViewerTenantUseFragment"}) as unknown as TypedDocumentString<ViewerTenantUseFragmentFragment, unknown>;
export const AgencyInboxConversationPageQueryDocument = new TypedDocumentString(`
    query AgencyInboxConversationPageQuery($conversationId: UUID!) {
  conversation: viewerConversationById(conversationId: $conversationId) {
    ...ConversationThreadFragment
  }
}
    fragment ConversationThreadFragment on Conversations {
  conversationId
  conversationSubject
  conversationStatus
  organizationId
  agencyId
  messages: conversationMessagesCollection(
    first: 250
    orderBy: [{messageCreatedAt: AscNullsLast}]
  ) {
    edges {
      node {
        conversationMessageId
        messageBody
        messageDirection
        messageAuthor
        messageChannel
        messagePriority
        messageCreatedAt
        messageReadAt
      }
    }
  }
}`) as unknown as TypedDocumentString<AgencyInboxConversationPageQueryQuery, AgencyInboxConversationPageQueryQueryVariables>;
export const AgencyOverviewPageQueryDocument = new TypedDocumentString(`
    query AgencyOverviewPageQuery($agencyId: Int!) {
  activeMemberships: viewerAgencyMemberships(
    agencyId: $agencyId
    filter: {agencyMembershipAcceptedAt: {is: NOT_NULL}, agencyMembershipRevokedAt: {is: NULL}, agencyMembershipRejectedAt: {is: NULL}}
  ) {
    totalCount
  }
  pendingMemberships: viewerAgencyMemberships(
    agencyId: $agencyId
    filter: {agencyMembershipAcceptedAt: {is: NULL}, agencyMembershipRevokedAt: {is: NULL}, agencyMembershipRejectedAt: {is: NULL}}
  ) {
    totalCount
  }
  grants: permissionGrantsCollection(
    filter: {subjectAgencyId: {eq: $agencyId}}
    first: 250
  ) {
    edges {
      node {
        objectOrganizationId
        permissionId
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AgencyOverviewPageQueryQuery, AgencyOverviewPageQueryQueryVariables>;
export const AgencyCreateMutationDocument = new TypedDocumentString(`
    mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {
  agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {
    agencyId
  }
}
    `) as unknown as TypedDocumentString<AgencyCreateMutationMutation, AgencyCreateMutationMutationVariables>;
export const DangerPageQueryDocument = new TypedDocumentString(`
    query DangerPageQuery {
  organizations: viewerOrganizationsCollection(
    filter: {organizationDeletedAt: {is: NULL}}
  ) {
    edges {
      node {
        organizationId
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DangerPageQueryQuery, DangerPageQueryQueryVariables>;
export const ProfileContactsManageQueryDocument = new TypedDocumentString(`
    query ProfileContactsManageQuery($orderBy: [ProfileContactsOrderBy!] = [{profileContactCreatedAt: AscNullsLast}]) {
  profileContactsCollection(orderBy: $orderBy) {
    edges {
      node {
        profileContactId
        messageChannel
        contactValue
        contactVerifiedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ProfileContactsManageQueryQuery, ProfileContactsManageQueryQueryVariables>;
export const ProfileContactsManageInsertMutationDocument = new TypedDocumentString(`
    mutation ProfileContactsManageInsertMutation($objects: [ProfileContactsInsertInput!]!) {
  insertIntoProfileContactsCollection(objects: $objects) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<ProfileContactsManageInsertMutationMutation, ProfileContactsManageInsertMutationMutationVariables>;
export const ProfileContactsManageDeleteMutationDocument = new TypedDocumentString(`
    mutation ProfileContactsManageDeleteMutation($filter: ProfileContactsFilter!, $atMost: Int! = 1) {
  deleteFromProfileContactsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<ProfileContactsManageDeleteMutationMutation, ProfileContactsManageDeleteMutationMutationVariables>;
export const AccountProfilePageQueryDocument = new TypedDocumentString(`
    query AccountProfilePageQuery {
  profile: viewerProfile {
    profileNameFull
    avatar: storage_profiles(
      filter: {folder: {eq: "avatar"}}
      orderBy: [{createdAt: DescNullsLast}]
      first: 1
    ) {
      edges {
        node {
          src
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AccountProfilePageQueryQuery, AccountProfilePageQueryQueryVariables>;
export const ProfileSectionUpdateNameMutationDocument = new TypedDocumentString(`
    mutation ProfileSectionUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {
  updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<ProfileSectionUpdateNameMutationMutation, ProfileSectionUpdateNameMutationMutationVariables>;
export const SessionsSectionPageQueryDocument = new TypedDocumentString(`
    query SessionsSectionPageQuery {
  sessions: viewerSessionsCollection {
    edges {
      node {
        ...SessionsSectionSessionFragment
      }
    }
  }
}
    fragment SessionsSectionSessionFragment on UserSessions {
  id
  userAgent
  ip
  createdAt
  refreshedAt
  notAfter
}`) as unknown as TypedDocumentString<SessionsSectionPageQueryQuery, SessionsSectionPageQueryQueryVariables>;
export const HomeInboxConversationPageQueryDocument = new TypedDocumentString(`
    query HomeInboxConversationPageQuery($conversationId: UUID!) {
  conversation: viewerConversationById(conversationId: $conversationId) {
    ...ConversationThreadFragment
  }
}
    fragment ConversationThreadFragment on Conversations {
  conversationId
  conversationSubject
  conversationStatus
  organizationId
  agencyId
  messages: conversationMessagesCollection(
    first: 250
    orderBy: [{messageCreatedAt: AscNullsLast}]
  ) {
    edges {
      node {
        conversationMessageId
        messageBody
        messageDirection
        messageAuthor
        messageChannel
        messagePriority
        messageCreatedAt
        messageReadAt
      }
    }
  }
}`) as unknown as TypedDocumentString<HomeInboxConversationPageQueryQuery, HomeInboxConversationPageQueryQueryVariables>;
export const HomePickerPageQueryDocument = new TypedDocumentString(`
    query HomePickerPageQuery {
  organizations: viewerOrganizationsCollection(
    filter: {organizationDeletedAt: {is: NULL}}
    orderBy: [{organizationName: AscNullsLast}]
  ) {
    edges {
      node {
        organizationId
        organizationName
        organizationSlug
        tenant {
          tenantId
          tenantSlug
          tenantName
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<HomePickerPageQueryQuery, HomePickerPageQueryQueryVariables>;
export const OrgInboxConversationPageQueryDocument = new TypedDocumentString(`
    query OrgInboxConversationPageQuery($conversationId: UUID!) {
  conversation: viewerConversationById(conversationId: $conversationId) {
    ...ConversationThreadFragment
  }
}
    fragment ConversationThreadFragment on Conversations {
  conversationId
  conversationSubject
  conversationStatus
  organizationId
  agencyId
  messages: conversationMessagesCollection(
    first: 250
    orderBy: [{messageCreatedAt: AscNullsLast}]
  ) {
    edges {
      node {
        conversationMessageId
        messageBody
        messageDirection
        messageAuthor
        messageChannel
        messagePriority
        messageCreatedAt
        messageReadAt
      }
    }
  }
}`) as unknown as TypedDocumentString<OrgInboxConversationPageQueryQuery, OrgInboxConversationPageQueryQueryVariables>;
export const FinishTenantOnboardingMutationDocument = new TypedDocumentString(`
    mutation FinishTenantOnboardingMutation($tenant_id: Int!) {
  tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {
    tenantId
    tenantOnboardedAt
  }
}
    `) as unknown as TypedDocumentString<FinishTenantOnboardingMutationMutation, FinishTenantOnboardingMutationMutationVariables>;
export const TenantOnboardingStateGetDocument = new TypedDocumentString(`
    query TenantOnboardingStateGet($tenant_id: Int!) {
  tenant: viewerTenantById(tenantId: $tenant_id) {
    tenantOnboardedAt
    logo: storage_tenants(filter: {folder: {eq: "avatar"}}, first: 1) {
      edges {
        node {
          storageTenantId
        }
      }
    }
    organizations: organizationsCollection {
      edges {
        node {
          memberships: organizationMembershipsCollection {
            totalCount
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<TenantOnboardingStateGetQuery, TenantOnboardingStateGetQueryVariables>;
export const CreateOrganizationFormMutationDocument = new TypedDocumentString(`
    mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {
  organization: viewerOrganizationCreate(
    organizationName: $organization_name
    organizationSlug: $organization_slug
    tenantId: $tenant_id
  ) {
    organizationId
    organizationSlug
  }
}
    `) as unknown as TypedDocumentString<CreateOrganizationFormMutationMutation, CreateOrganizationFormMutationMutationVariables>;
export const ExternalAccessGrantMutationDocument = new TypedDocumentString(`
    mutation ExternalAccessGrantMutation($organization_id: Int!, $agency_id: Int!) {
  grant: viewerGrantAgencyAccess(
    organizationId: $organization_id
    agencyId: $agency_id
  ) {
    permissionGrantId
  }
}
    `) as unknown as TypedDocumentString<ExternalAccessGrantMutationMutation, ExternalAccessGrantMutationMutationVariables>;
export const ExternalAccessRevokeMutationDocument = new TypedDocumentString(`
    mutation ExternalAccessRevokeMutation($organization_id: Int!, $agency_id: Int!) {
  revoke: viewerRevokeAgencyAccess(
    organizationId: $organization_id
    agencyId: $agency_id
  ) {
    permissionGrantId
  }
}
    `) as unknown as TypedDocumentString<ExternalAccessRevokeMutationMutation, ExternalAccessRevokeMutationMutationVariables>;
export const EditOrganizationMembershipGrantPermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipGrantPermissionMutation($objects: [PermissionGrantsInsertInput!]!) {
  insertIntoPermissionGrantsCollection(objects: $objects) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipGrantPermissionMutationMutation, EditOrganizationMembershipGrantPermissionMutationMutationVariables>;
export const EditOrganizationMembershipRevokePermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokePermissionMutation($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
  deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipRevokePermissionMutationMutation, EditOrganizationMembershipRevokePermissionMutationMutationVariables>;
export const EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
  updateOrganizationMembershipsCollection(
    filter: $filter
    set: $set
    atMost: $atMost
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation, EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables>;
export const EditOrganizationMembershipSetPermissionsMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipSetPermissionsMutation($organizationMembershipId: Int!, $permissionIds: [String]!) {
  viewerOrganizationMembershipSetPermissionsCollection(
    organizationMembershipId: $organizationMembershipId
    permissionIds: $permissionIds
  ) {
    edges {
      node {
        permissionId
      }
    }
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipSetPermissionsMutationMutation, EditOrganizationMembershipSetPermissionsMutationMutationVariables>;
export const OrganizationMembershipEditPageQueryDocument = new TypedDocumentString(`
    query OrganizationMembershipEditPageQuery($organizationId: Int!, $organizationMembershipId: Int!, $presetsFilter: PermissionPresetsFilter, $permissionsOrderBy: [PermissionsOrderBy!] = [{permissionId: AscNullsLast}], $presetsOrderBy: [PermissionPresetsOrderBy!] = [{permissionPresetId: AscNullsLast}], $first: Int = 250) {
  organization: viewerOrganizationById(organizationId: $organizationId) {
    ...ViewerOrganizationGetFragment
  }
  canManage: viewerHasPermission(
    organizationId: $organizationId
    permissionId: "members_manage"
  )
  membership: viewerOrganizationMembershipById(
    organizationMembershipId: $organizationMembershipId
  ) {
    organizationMembershipId
    profileId
    organizationMembershipLabel
    organizationMembershipEmail
    organizationMembershipInviteEmail
    organizationMembershipInvitePhone
    organizationMembershipInviteAddressLevel0Id
    organizationMembershipInviteDocumentKind
    organizationMembershipInviteDocumentValue
    organizationMembershipAcceptedAt
    organizationMembershipRevokedAt
    organizationMembershipRejectedAt
    profile {
      profileNameFull
    }
    permissionGrantsCollection(first: 250) {
      edges {
        node {
          permissionId
        }
      }
    }
  }
  permissions: permissionsCollection(first: $first, orderBy: $permissionsOrderBy) {
    edges {
      node {
        ...EditPermissionsFormPermissionFragment
      }
    }
  }
  presets: permissionPresetsCollection(
    first: $first
    filter: $presetsFilter
    orderBy: $presetsOrderBy
  ) {
    edges {
      node {
        ...EditPermissionsFormPresetFragment
      }
    }
  }
}
    fragment EditPermissionsFormPermissionFragment on Permissions {
  permissionId
  permissionDescription
}
fragment EditPermissionsFormPresetFragment on PermissionPresets {
  permissionPresetId
  permissionPresetName
  permissionPresetSlugs
  organizationId
}
fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<OrganizationMembershipEditPageQueryQuery, OrganizationMembershipEditPageQueryQueryVariables>;
export const MembersAdminPageQueryDocument = new TypedDocumentString(`
    query MembersAdminPageQuery($filter: OrganizationMembershipsFilter, $orderBy: [OrganizationMembershipsOrderBy!] = [{organizationMembershipCreatedAt: AscNullsLast}], $first: Int = 250) {
  memberships: organizationMembershipsCollection(
    first: $first
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        organizationMembershipId
        profileId
        organizationMembershipInviteEmail
        organizationMembershipInvitePhone
        organizationMembershipInviteAddressLevel0Id
        organizationMembershipInviteDocumentKind
        organizationMembershipInviteDocumentValue
        organizationMembershipInviteExpiresAt
        organizationMembershipAcceptedAt
        organizationMembershipCreatedAt
        profile {
          profileNameFull
        }
        permissionGrantsCollection(first: 250) {
          edges {
            node {
              permissionId
            }
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MembersAdminPageQueryQuery, MembersAdminPageQueryQueryVariables>;
export const MembersPendingInvitationsCancelMutationDocument = new TypedDocumentString(`
    mutation MembersPendingInvitationsCancelMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
  updateOrganizationMembershipsCollection(
    filter: $filter
    set: $set
    atMost: $atMost
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<MembersPendingInvitationsCancelMutationMutation, MembersPendingInvitationsCancelMutationMutationVariables>;
export const UpdateTenantNameMutationDocument = new TypedDocumentString(`
    mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {
  tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {
    tenantId
    tenantName
  }
}
    `) as unknown as TypedDocumentString<UpdateTenantNameMutationMutation, UpdateTenantNameMutationMutationVariables>;
export const CheckTenantPermissionDocument = new TypedDocumentString(`
    query CheckTenantPermission($tenantId: Int!, $permissionId: String!) {
  viewerHasTenantPermission(tenantId: $tenantId, permissionId: $permissionId)
}
    `) as unknown as TypedDocumentString<CheckTenantPermissionQuery, CheckTenantPermissionQueryVariables>;
export const InsertSsoProviderDocument = new TypedDocumentString(`
    mutation InsertSsoProvider($tenantId: Int!, $ssoProviderId: String!, $label: String!, $domains: [String]!, $enabled: Boolean!) {
  insertIntoTenantSsoProvidersCollection(
    objects: [{tenantId: $tenantId, ssoProviderId: $ssoProviderId, ssoProviderLabel: $label, ssoProviderDomains: $domains, ssoProviderEnabled: $enabled}]
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<InsertSsoProviderMutation, InsertSsoProviderMutationVariables>;
export const DeleteSsoProviderDocument = new TypedDocumentString(`
    mutation DeleteSsoProvider($tenantId: Int!, $ssoProviderId: String!) {
  deleteFromTenantSsoProvidersCollection(
    filter: {tenantId: {eq: $tenantId}, ssoProviderId: {eq: $ssoProviderId}}
    atMost: 1
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<DeleteSsoProviderMutation, DeleteSsoProviderMutationVariables>;
export const TenantSsoPageQueryDocument = new TypedDocumentString(`
    query TenantSsoPageQuery($tenantId: Int!) {
  tenantSsoProvidersCollection(
    filter: {tenantId: {eq: $tenantId}}
    orderBy: [{ssoProviderCreatedAt: AscNullsLast}]
  ) {
    edges {
      node {
        ssoProviderId
        ssoProviderLabel
        ssoProviderDomains
        ssoProviderEnabled
      }
    }
  }
}
    `) as unknown as TypedDocumentString<TenantSsoPageQueryQuery, TenantSsoPageQueryQueryVariables>;
export const CreateTenantFormMutationDocument = new TypedDocumentString(`
    mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {
  tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {
    tenantId
  }
}
    `) as unknown as TypedDocumentString<CreateTenantFormMutationMutation, CreateTenantFormMutationMutationVariables>;
export const CheckEmailQueryDocument = new TypedDocumentString(`
    query CheckEmailQuery($email: String!) {
  emailDomainHasSso(emailInput: $email)
  emailExists(emailToCheck: $email)
  emailHasPassword(emailToCheck: $email)
}
    `) as unknown as TypedDocumentString<CheckEmailQueryQuery, CheckEmailQueryQueryVariables>;
export const OnboardingProfileFormUpdateNameMutationDocument = new TypedDocumentString(`
    mutation OnboardingProfileFormUpdateNameMutation($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {
  updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<OnboardingProfileFormUpdateNameMutationMutation, OnboardingProfileFormUpdateNameMutationMutationVariables>;
export const ViewerOnboardingStateGetDocument = new TypedDocumentString(`
    query ViewerOnboardingStateGet($email: String!) {
  emailHasPassword(emailToCheck: $email)
  profile: viewerProfile {
    profileNameFull
    profileOnboardedAt
    identity: profileIdentity {
      profileIdentityId
    }
    avatar: profileStorageAvatar {
      src
    }
  }
}
    `) as unknown as TypedDocumentString<ViewerOnboardingStateGetQuery, ViewerOnboardingStateGetQueryVariables>;
export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  healthCurrentTimestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const ScopeSelectorOrgsQueryDocument = new TypedDocumentString(`
    query ScopeSelectorOrgsQuery {
  viewerOrganizationsCollection(
    filter: {organizationDeletedAt: {is: NULL}}
    orderBy: [{organizationName: AscNullsLast}]
  ) {
    edges {
      node {
        organizationId
        organizationName
        tenant {
          tenantSlug
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ScopeSelectorOrgsQueryQuery, ScopeSelectorOrgsQueryQueryVariables>;
export const ScopeSelectorAgenciesQueryDocument = new TypedDocumentString(`
    query ScopeSelectorAgenciesQuery {
  agencies: viewerAgenciesCollection(orderBy: [{agencyName: AscNullsLast}]) {
    edges {
      node {
        agencyId
        agencySlug
        agencyName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ScopeSelectorAgenciesQueryQuery, ScopeSelectorAgenciesQueryQueryVariables>;
export const PostHogIdentifyDocument = new TypedDocumentString(`
    query PostHogIdentify {
  profile: viewerProfile {
    profileId
    profileNameFull
    profileOnboardedAt
    profileCreatedAt
  }
  tenants: viewerTenantsCollection {
    edges {
      node {
        tenantId
        tenantSlug
        tenantTier
        tenantCreatedAt
      }
    }
  }
  organizations: viewerOrganizationsCollection {
    edges {
      node {
        organizationId
        organizationName
        tenantId
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostHogIdentifyQuery, PostHogIdentifyQueryVariables>;
export const CountriesGetDocument = new TypedDocumentString(`
    query CountriesGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: AddressesLevel0Filter, $orderBy: [AddressesLevel0OrderBy!]) {
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
    fragment CountryGetFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}`) as unknown as TypedDocumentString<CountriesGetQuery, CountriesGetQueryVariables>;
export const ViewerAgenciesGetDocument = new TypedDocumentString(`
    query ViewerAgenciesGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: AgenciesFilter, $orderBy: [AgenciesOrderBy!]) {
  agencies: viewerAgenciesCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerAgencyGetFragment
      }
    }
  }
}
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
  agencyDeletedAt
}`) as unknown as TypedDocumentString<ViewerAgenciesGetQuery, ViewerAgenciesGetQueryVariables>;
export const ViewerAgencyByIdGetDocument = new TypedDocumentString(`
    query ViewerAgencyByIdGet($agencyId: Int!) {
  agency: viewerAgencyById(agencyId: $agencyId) {
    ...ViewerAgencyGetFragment
  }
}
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
  agencyDeletedAt
}`) as unknown as TypedDocumentString<ViewerAgencyByIdGetQuery, ViewerAgencyByIdGetQueryVariables>;
export const ViewerAgencyBySlugGetDocument = new TypedDocumentString(`
    query ViewerAgencyBySlugGet($agencySlug: String!) {
  agency: viewerAgencyBySlug(agencySlug: $agencySlug) {
    ...ViewerAgencyGetFragment
  }
}
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
  agencyDeletedAt
}`) as unknown as TypedDocumentString<ViewerAgencyBySlugGetQuery, ViewerAgencyBySlugGetQueryVariables>;
export const ViewerOrganizationsGetDocument = new TypedDocumentString(`
    query ViewerOrganizationsGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: OrganizationsFilter, $orderBy: [OrganizationsOrderBy!]) {
  organizations: viewerOrganizationsCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerOrganizationGetFragment
      }
    }
  }
}
    fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationsGetQuery, ViewerOrganizationsGetQueryVariables>;
export const ViewerOrganizationByIdQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationByIdQuery($organizationId: Int!) {
  organization: viewerOrganizationById(organizationId: $organizationId) {
    ...ViewerOrganizationGetFragment
  }
}
    fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationByIdQueryQuery, ViewerOrganizationByIdQueryQueryVariables>;
export const ViewerOrganizationBySlugQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationBySlugQuery($organizationSlug: String!) {
  organizations: viewerOrganizationsCollection(
    first: 1
    filter: {organizationSlug: {eq: $organizationSlug}}
  ) {
    edges {
      node {
        ...ViewerOrganizationGetFragment
      }
    }
  }
}
    fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationBySlugQueryQuery, ViewerOrganizationBySlugQueryQueryVariables>;
export const ViewerProfileGetDocument = new TypedDocumentString(`
    query ViewerProfileGet {
  profile: viewerProfile {
    ...ViewerProfileGetFragment
  }
}
    fragment ViewerProfileGetFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDeletedAt
  profileCreatedAt
  profileUpdatedAt
}`) as unknown as TypedDocumentString<ViewerProfileGetQuery, ViewerProfileGetQueryVariables>;
export const ViewerTenantsGetDocument = new TypedDocumentString(`
    query ViewerTenantsGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: TenantsFilter, $orderBy: [TenantsOrderBy!]) {
  tenants: viewerTenantsCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerTenantGetFragment
      }
    }
  }
}
    fragment ViewerTenantGetFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantsGetQuery, ViewerTenantsGetQueryVariables>;
export const ViewerTenantByIdGetDocument = new TypedDocumentString(`
    query ViewerTenantByIdGet($tenantId: Int!) {
  tenant: viewerTenantById(tenantId: $tenantId) {
    ...ViewerTenantGetFragment
  }
}
    fragment ViewerTenantGetFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantByIdGetQuery, ViewerTenantByIdGetQueryVariables>;
export const ViewerTenantBySlugGetDocument = new TypedDocumentString(`
    query ViewerTenantBySlugGet($tenantSlug: String!) {
  tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {
    ...ViewerTenantGetFragment
  }
}
    fragment ViewerTenantGetFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantBySlugGetQuery, ViewerTenantBySlugGetQueryVariables>;
export const CountriesUseDocument = new TypedDocumentString(`
    query CountriesUse($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: AddressesLevel0Filter, $orderBy: [AddressesLevel0OrderBy!]) {
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
        ...CountryHookUseFragment
      }
    }
  }
}
    fragment CountryHookUseFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}`) as unknown as TypedDocumentString<CountriesUseQuery, CountriesUseQueryVariables>;
export const ViewerAgenciesUseDocument = new TypedDocumentString(`
    query ViewerAgenciesUse($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: AgenciesFilter, $orderBy: [AgenciesOrderBy!]) {
  agencies: viewerAgenciesCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerAgencyUseFragment
      }
    }
  }
}
    fragment ViewerAgencyUseFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}`) as unknown as TypedDocumentString<ViewerAgenciesUseQuery, ViewerAgenciesUseQueryVariables>;
export const ViewerAgencyByIdUseDocument = new TypedDocumentString(`
    query ViewerAgencyByIdUse($agencyId: Int!) {
  agency: viewerAgencyById(agencyId: $agencyId) {
    ...ViewerAgencyUseFragment
  }
}
    fragment ViewerAgencyUseFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}`) as unknown as TypedDocumentString<ViewerAgencyByIdUseQuery, ViewerAgencyByIdUseQueryVariables>;
export const ViewerAgencyBySlugUseDocument = new TypedDocumentString(`
    query ViewerAgencyBySlugUse($agencySlug: String!) {
  agency: viewerAgencyBySlug(agencySlug: $agencySlug) {
    ...ViewerAgencyUseFragment
  }
}
    fragment ViewerAgencyUseFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}`) as unknown as TypedDocumentString<ViewerAgencyBySlugUseQuery, ViewerAgencyBySlugUseQueryVariables>;
export const ViewerOrganizationsUseDocument = new TypedDocumentString(`
    query ViewerOrganizationsUse($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: OrganizationsFilter, $orderBy: [OrganizationsOrderBy!]) {
  organizations: viewerOrganizationsCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerOrganizationUseFragment
      }
    }
  }
}
    fragment ViewerOrganizationUseFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationsUseQuery, ViewerOrganizationsUseQueryVariables>;
export const ViewerOrganizationByIdUseDocument = new TypedDocumentString(`
    query ViewerOrganizationByIdUse($organizationId: Int!) {
  organization: viewerOrganizationById(organizationId: $organizationId) {
    ...ViewerOrganizationUseFragment
  }
}
    fragment ViewerOrganizationUseFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationByIdUseQuery, ViewerOrganizationByIdUseQueryVariables>;
export const ViewerOrganizationBySlugUseDocument = new TypedDocumentString(`
    query ViewerOrganizationBySlugUse($organizationSlug: String!) {
  organizations: viewerOrganizationsCollection(
    first: 1
    filter: {organizationSlug: {eq: $organizationSlug}}
  ) {
    edges {
      node {
        ...ViewerOrganizationUseFragment
      }
    }
  }
}
    fragment ViewerOrganizationUseFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}`) as unknown as TypedDocumentString<ViewerOrganizationBySlugUseQuery, ViewerOrganizationBySlugUseQueryVariables>;
export const ViewerProfileUseDocument = new TypedDocumentString(`
    query ViewerProfileUse {
  profile: viewerProfile {
    ...ViewerProfileUseFragment
  }
}
    fragment ViewerProfileUseFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDeletedAt
  profileCreatedAt
  profileUpdatedAt
}`) as unknown as TypedDocumentString<ViewerProfileUseQuery, ViewerProfileUseQueryVariables>;
export const ViewerTenantsUseDocument = new TypedDocumentString(`
    query ViewerTenantsUse($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: TenantsFilter, $orderBy: [TenantsOrderBy!]) {
  tenants: viewerTenantsCollection(
    first: $first
    last: $last
    after: $after
    before: $before
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...ViewerTenantUseFragment
      }
    }
  }
}
    fragment ViewerTenantUseFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantsUseQuery, ViewerTenantsUseQueryVariables>;
export const ViewerTenantByIdUseDocument = new TypedDocumentString(`
    query ViewerTenantByIdUse($tenantId: Int!) {
  tenant: viewerTenantById(tenantId: $tenantId) {
    ...ViewerTenantUseFragment
  }
}
    fragment ViewerTenantUseFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantByIdUseQuery, ViewerTenantByIdUseQueryVariables>;
export const ViewerTenantBySlugUseDocument = new TypedDocumentString(`
    query ViewerTenantBySlugUse($tenantSlug: String!) {
  tenant: viewerTenantBySlug(tenantSlug: $tenantSlug) {
    ...ViewerTenantUseFragment
  }
}
    fragment ViewerTenantUseFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}`) as unknown as TypedDocumentString<ViewerTenantBySlugUseQuery, ViewerTenantBySlugUseQueryVariables>;
export const GrantAgencyOrgAccessMcpDocument = new TypedDocumentString(`
    mutation GrantAgencyOrgAccessMcp($objects: [PermissionGrantsInsertInput!]!) {
  insertIntoPermissionGrantsCollection(objects: $objects) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<GrantAgencyOrgAccessMcpMutation, GrantAgencyOrgAccessMcpMutationVariables>;
export const RevokeAgencyOrgAccessMcpDocument = new TypedDocumentString(`
    mutation RevokeAgencyOrgAccessMcp($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
  deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<RevokeAgencyOrgAccessMcpMutation, RevokeAgencyOrgAccessMcpMutationVariables>;
export const InviteAffiliateMcpDocument = new TypedDocumentString(`
    mutation InviteAffiliateMcp($agency_id: Int!, $email: String!) {
  membership: viewerAgencyMembershipInviteByEmail(
    agencyId: $agency_id
    email: $email
  ) {
    agencyMembershipId
  }
}
    `) as unknown as TypedDocumentString<InviteAffiliateMcpMutation, InviteAffiliateMcpMutationVariables>;
export const UpdateAffiliateMcpDocument = new TypedDocumentString(`
    mutation UpdateAffiliateMcp($agency_membership_id: Int!, $operation: String!) {
  membership: viewerAgencyMembershipUpdate(
    agencyMembershipId: $agency_membership_id
    operation: $operation
  ) {
    agencyMembershipId
  }
}
    `) as unknown as TypedDocumentString<UpdateAffiliateMcpMutation, UpdateAffiliateMcpMutationVariables>;
export const GrantAgencyMemberPermissionMcpDocument = new TypedDocumentString(`
    mutation GrantAgencyMemberPermissionMcp($objects: [PermissionGrantsInsertInput!]!) {
  insertIntoPermissionGrantsCollection(objects: $objects) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<GrantAgencyMemberPermissionMcpMutation, GrantAgencyMemberPermissionMcpMutationVariables>;
export const RevokeAgencyMemberPermissionMcpDocument = new TypedDocumentString(`
    mutation RevokeAgencyMemberPermissionMcp($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
  deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<RevokeAgencyMemberPermissionMcpMutation, RevokeAgencyMemberPermissionMcpMutationVariables>;
export const GrantMemberPermissionMcpDocument = new TypedDocumentString(`
    mutation GrantMemberPermissionMcp($objects: [PermissionGrantsInsertInput!]!) {
  insertIntoPermissionGrantsCollection(objects: $objects) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<GrantMemberPermissionMcpMutation, GrantMemberPermissionMcpMutationVariables>;
export const RevokeMemberPermissionMcpDocument = new TypedDocumentString(`
    mutation RevokeMemberPermissionMcp($filter: PermissionGrantsFilter!, $atMost: Int! = 1000) {
  deleteFromPermissionGrantsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<RevokeMemberPermissionMcpMutation, RevokeMemberPermissionMcpMutationVariables>;
export const SetMemberPermissionsMcpDocument = new TypedDocumentString(`
    mutation SetMemberPermissionsMcp($organization_membership_id: Int!, $permission_ids: [String]!) {
  result: viewerOrganizationMembershipSetPermissionsCollection(
    organizationMembershipId: $organization_membership_id
    permissionIds: $permission_ids
  ) {
    edges {
      node {
        permissionId
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SetMemberPermissionsMcpMutation, SetMemberPermissionsMcpMutationVariables>;
export const UpdateMemberStatusMcpDocument = new TypedDocumentString(`
    mutation UpdateMemberStatusMcp($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
  updateOrganizationMembershipsCollection(
    filter: $filter
    set: $set
    atMost: $atMost
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<UpdateMemberStatusMcpMutation, UpdateMemberStatusMcpMutationVariables>;
export const CreatePresetMcpDocument = new TypedDocumentString(`
    mutation CreatePresetMcp($objects: [PermissionPresetsInsertInput!]!) {
  insertIntoPermissionPresetsCollection(objects: $objects) {
    records {
      permissionPresetId
    }
  }
}
    `) as unknown as TypedDocumentString<CreatePresetMcpMutation, CreatePresetMcpMutationVariables>;
export const UpdatePresetMcpDocument = new TypedDocumentString(`
    mutation UpdatePresetMcp($filter: PermissionPresetsFilter!, $set: PermissionPresetsUpdateInput!, $atMost: Int! = 1000) {
  updatePermissionPresetsCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<UpdatePresetMcpMutation, UpdatePresetMcpMutationVariables>;
export const DeletePresetMcpDocument = new TypedDocumentString(`
    mutation DeletePresetMcp($filter: PermissionPresetsFilter!, $atMost: Int! = 1000) {
  deleteFromPermissionPresetsCollection(filter: $filter, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<DeletePresetMcpMutation, DeletePresetMcpMutationVariables>;
export const UpdateProfileMcpDocument = new TypedDocumentString(`
    mutation UpdateProfileMcp($filter: ProfilesFilter!, $set: ProfilesUpdateInput!, $atMost: Int! = 1000) {
  updateProfilesCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<UpdateProfileMcpMutation, UpdateProfileMcpMutationVariables>;
export const UpdateTenantMcpDocument = new TypedDocumentString(`
    mutation UpdateTenantMcp($filter: TenantsFilter!, $set: TenantsUpdateInput!, $atMost: Int! = 1000) {
  updateTenantsCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
    records {
      tenantName
      tenantOnboardedAt
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateTenantMcpMutation, UpdateTenantMcpMutationVariables>;
export const UpdateOrganizationMcpDocument = new TypedDocumentString(`
    mutation UpdateOrganizationMcp($filter: OrganizationsFilter!, $set: OrganizationsUpdateInput!, $atMost: Int! = 1000) {
  updateOrganizationsCollection(filter: $filter, set: $set, atMost: $atMost) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<UpdateOrganizationMcpMutation, UpdateOrganizationMcpMutationVariables>;
export const ListTenantsMcpDocument = new TypedDocumentString(`
    query ListTenantsMcp {
  tenants: viewerTenantsCollection(orderBy: [{tenantName: AscNullsLast}]) {
    edges {
      node {
        tenantId
        tenantSlug
        tenantName
        tenantTier
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ListTenantsMcpQuery, ListTenantsMcpQueryVariables>;
export const ListOrganizationsMcpDocument = new TypedDocumentString(`
    query ListOrganizationsMcp {
  organizations: viewerOrganizationsCollection(
    orderBy: [{organizationName: AscNullsLast}]
  ) {
    edges {
      node {
        organizationId
        tenantId
        organizationSlug
        organizationName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ListOrganizationsMcpQuery, ListOrganizationsMcpQueryVariables>;
export const WhoamiMcpDocument = new TypedDocumentString(`
    query WhoamiMcp {
  profile: viewerProfile {
    profileId
    profileNameFull
    profileOnboardedAt
    profileDeletedAt
    profileCreatedAt
    profileUpdatedAt
  }
}
    `) as unknown as TypedDocumentString<WhoamiMcpQuery, WhoamiMcpQueryVariables>;