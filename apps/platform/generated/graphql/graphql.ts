/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
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

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: string | null | undefined;
  in?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: string | null | undefined;
};

export type OrganizationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<OrganizationsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: OrganizationsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<OrganizationsFilter> | null | undefined;
  organization_created_at?: DatetimeFilter | null | undefined;
  organization_disabled_at?: DatetimeFilter | null | undefined;
  organization_id?: IntFilter | null | undefined;
  organization_name?: StringFilter | null | undefined;
  organization_slug?: StringFilter | null | undefined;
  organization_updated_at?: DatetimeFilter | null | undefined;
  tenant_id?: IntFilter | null | undefined;
};

export type OrganizationsOrderBy = {
  organization_created_at?: OrderByDirection | null | undefined;
  organization_disabled_at?: OrderByDirection | null | undefined;
  organization_id?: OrderByDirection | null | undefined;
  organization_name?: OrderByDirection | null | undefined;
  organization_slug?: OrderByDirection | null | undefined;
  organization_updated_at?: OrderByDirection | null | undefined;
  tenant_id?: OrderByDirection | null | undefined;
};

export type Profile_Webauthn_ChallengesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<Profile_Webauthn_ChallengesFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: Profile_Webauthn_ChallengesFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<Profile_Webauthn_ChallengesFilter> | null | undefined;
  profile_id?: UuidFilter | null | undefined;
  webauthn_challenge_created_at?: DatetimeFilter | null | undefined;
  webauthn_challenge_id?: UuidFilter | null | undefined;
  webauthn_challenge_value?: StringFilter | null | undefined;
};

export type Profile_Webauthn_ChallengesInsertInput = {
  profile_id?: string | null | undefined;
  webauthn_challenge_created_at?: string | null | undefined;
  webauthn_challenge_id?: string | null | undefined;
  webauthn_challenge_value?: string | null | undefined;
};

export type Profile_Webauthn_ChallengesOrderBy = {
  profile_id?: OrderByDirection | null | undefined;
  webauthn_challenge_created_at?: OrderByDirection | null | undefined;
  webauthn_challenge_id?: OrderByDirection | null | undefined;
  webauthn_challenge_value?: OrderByDirection | null | undefined;
};

export type Profile_Webauthn_CredentialsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<Profile_Webauthn_CredentialsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: Profile_Webauthn_CredentialsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<Profile_Webauthn_CredentialsFilter> | null | undefined;
  profile_id?: UuidFilter | null | undefined;
  webauthn_credential_aaguid?: StringFilter | null | undefined;
  webauthn_credential_backup_state?: StringFilter | null | undefined;
  webauthn_credential_created_at?: DatetimeFilter | null | undefined;
  webauthn_credential_device_type?: StringFilter | null | undefined;
  webauthn_credential_external_id?: StringFilter | null | undefined;
  webauthn_credential_friendly_name?: StringFilter | null | undefined;
  webauthn_credential_id?: UuidFilter | null | undefined;
  webauthn_credential_last_used_at?: DatetimeFilter | null | undefined;
  webauthn_credential_public_key?: StringFilter | null | undefined;
  webauthn_credential_sign_count?: IntFilter | null | undefined;
  webauthn_credential_transports?: StringListFilter | null | undefined;
  webauthn_credential_type?: StringFilter | null | undefined;
  webauthn_credential_updated_at?: DatetimeFilter | null | undefined;
  webauthn_credential_user_verification_status?: StringFilter | null | undefined;
};

export type Profile_Webauthn_CredentialsInsertInput = {
  profile_id?: string | null | undefined;
  webauthn_credential_aaguid?: string | null | undefined;
  webauthn_credential_backup_state?: string | null | undefined;
  webauthn_credential_created_at?: string | null | undefined;
  webauthn_credential_device_type?: string | null | undefined;
  webauthn_credential_external_id?: string | null | undefined;
  webauthn_credential_friendly_name?: string | null | undefined;
  webauthn_credential_id?: string | null | undefined;
  webauthn_credential_last_used_at?: string | null | undefined;
  webauthn_credential_public_key?: string | null | undefined;
  webauthn_credential_sign_count?: number | null | undefined;
  webauthn_credential_transports?: Array<string | null | undefined> | null | undefined;
  webauthn_credential_type?: string | null | undefined;
  webauthn_credential_updated_at?: string | null | undefined;
  webauthn_credential_user_verification_status?: string | null | undefined;
};

export type Profile_Webauthn_CredentialsOrderBy = {
  profile_id?: OrderByDirection | null | undefined;
  webauthn_credential_aaguid?: OrderByDirection | null | undefined;
  webauthn_credential_backup_state?: OrderByDirection | null | undefined;
  webauthn_credential_created_at?: OrderByDirection | null | undefined;
  webauthn_credential_device_type?: OrderByDirection | null | undefined;
  webauthn_credential_external_id?: OrderByDirection | null | undefined;
  webauthn_credential_friendly_name?: OrderByDirection | null | undefined;
  webauthn_credential_id?: OrderByDirection | null | undefined;
  webauthn_credential_last_used_at?: OrderByDirection | null | undefined;
  webauthn_credential_public_key?: OrderByDirection | null | undefined;
  webauthn_credential_sign_count?: OrderByDirection | null | undefined;
  webauthn_credential_type?: OrderByDirection | null | undefined;
  webauthn_credential_updated_at?: OrderByDirection | null | undefined;
  webauthn_credential_user_verification_status?: OrderByDirection | null | undefined;
};

export type Profile_Webauthn_CredentialsUpdateInput = {
  profile_id?: string | null | undefined;
  webauthn_credential_aaguid?: string | null | undefined;
  webauthn_credential_backup_state?: string | null | undefined;
  webauthn_credential_created_at?: string | null | undefined;
  webauthn_credential_device_type?: string | null | undefined;
  webauthn_credential_external_id?: string | null | undefined;
  webauthn_credential_friendly_name?: string | null | undefined;
  webauthn_credential_id?: string | null | undefined;
  webauthn_credential_last_used_at?: string | null | undefined;
  webauthn_credential_public_key?: string | null | undefined;
  webauthn_credential_sign_count?: number | null | undefined;
  webauthn_credential_transports?: Array<string | null | undefined> | null | undefined;
  webauthn_credential_type?: string | null | undefined;
  webauthn_credential_updated_at?: string | null | undefined;
  webauthn_credential_user_verification_status?: string | null | undefined;
};

export enum Tenant_Tier {
  Enterprise = 'enterprise',
  Free = 'free',
  Pro = 'pro'
}

/** Boolean expression comparing fields on type "tenant_tier" */
export type Tenant_TierFilter = {
  eq?: Tenant_Tier | null | undefined;
  in?: Array<Tenant_Tier> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: Tenant_Tier | null | undefined;
};

export type TenantsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<TenantsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: TenantsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<TenantsFilter> | null | undefined;
  tenant_created_at?: DatetimeFilter | null | undefined;
  tenant_disabled_at?: DatetimeFilter | null | undefined;
  tenant_id?: IntFilter | null | undefined;
  tenant_name?: StringFilter | null | undefined;
  tenant_slug?: StringFilter | null | undefined;
  tenant_tier?: Tenant_TierFilter | null | undefined;
  tenant_updated_at?: DatetimeFilter | null | undefined;
};

export type TenantsOrderBy = {
  tenant_created_at?: OrderByDirection | null | undefined;
  tenant_disabled_at?: OrderByDirection | null | undefined;
  tenant_id?: OrderByDirection | null | undefined;
  tenant_name?: OrderByDirection | null | undefined;
  tenant_slug?: OrderByDirection | null | undefined;
  tenant_tier?: OrderByDirection | null | undefined;
  tenant_updated_at?: OrderByDirection | null | undefined;
};

export type OnboardingProfileFormUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;


export type OnboardingProfileFormUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

export type ProfileSectionPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileSectionPageQueryQuery = { profile: { profile_id: string, profile_name_full: string | null } | null };

export type ProfileSectionUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;


export type ProfileSectionUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

export type SecuritySectionPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SecuritySectionPageQueryQuery = { profile: { profile_id: string, profile_webauthn_credentialsCollection: { edges: Array<{ node: { webauthn_credential_id: string, webauthn_credential_friendly_name: string | null, webauthn_credential_device_type: string, webauthn_credential_backup_state: string, webauthn_credential_created_at: string, webauthn_credential_last_used_at: string | null } }> } | null } | null };

export type SecurityPasskeysListDeleteMutationMutationVariables = Exact<{
  webauthn_credential_id: string;
}>;


export type SecurityPasskeysListDeleteMutationMutation = { deleteFromprofile_webauthn_credentialsCollection: { affectedCount: number } };

export type HomePickerPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HomePickerPageQueryQuery = { viewer_organizations: { edges: Array<{ node: { organization_id: number, organization_name: string, organization_slug: string, tenants: { tenant_id: number, tenant_slug: string, tenant_name: string } | null } }> } | null };

export type EditOrganizationMembershipGrantPermissionMutationMutationVariables = Exact<{
  organization_membership_id: number;
  permission_id: string;
}>;


export type EditOrganizationMembershipGrantPermissionMutationMutation = { insertIntoorganization_membership_permissionsCollection: { affectedCount: number } | null };

export type EditOrganizationMembershipRevokePermissionMutationMutationVariables = Exact<{
  organization_membership_id: number;
  permission_id: string;
}>;


export type EditOrganizationMembershipRevokePermissionMutationMutation = { deleteFromorganization_membership_permissionsCollection: { affectedCount: number } };

export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables = Exact<{
  organization_membership_id: number;
  now: string;
}>;


export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation = { updateorganization_membershipsCollection: { affectedCount: number } };

export type MembersPendingInvitationsCancelMutationMutationVariables = Exact<{
  organization_membership_id: number;
  now: string;
}>;


export type MembersPendingInvitationsCancelMutationMutation = { updateorganization_membershipsCollection: { affectedCount: number } };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { health_current_timestamp: string | null };

export type CountryGetFragmentFragment = { address_level0_id: string, address_level0_name: string, address_level0_emoji: string | null };

export type CountriesGetQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CountriesGetQueryQuery = { addresses_level0: { edges: Array<{ node: { address_level0_id: string, address_level0_name: string, address_level0_emoji: string | null } }> } | null };

export type ViewerOrganizationGetFragmentFragment = { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string };

export type ViewerOrganizationsGetQueryQueryVariables = Exact<{
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;


export type ViewerOrganizationsGetQueryQuery = { organizations: { edges: Array<{ node: { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string } }> } | null };

export type ViewerOrganizationByIdGetQueryQueryVariables = Exact<{
  organization_id: number;
}>;


export type ViewerOrganizationByIdGetQueryQuery = { organization: { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string } | null };

export type ViewerProfileGetFragmentFragment = { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string };

export type ViewerProfileGetQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerProfileGetQueryQuery = { profile: { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string } | null };

export type ViewerTenantGetFragmentFragment = { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier };

export type ViewerTenantsGetQueryQueryVariables = Exact<{
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;


export type ViewerTenantsGetQueryQuery = { tenants: { edges: Array<{ node: { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier } }> } | null };

export type ViewerTenantBySlugGetQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;


export type ViewerTenantBySlugGetQueryQuery = { tenant: { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier } | null };

export type CountryHookFragmentFragment = { address_level0_id: string, address_level0_name: string, address_level0_emoji: string | null };

export type CountriesHookQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CountriesHookQueryQuery = { addresses_level0: { edges: Array<{ node: { address_level0_id: string, address_level0_name: string, address_level0_emoji: string | null } }> } | null };

export type ViewerOrganizationHookFragmentFragment = { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string };

export type ViewerOrganizationsHookQueryQueryVariables = Exact<{
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;


export type ViewerOrganizationsHookQueryQuery = { organizations: { edges: Array<{ node: { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string } }> } | null };

export type ViewerOrganizationByIdHookQueryQueryVariables = Exact<{
  organization_id: number;
}>;


export type ViewerOrganizationByIdHookQueryQuery = { organization: { organization_id: number, tenant_id: number, organization_slug: string, organization_name: string } | null };

export type ViewerProfileHookFragmentFragment = { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string };

export type ViewerProfileHookQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerProfileHookQueryQuery = { profile: { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string } | null };

export type ViewerTenantHookFragmentFragment = { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier };

export type ViewerTenantsHookQueryQueryVariables = Exact<{
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;


export type ViewerTenantsHookQueryQuery = { tenants: { edges: Array<{ node: { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier } }> } | null };

export type ViewerTenantBySlugHookQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;


export type ViewerTenantBySlugHookQueryQuery = { tenant: { tenant_id: number, tenant_slug: string, tenant_name: string, tenant_tier: Tenant_Tier } | null };

export type PasskeyCredentialFragmentFragment = { profile_id: string, webauthn_credential_external_id: string, webauthn_credential_type: string, webauthn_credential_transports: Array<string | null>, webauthn_credential_public_key: string, webauthn_credential_sign_count: number };

export type PasskeyCredentialsCollectionQueryQueryVariables = Exact<{
  first?: number | null | undefined;
  filter?: Profile_Webauthn_CredentialsFilter | null | undefined;
  orderBy?: Array<Profile_Webauthn_CredentialsOrderBy> | Profile_Webauthn_CredentialsOrderBy | null | undefined;
}>;


export type PasskeyCredentialsCollectionQueryQuery = { profile_webauthn_credentialsCollection: { edges: Array<{ node: { profile_id: string, webauthn_credential_external_id: string, webauthn_credential_type: string, webauthn_credential_transports: Array<string | null>, webauthn_credential_public_key: string, webauthn_credential_sign_count: number } }> } | null };

export type PasskeyCredentialsInsertMutationMutationVariables = Exact<{
  objects: Array<Profile_Webauthn_CredentialsInsertInput> | Profile_Webauthn_CredentialsInsertInput;
}>;


export type PasskeyCredentialsInsertMutationMutation = { insertIntoprofile_webauthn_credentialsCollection: { records: Array<{ webauthn_credential_id: string, webauthn_credential_friendly_name: string | null, webauthn_credential_device_type: string, webauthn_credential_backup_state: string, webauthn_credential_created_at: string }> } | null };

export type PasskeyCredentialsUpdateMutationMutationVariables = Exact<{
  atMost?: number;
  filter?: Profile_Webauthn_CredentialsFilter | null | undefined;
  set: Profile_Webauthn_CredentialsUpdateInput;
}>;


export type PasskeyCredentialsUpdateMutationMutation = { updateprofile_webauthn_credentialsCollection: { affectedCount: number } };

export type PasskeyChallengesCollectionQueryQueryVariables = Exact<{
  first?: number | null | undefined;
  filter?: Profile_Webauthn_ChallengesFilter | null | undefined;
  orderBy?: Array<Profile_Webauthn_ChallengesOrderBy> | Profile_Webauthn_ChallengesOrderBy | null | undefined;
}>;


export type PasskeyChallengesCollectionQueryQuery = { profile_webauthn_challengesCollection: { edges: Array<{ node: { webauthn_challenge_id: string, webauthn_challenge_value: string } }> } | null };

export type PasskeyChallengesInsertMutationMutationVariables = Exact<{
  objects: Array<Profile_Webauthn_ChallengesInsertInput> | Profile_Webauthn_ChallengesInsertInput;
}>;


export type PasskeyChallengesInsertMutationMutation = { insertIntoprofile_webauthn_challengesCollection: { records: Array<{ webauthn_challenge_id: string, webauthn_challenge_value: string }> } | null };

export type PasskeyChallengesDeleteMutationMutationVariables = Exact<{
  atMost?: number;
  filter?: Profile_Webauthn_ChallengesFilter | null | undefined;
}>;


export type PasskeyChallengesDeleteMutationMutation = { deleteFromprofile_webauthn_challengesCollection: { affectedCount: number } };

export type PasskeyProfileIdByEmailQueryQueryVariables = Exact<{
  email_to_check: string;
}>;


export type PasskeyProfileIdByEmailQueryQuery = { profile_id_by_email: string | null };

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
export const CountryGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment CountryGetFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}
    `, {"fragmentName":"CountryGetFragment"}) as unknown as TypedDocumentString<CountryGetFragmentFragment, unknown>;
export const ViewerOrganizationGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerOrganizationGetFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}
    `, {"fragmentName":"ViewerOrganizationGetFragment"}) as unknown as TypedDocumentString<ViewerOrganizationGetFragmentFragment, unknown>;
export const ViewerProfileGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerProfileGetFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}
    `, {"fragmentName":"ViewerProfileGetFragment"}) as unknown as TypedDocumentString<ViewerProfileGetFragmentFragment, unknown>;
export const ViewerTenantGetFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerTenantGetFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}
    `, {"fragmentName":"ViewerTenantGetFragment"}) as unknown as TypedDocumentString<ViewerTenantGetFragmentFragment, unknown>;
export const CountryHookFragmentFragmentDoc = new TypedDocumentString(`
    fragment CountryHookFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}
    `, {"fragmentName":"CountryHookFragment"}) as unknown as TypedDocumentString<CountryHookFragmentFragment, unknown>;
export const ViewerOrganizationHookFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerOrganizationHookFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}
    `, {"fragmentName":"ViewerOrganizationHookFragment"}) as unknown as TypedDocumentString<ViewerOrganizationHookFragmentFragment, unknown>;
export const ViewerProfileHookFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerProfileHookFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}
    `, {"fragmentName":"ViewerProfileHookFragment"}) as unknown as TypedDocumentString<ViewerProfileHookFragmentFragment, unknown>;
export const ViewerTenantHookFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerTenantHookFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}
    `, {"fragmentName":"ViewerTenantHookFragment"}) as unknown as TypedDocumentString<ViewerTenantHookFragmentFragment, unknown>;
export const PasskeyCredentialFragmentFragmentDoc = new TypedDocumentString(`
    fragment PasskeyCredentialFragment on profile_webauthn_credentials {
  profile_id
  webauthn_credential_external_id
  webauthn_credential_type
  webauthn_credential_transports
  webauthn_credential_public_key
  webauthn_credential_sign_count
}
    `, {"fragmentName":"PasskeyCredentialFragment"}) as unknown as TypedDocumentString<PasskeyCredentialFragmentFragment, unknown>;
export const OnboardingProfileFormUpdateNameMutationDocument = new TypedDocumentString(`
    mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateprofilesCollection(
    filter: {profile_id: {eq: $profile_id}}
    set: {profile_name_full: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<OnboardingProfileFormUpdateNameMutationMutation, OnboardingProfileFormUpdateNameMutationMutationVariables>;
export const ProfileSectionPageQueryDocument = new TypedDocumentString(`
    query ProfileSectionPageQuery {
  profile: viewer_profile {
    profile_id
    profile_name_full
  }
}
    `) as unknown as TypedDocumentString<ProfileSectionPageQueryQuery, ProfileSectionPageQueryQueryVariables>;
export const ProfileSectionUpdateNameMutationDocument = new TypedDocumentString(`
    mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateprofilesCollection(
    filter: {profile_id: {eq: $profile_id}}
    set: {profile_name_full: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<ProfileSectionUpdateNameMutationMutation, ProfileSectionUpdateNameMutationMutationVariables>;
export const SecuritySectionPageQueryDocument = new TypedDocumentString(`
    query SecuritySectionPageQuery {
  profile: viewer_profile {
    profile_id
    profile_webauthn_credentialsCollection(
      orderBy: [{webauthn_credential_created_at: DescNullsLast}]
    ) {
      edges {
        node {
          webauthn_credential_id
          webauthn_credential_friendly_name
          webauthn_credential_device_type
          webauthn_credential_backup_state
          webauthn_credential_created_at
          webauthn_credential_last_used_at
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SecuritySectionPageQueryQuery, SecuritySectionPageQueryQueryVariables>;
export const SecurityPasskeysListDeleteMutationDocument = new TypedDocumentString(`
    mutation SecurityPasskeysListDeleteMutation($webauthn_credential_id: UUID!) {
  deleteFromprofile_webauthn_credentialsCollection(
    filter: {webauthn_credential_id: {eq: $webauthn_credential_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<SecurityPasskeysListDeleteMutationMutation, SecurityPasskeysListDeleteMutationMutationVariables>;
export const HomePickerPageQueryDocument = new TypedDocumentString(`
    query HomePickerPageQuery {
  viewer_organizations(
    filter: {organization_disabled_at: {is: NULL}}
    orderBy: [{organization_name: AscNullsLast}]
  ) {
    edges {
      node {
        organization_id
        organization_name
        organization_slug
        tenants {
          tenant_id
          tenant_slug
          tenant_name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<HomePickerPageQueryQuery, HomePickerPageQueryQueryVariables>;
export const EditOrganizationMembershipGrantPermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {
  insertIntoorganization_membership_permissionsCollection(
    objects: [{organization_membership_id: $organization_membership_id, permission_id: $permission_id}]
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipGrantPermissionMutationMutation, EditOrganizationMembershipGrantPermissionMutationMutationVariables>;
export const EditOrganizationMembershipRevokePermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {
  deleteFromorganization_membership_permissionsCollection(
    filter: {organization_membership_id: {eq: $organization_membership_id}, permission_id: {eq: $permission_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipRevokePermissionMutationMutation, EditOrganizationMembershipRevokePermissionMutationMutationVariables>;
export const EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {
  updateorganization_membershipsCollection(
    filter: {organization_membership_id: {eq: $organization_membership_id}}
    set: {organization_membership_revoked_at: $now}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation, EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables>;
export const MembersPendingInvitationsCancelMutationDocument = new TypedDocumentString(`
    mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {
  updateorganization_membershipsCollection(
    filter: {organization_membership_id: {eq: $organization_membership_id}, profile_id: {is: NULL}, organization_membership_revoked_at: {is: NULL}, organization_membership_rejected_at: {is: NULL}}
    set: {organization_membership_revoked_at: $now, organization_membership_invite_token: null}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<MembersPendingInvitationsCancelMutationMutation, MembersPendingInvitationsCancelMutationMutationVariables>;
export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  health_current_timestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const CountriesGetQueryDocument = new TypedDocumentString(`
    query CountriesGetQuery {
  addresses_level0: addresses_level0Collection(
    filter: {address_level0_disabled_at: {is: NULL}}
    orderBy: [{address_level0_name: AscNullsLast}]
    first: 250
  ) {
    edges {
      node {
        ...CountryGetFragment
      }
    }
  }
}
    fragment CountryGetFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}`) as unknown as TypedDocumentString<CountriesGetQueryQuery, CountriesGetQueryQueryVariables>;
export const ViewerOrganizationsGetQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationsGetQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {
  organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        ...ViewerOrganizationGetFragment
      }
    }
  }
}
    fragment ViewerOrganizationGetFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<ViewerOrganizationsGetQueryQuery, ViewerOrganizationsGetQueryQueryVariables>;
export const ViewerOrganizationByIdGetQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationByIdGetQuery($organization_id: Int!) {
  organization: viewer_organization_by_id(organization_id: $organization_id) {
    ...ViewerOrganizationGetFragment
  }
}
    fragment ViewerOrganizationGetFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<ViewerOrganizationByIdGetQueryQuery, ViewerOrganizationByIdGetQueryQueryVariables>;
export const ViewerProfileGetQueryDocument = new TypedDocumentString(`
    query ViewerProfileGetQuery {
  profile: viewer_profile {
    ...ViewerProfileGetFragment
  }
}
    fragment ViewerProfileGetFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}`) as unknown as TypedDocumentString<ViewerProfileGetQueryQuery, ViewerProfileGetQueryQueryVariables>;
export const ViewerTenantsGetQueryDocument = new TypedDocumentString(`
    query ViewerTenantsGetQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {
  tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        ...ViewerTenantGetFragment
      }
    }
  }
}
    fragment ViewerTenantGetFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}`) as unknown as TypedDocumentString<ViewerTenantsGetQueryQuery, ViewerTenantsGetQueryQueryVariables>;
export const ViewerTenantBySlugGetQueryDocument = new TypedDocumentString(`
    query ViewerTenantBySlugGetQuery($tenant_slug: String!) {
  tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {
    ...ViewerTenantGetFragment
  }
}
    fragment ViewerTenantGetFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}`) as unknown as TypedDocumentString<ViewerTenantBySlugGetQueryQuery, ViewerTenantBySlugGetQueryQueryVariables>;
export const CountriesHookQueryDocument = new TypedDocumentString(`
    query CountriesHookQuery {
  addresses_level0: addresses_level0Collection(
    filter: {address_level0_disabled_at: {is: NULL}}
    orderBy: [{address_level0_name: AscNullsLast}]
    first: 250
  ) {
    edges {
      node {
        ...CountryHookFragment
      }
    }
  }
}
    fragment CountryHookFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}`) as unknown as TypedDocumentString<CountriesHookQueryQuery, CountriesHookQueryQueryVariables>;
export const ViewerOrganizationsHookQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationsHookQuery($filter: organizationsFilter, $orderBy: [organizationsOrderBy!]) {
  organizations: viewer_organizations(filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        ...ViewerOrganizationHookFragment
      }
    }
  }
}
    fragment ViewerOrganizationHookFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<ViewerOrganizationsHookQueryQuery, ViewerOrganizationsHookQueryQueryVariables>;
export const ViewerOrganizationByIdHookQueryDocument = new TypedDocumentString(`
    query ViewerOrganizationByIdHookQuery($organization_id: Int!) {
  organization: viewer_organization_by_id(organization_id: $organization_id) {
    ...ViewerOrganizationHookFragment
  }
}
    fragment ViewerOrganizationHookFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<ViewerOrganizationByIdHookQueryQuery, ViewerOrganizationByIdHookQueryQueryVariables>;
export const ViewerProfileHookQueryDocument = new TypedDocumentString(`
    query ViewerProfileHookQuery {
  profile: viewer_profile {
    ...ViewerProfileHookFragment
  }
}
    fragment ViewerProfileHookFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}`) as unknown as TypedDocumentString<ViewerProfileHookQueryQuery, ViewerProfileHookQueryQueryVariables>;
export const ViewerTenantsHookQueryDocument = new TypedDocumentString(`
    query ViewerTenantsHookQuery($filter: tenantsFilter, $orderBy: [tenantsOrderBy!]) {
  tenants: viewer_tenants(filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        ...ViewerTenantHookFragment
      }
    }
  }
}
    fragment ViewerTenantHookFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}`) as unknown as TypedDocumentString<ViewerTenantsHookQueryQuery, ViewerTenantsHookQueryQueryVariables>;
export const ViewerTenantBySlugHookQueryDocument = new TypedDocumentString(`
    query ViewerTenantBySlugHookQuery($tenant_slug: String!) {
  tenant: viewer_tenant_by_slug(tenant_slug: $tenant_slug) {
    ...ViewerTenantHookFragment
  }
}
    fragment ViewerTenantHookFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}`) as unknown as TypedDocumentString<ViewerTenantBySlugHookQueryQuery, ViewerTenantBySlugHookQueryQueryVariables>;
export const PasskeyCredentialsCollectionQueryDocument = new TypedDocumentString(`
    query PasskeyCredentialsCollectionQuery($first: Int, $filter: profile_webauthn_credentialsFilter, $orderBy: [profile_webauthn_credentialsOrderBy!]) {
  profile_webauthn_credentialsCollection(
    first: $first
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...PasskeyCredentialFragment
      }
    }
  }
}
    fragment PasskeyCredentialFragment on profile_webauthn_credentials {
  profile_id
  webauthn_credential_external_id
  webauthn_credential_type
  webauthn_credential_transports
  webauthn_credential_public_key
  webauthn_credential_sign_count
}`) as unknown as TypedDocumentString<PasskeyCredentialsCollectionQueryQuery, PasskeyCredentialsCollectionQueryQueryVariables>;
export const PasskeyCredentialsInsertMutationDocument = new TypedDocumentString(`
    mutation PasskeyCredentialsInsertMutation($objects: [profile_webauthn_credentialsInsertInput!]!) {
  insertIntoprofile_webauthn_credentialsCollection(objects: $objects) {
    records {
      webauthn_credential_id
      webauthn_credential_friendly_name
      webauthn_credential_device_type
      webauthn_credential_backup_state
      webauthn_credential_created_at
    }
  }
}
    `) as unknown as TypedDocumentString<PasskeyCredentialsInsertMutationMutation, PasskeyCredentialsInsertMutationMutationVariables>;
export const PasskeyCredentialsUpdateMutationDocument = new TypedDocumentString(`
    mutation PasskeyCredentialsUpdateMutation($atMost: Int! = 1, $filter: profile_webauthn_credentialsFilter, $set: profile_webauthn_credentialsUpdateInput!) {
  updateprofile_webauthn_credentialsCollection(
    atMost: $atMost
    filter: $filter
    set: $set
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<PasskeyCredentialsUpdateMutationMutation, PasskeyCredentialsUpdateMutationMutationVariables>;
export const PasskeyChallengesCollectionQueryDocument = new TypedDocumentString(`
    query PasskeyChallengesCollectionQuery($first: Int, $filter: profile_webauthn_challengesFilter, $orderBy: [profile_webauthn_challengesOrderBy!]) {
  profile_webauthn_challengesCollection(
    first: $first
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        webauthn_challenge_id
        webauthn_challenge_value
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PasskeyChallengesCollectionQueryQuery, PasskeyChallengesCollectionQueryQueryVariables>;
export const PasskeyChallengesInsertMutationDocument = new TypedDocumentString(`
    mutation PasskeyChallengesInsertMutation($objects: [profile_webauthn_challengesInsertInput!]!) {
  insertIntoprofile_webauthn_challengesCollection(objects: $objects) {
    records {
      webauthn_challenge_id
      webauthn_challenge_value
    }
  }
}
    `) as unknown as TypedDocumentString<PasskeyChallengesInsertMutationMutation, PasskeyChallengesInsertMutationMutationVariables>;
export const PasskeyChallengesDeleteMutationDocument = new TypedDocumentString(`
    mutation PasskeyChallengesDeleteMutation($atMost: Int! = 1, $filter: profile_webauthn_challengesFilter) {
  deleteFromprofile_webauthn_challengesCollection(
    atMost: $atMost
    filter: $filter
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<PasskeyChallengesDeleteMutationMutation, PasskeyChallengesDeleteMutationMutationVariables>;
export const PasskeyProfileIdByEmailQueryDocument = new TypedDocumentString(`
    query PasskeyProfileIdByEmailQuery($email_to_check: String!) {
  profile_id_by_email(email_to_check: $email_to_check)
}
    `) as unknown as TypedDocumentString<PasskeyProfileIdByEmailQueryQuery, PasskeyProfileIdByEmailQueryQueryVariables>;