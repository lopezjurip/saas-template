/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
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
  NotNull = "NOT_NULL",
  Null = "NULL",
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
  AscNullsFirst = "AscNullsFirst",
  /** Ascending order, nulls last */
  AscNullsLast = "AscNullsLast",
  /** Descending order, nulls first */
  DescNullsFirst = "DescNullsFirst",
  /** Descending order, nulls last */
  DescNullsLast = "DescNullsLast",
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

export enum Tenant_Tier {
  Enterprise = "enterprise",
  Free = "free",
  Pro = "pro",
}

export type Webauthn_ChallengesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<Webauthn_ChallengesFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: Webauthn_ChallengesFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<Webauthn_ChallengesFilter> | null | undefined;
  profile_id?: UuidFilter | null | undefined;
  webauthn_challenge_created_at?: DatetimeFilter | null | undefined;
  webauthn_challenge_id?: UuidFilter | null | undefined;
  webauthn_challenge_value?: StringFilter | null | undefined;
};

export type Webauthn_ChallengesInsertInput = {
  profile_id?: string | null | undefined;
  webauthn_challenge_created_at?: string | null | undefined;
  webauthn_challenge_id?: string | null | undefined;
  webauthn_challenge_value?: string | null | undefined;
};

export type Webauthn_ChallengesOrderBy = {
  profile_id?: OrderByDirection | null | undefined;
  webauthn_challenge_created_at?: OrderByDirection | null | undefined;
  webauthn_challenge_id?: OrderByDirection | null | undefined;
  webauthn_challenge_value?: OrderByDirection | null | undefined;
};

export type Webauthn_CredentialsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<Webauthn_CredentialsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: Webauthn_CredentialsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<Webauthn_CredentialsFilter> | null | undefined;
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

export type Webauthn_CredentialsInsertInput = {
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

export type Webauthn_CredentialsOrderBy = {
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

export type Webauthn_CredentialsUpdateInput = {
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

export type EditMembershipGrantPermissionMutationMutationVariables = Exact<{
  membership_id: number;
  permission_id: string;
}>;

export type EditMembershipGrantPermissionMutationMutation = {
  insertIntomembership_permissionsCollection: { affectedCount: number } | null;
};

export type EditMembershipRevokePermissionMutationMutationVariables = Exact<{
  membership_id: number;
  permission_id: string;
}>;

export type EditMembershipRevokePermissionMutationMutation = {
  deleteFrommembership_permissionsCollection: { affectedCount: number };
};

export type EditMembershipRevokeMembershipMutationMutationVariables = Exact<{
  membership_id: number;
  now: string;
}>;

export type EditMembershipRevokeMembershipMutationMutation = { updatemembershipsCollection: { affectedCount: number } };

export type MembersPendingInvitationsCancelMutationMutationVariables = Exact<{
  membership_id: number;
  now: string;
}>;

export type MembersPendingInvitationsCancelMutationMutation = {
  updatemembershipsCollection: { affectedCount: number };
};

export type OnboardingProfileFormUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type OnboardingProfileFormUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

export type ProfileSectionPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ProfileSectionPageQueryQuery = { profile: { profile_id: string; profile_name_full: string | null } | null };

export type ProfileSectionUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type ProfileSectionUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

export type SecuritySectionPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type SecuritySectionPageQueryQuery = {
  profile: {
    profile_id: string;
    webauthn_credentialsCollection: {
      edges: Array<{
        node: {
          webauthn_credential_id: string;
          webauthn_credential_friendly_name: string | null;
          webauthn_credential_device_type: string;
          webauthn_credential_backup_state: string;
          webauthn_credential_created_at: string;
          webauthn_credential_last_used_at: string | null;
        };
      }>;
    } | null;
  } | null;
};

export type SecurityPasskeysListDeleteMutationMutationVariables = Exact<{
  webauthn_credential_id: string;
}>;

export type SecurityPasskeysListDeleteMutationMutation = {
  deleteFromwebauthn_credentialsCollection: { affectedCount: number };
};

export type HomePickerPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HomePickerPageQueryQuery = {
  viewer_organizations: {
    edges: Array<{
      node: {
        organization_id: number;
        organization_name: string;
        organization_slug: string;
        tenants: { tenant_id: number; tenant_slug: string; tenant_name: string } | null;
      };
    }>;
  } | null;
};

export type HealthQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HealthQueryQuery = { health_current_timestamp: string | null };

export type CountryGetFragmentFragment = {
  address_level0_id: string;
  address_level0_name: string;
  address_level0_emoji: string | null;
};

export type CountriesGetQueryQueryVariables = Exact<{ [key: string]: never }>;

export type CountriesGetQueryQuery = {
  addresses_level0Collection: {
    edges: Array<{
      node: { address_level0_id: string; address_level0_name: string; address_level0_emoji: string | null };
    }>;
  } | null;
};

export type ViewerOrganizationGetFragmentFragment = {
  organization_id: number;
  tenant_id: number;
  organization_slug: string;
  organization_name: string;
};

export type ViewerOrganizationsGetQueryQueryVariables = Exact<{
  tenant_id?: number | null | undefined;
}>;

export type ViewerOrganizationsGetQueryQuery = {
  viewer_organizations: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdGetQueryQueryVariables = Exact<{
  organization_id: number;
}>;

export type ViewerOrganizationByIdGetQueryQuery = {
  viewer_organization_by_id: {
    organization_id: number;
    tenant_id: number;
    organization_slug: string;
    organization_name: string;
  } | null;
};

export type ViewerProfileGetFragmentFragment = {
  profile_id: string;
  profile_name_full: string | null;
  profile_onboarded_at: string | null;
  profile_disabled_at: string | null;
  profile_created_at: string;
  profile_updated_at: string;
};

export type ViewerProfileGetQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerProfileGetQueryQuery = {
  profile: {
    profile_id: string;
    profile_name_full: string | null;
    profile_onboarded_at: string | null;
    profile_disabled_at: string | null;
    profile_created_at: string;
    profile_updated_at: string;
  } | null;
};

export type ViewerTenantGetFragmentFragment = {
  tenant_id: number;
  tenant_slug: string;
  tenant_name: string;
  tenant_tier: Tenant_Tier;
};

export type ViewerTenantsGetQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerTenantsGetQueryQuery = {
  viewer_tenants: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
  } | null;
};

export type ViewerTenantBySlugGetQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;

export type ViewerTenantBySlugGetQueryQuery = {
  viewer_tenant_by_slug: {
    tenant_id: number;
    tenant_slug: string;
    tenant_name: string;
    tenant_tier: Tenant_Tier;
  } | null;
};

export type CountryHookFragmentFragment = {
  address_level0_id: string;
  address_level0_name: string;
  address_level0_emoji: string | null;
};

export type CountriesHookQueryQueryVariables = Exact<{ [key: string]: never }>;

export type CountriesHookQueryQuery = {
  addresses_level0Collection: {
    edges: Array<{
      node: { address_level0_id: string; address_level0_name: string; address_level0_emoji: string | null };
    }>;
  } | null;
};

export type ViewerOrganizationHookFragmentFragment = {
  organization_id: number;
  tenant_id: number;
  organization_slug: string;
  organization_name: string;
};

export type ViewerOrganizationsHookQueryQueryVariables = Exact<{
  tenant_id?: number | null | undefined;
}>;

export type ViewerOrganizationsHookQueryQuery = {
  viewer_organizations: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdHookQueryQueryVariables = Exact<{
  organization_id: number;
}>;

export type ViewerOrganizationByIdHookQueryQuery = {
  viewer_organization_by_id: {
    organization_id: number;
    tenant_id: number;
    organization_slug: string;
    organization_name: string;
  } | null;
};

export type ViewerProfileHookFragmentFragment = {
  profile_id: string;
  profile_name_full: string | null;
  profile_onboarded_at: string | null;
  profile_disabled_at: string | null;
  profile_created_at: string;
  profile_updated_at: string;
};

export type ViewerProfileHookQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerProfileHookQueryQuery = {
  profile: {
    profile_id: string;
    profile_name_full: string | null;
    profile_onboarded_at: string | null;
    profile_disabled_at: string | null;
    profile_created_at: string;
    profile_updated_at: string;
  } | null;
};

export type ViewerTenantHookFragmentFragment = {
  tenant_id: number;
  tenant_slug: string;
  tenant_name: string;
  tenant_tier: Tenant_Tier;
};

export type ViewerTenantsHookQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerTenantsHookQueryQuery = {
  viewer_tenants: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
  } | null;
};

export type ViewerTenantBySlugHookQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;

export type ViewerTenantBySlugHookQueryQuery = {
  viewer_tenant_by_slug: {
    tenant_id: number;
    tenant_slug: string;
    tenant_name: string;
    tenant_tier: Tenant_Tier;
  } | null;
};

export type PasskeyCredentialFragmentFragment = {
  profile_id: string;
  webauthn_credential_external_id: string;
  webauthn_credential_type: string;
  webauthn_credential_transports: Array<string | null>;
  webauthn_credential_public_key: string;
  webauthn_credential_sign_count: number;
};

export type PasskeyCredentialsCollectionQueryQueryVariables = Exact<{
  first?: number | null | undefined;
  filter?: Webauthn_CredentialsFilter | null | undefined;
  orderBy?: Array<Webauthn_CredentialsOrderBy> | Webauthn_CredentialsOrderBy | null | undefined;
}>;

export type PasskeyCredentialsCollectionQueryQuery = {
  webauthn_credentialsCollection: {
    edges: Array<{
      node: {
        profile_id: string;
        webauthn_credential_external_id: string;
        webauthn_credential_type: string;
        webauthn_credential_transports: Array<string | null>;
        webauthn_credential_public_key: string;
        webauthn_credential_sign_count: number;
      };
    }>;
  } | null;
};

export type PasskeyCredentialsInsertMutationMutationVariables = Exact<{
  objects: Array<Webauthn_CredentialsInsertInput> | Webauthn_CredentialsInsertInput;
}>;

export type PasskeyCredentialsInsertMutationMutation = {
  insertIntowebauthn_credentialsCollection: {
    records: Array<{
      webauthn_credential_id: string;
      webauthn_credential_friendly_name: string | null;
      webauthn_credential_device_type: string;
      webauthn_credential_backup_state: string;
      webauthn_credential_created_at: string;
    }>;
  } | null;
};

export type PasskeyCredentialsUpdateMutationMutationVariables = Exact<{
  atMost?: number;
  filter?: Webauthn_CredentialsFilter | null | undefined;
  set: Webauthn_CredentialsUpdateInput;
}>;

export type PasskeyCredentialsUpdateMutationMutation = {
  updatewebauthn_credentialsCollection: { affectedCount: number };
};

export type PasskeyChallengesCollectionQueryQueryVariables = Exact<{
  first?: number | null | undefined;
  filter?: Webauthn_ChallengesFilter | null | undefined;
  orderBy?: Array<Webauthn_ChallengesOrderBy> | Webauthn_ChallengesOrderBy | null | undefined;
}>;

export type PasskeyChallengesCollectionQueryQuery = {
  webauthn_challengesCollection: {
    edges: Array<{ node: { webauthn_challenge_id: string; webauthn_challenge_value: string } }>;
  } | null;
};

export type PasskeyChallengesInsertMutationMutationVariables = Exact<{
  objects: Array<Webauthn_ChallengesInsertInput> | Webauthn_ChallengesInsertInput;
}>;

export type PasskeyChallengesInsertMutationMutation = {
  insertIntowebauthn_challengesCollection: {
    records: Array<{ webauthn_challenge_id: string; webauthn_challenge_value: string }>;
  } | null;
};

export type PasskeyChallengesDeleteMutationMutationVariables = Exact<{
  atMost?: number;
  filter?: Webauthn_ChallengesFilter | null | undefined;
}>;

export type PasskeyChallengesDeleteMutationMutation = {
  deleteFromwebauthn_challengesCollection: { affectedCount: number };
};

export type PasskeyProfileIdByEmailQueryQueryVariables = Exact<{
  email_to_check: string;
}>;

export type PasskeyProfileIdByEmailQueryQuery = { profile_id_by_email: string | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>;
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
export const CountryGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment CountryGetFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}
    `,
  { fragmentName: "CountryGetFragment" },
) as unknown as TypedDocumentString<CountryGetFragmentFragment, unknown>;
export const ViewerOrganizationGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerOrganizationGetFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}
    `,
  { fragmentName: "ViewerOrganizationGetFragment" },
) as unknown as TypedDocumentString<ViewerOrganizationGetFragmentFragment, unknown>;
export const ViewerProfileGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerProfileGetFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}
    `,
  { fragmentName: "ViewerProfileGetFragment" },
) as unknown as TypedDocumentString<ViewerProfileGetFragmentFragment, unknown>;
export const ViewerTenantGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerTenantGetFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}
    `,
  { fragmentName: "ViewerTenantGetFragment" },
) as unknown as TypedDocumentString<ViewerTenantGetFragmentFragment, unknown>;
export const CountryHookFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment CountryHookFragment on addresses_level0 {
  address_level0_id
  address_level0_name
  address_level0_emoji
}
    `,
  { fragmentName: "CountryHookFragment" },
) as unknown as TypedDocumentString<CountryHookFragmentFragment, unknown>;
export const ViewerOrganizationHookFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerOrganizationHookFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}
    `,
  { fragmentName: "ViewerOrganizationHookFragment" },
) as unknown as TypedDocumentString<ViewerOrganizationHookFragmentFragment, unknown>;
export const ViewerProfileHookFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerProfileHookFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}
    `,
  { fragmentName: "ViewerProfileHookFragment" },
) as unknown as TypedDocumentString<ViewerProfileHookFragmentFragment, unknown>;
export const ViewerTenantHookFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerTenantHookFragment on tenants {
  tenant_id
  tenant_slug
  tenant_name
  tenant_tier
}
    `,
  { fragmentName: "ViewerTenantHookFragment" },
) as unknown as TypedDocumentString<ViewerTenantHookFragmentFragment, unknown>;
export const PasskeyCredentialFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment PasskeyCredentialFragment on webauthn_credentials {
  profile_id
  webauthn_credential_external_id
  webauthn_credential_type
  webauthn_credential_transports
  webauthn_credential_public_key
  webauthn_credential_sign_count
}
    `,
  { fragmentName: "PasskeyCredentialFragment" },
) as unknown as TypedDocumentString<PasskeyCredentialFragmentFragment, unknown>;
export const EditMembershipGrantPermissionMutationDocument = new TypedDocumentString(`
    mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {
  insertIntomembership_permissionsCollection(
    objects: [{membership_id: $membership_id, permission_id: $permission_id}]
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditMembershipGrantPermissionMutationMutation,
  EditMembershipGrantPermissionMutationMutationVariables
>;
export const EditMembershipRevokePermissionMutationDocument = new TypedDocumentString(`
    mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {
  deleteFrommembership_permissionsCollection(
    filter: {membership_id: {eq: $membership_id}, permission_id: {eq: $permission_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditMembershipRevokePermissionMutationMutation,
  EditMembershipRevokePermissionMutationMutationVariables
>;
export const EditMembershipRevokeMembershipMutationDocument = new TypedDocumentString(`
    mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {
  updatemembershipsCollection(
    filter: {membership_id: {eq: $membership_id}}
    set: {membership_revoked_at: $now}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditMembershipRevokeMembershipMutationMutation,
  EditMembershipRevokeMembershipMutationMutationVariables
>;
export const MembersPendingInvitationsCancelMutationDocument = new TypedDocumentString(`
    mutation MembersPendingInvitationsCancelMutation($membership_id: Int!, $now: Datetime!) {
  updatemembershipsCollection(
    filter: {membership_id: {eq: $membership_id}, profile_id: {is: NULL}, membership_revoked_at: {is: NULL}, membership_rejected_at: {is: NULL}}
    set: {membership_revoked_at: $now, membership_invite_token: null}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  MembersPendingInvitationsCancelMutationMutation,
  MembersPendingInvitationsCancelMutationMutationVariables
>;
export const OnboardingProfileFormUpdateNameMutationDocument = new TypedDocumentString(`
    mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateprofilesCollection(
    filter: {profile_id: {eq: $profile_id}}
    set: {profile_name_full: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  OnboardingProfileFormUpdateNameMutationMutation,
  OnboardingProfileFormUpdateNameMutationMutationVariables
>;
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
    `) as unknown as TypedDocumentString<
  ProfileSectionUpdateNameMutationMutation,
  ProfileSectionUpdateNameMutationMutationVariables
>;
export const SecuritySectionPageQueryDocument = new TypedDocumentString(`
    query SecuritySectionPageQuery {
  profile: viewer_profile {
    profile_id
    webauthn_credentialsCollection(
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
  deleteFromwebauthn_credentialsCollection(
    filter: {webauthn_credential_id: {eq: $webauthn_credential_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  SecurityPasskeysListDeleteMutationMutation,
  SecurityPasskeysListDeleteMutationMutationVariables
>;
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
export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  health_current_timestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const CountriesGetQueryDocument = new TypedDocumentString(`
    query CountriesGetQuery {
  addresses_level0Collection(
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
    query ViewerOrganizationsGetQuery($tenant_id: Int) {
  viewer_organizations(
    filter: {tenant_id: {eq: $tenant_id}}
    orderBy: [{organization_name: AscNullsLast}]
  ) {
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
  viewer_organization_by_id(target_organization_id: $organization_id) {
    ...ViewerOrganizationGetFragment
  }
}
    fragment ViewerOrganizationGetFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<
  ViewerOrganizationByIdGetQueryQuery,
  ViewerOrganizationByIdGetQueryQueryVariables
>;
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
    query ViewerTenantsGetQuery {
  viewer_tenants(orderBy: [{tenant_name: AscNullsLast}]) {
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
  viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {
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
  addresses_level0Collection(
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
    query ViewerOrganizationsHookQuery($tenant_id: Int) {
  viewer_organizations(
    filter: {tenant_id: {eq: $tenant_id}}
    orderBy: [{organization_name: AscNullsLast}]
  ) {
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
  viewer_organization_by_id(target_organization_id: $organization_id) {
    ...ViewerOrganizationHookFragment
  }
}
    fragment ViewerOrganizationHookFragment on organizations {
  organization_id
  tenant_id
  organization_slug
  organization_name
}`) as unknown as TypedDocumentString<
  ViewerOrganizationByIdHookQueryQuery,
  ViewerOrganizationByIdHookQueryQueryVariables
>;
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
    query ViewerTenantsHookQuery {
  viewer_tenants(orderBy: [{tenant_name: AscNullsLast}]) {
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
  viewer_tenant_by_slug(target_tenant_slug: $tenant_slug) {
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
    query PasskeyCredentialsCollectionQuery($first: Int, $filter: webauthn_credentialsFilter, $orderBy: [webauthn_credentialsOrderBy!]) {
  webauthn_credentialsCollection(
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
    fragment PasskeyCredentialFragment on webauthn_credentials {
  profile_id
  webauthn_credential_external_id
  webauthn_credential_type
  webauthn_credential_transports
  webauthn_credential_public_key
  webauthn_credential_sign_count
}`) as unknown as TypedDocumentString<
  PasskeyCredentialsCollectionQueryQuery,
  PasskeyCredentialsCollectionQueryQueryVariables
>;
export const PasskeyCredentialsInsertMutationDocument = new TypedDocumentString(`
    mutation PasskeyCredentialsInsertMutation($objects: [webauthn_credentialsInsertInput!]!) {
  insertIntowebauthn_credentialsCollection(objects: $objects) {
    records {
      webauthn_credential_id
      webauthn_credential_friendly_name
      webauthn_credential_device_type
      webauthn_credential_backup_state
      webauthn_credential_created_at
    }
  }
}
    `) as unknown as TypedDocumentString<
  PasskeyCredentialsInsertMutationMutation,
  PasskeyCredentialsInsertMutationMutationVariables
>;
export const PasskeyCredentialsUpdateMutationDocument = new TypedDocumentString(`
    mutation PasskeyCredentialsUpdateMutation($atMost: Int! = 1, $filter: webauthn_credentialsFilter, $set: webauthn_credentialsUpdateInput!) {
  updatewebauthn_credentialsCollection(
    atMost: $atMost
    filter: $filter
    set: $set
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  PasskeyCredentialsUpdateMutationMutation,
  PasskeyCredentialsUpdateMutationMutationVariables
>;
export const PasskeyChallengesCollectionQueryDocument = new TypedDocumentString(`
    query PasskeyChallengesCollectionQuery($first: Int, $filter: webauthn_challengesFilter, $orderBy: [webauthn_challengesOrderBy!]) {
  webauthn_challengesCollection(first: $first, filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        webauthn_challenge_id
        webauthn_challenge_value
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  PasskeyChallengesCollectionQueryQuery,
  PasskeyChallengesCollectionQueryQueryVariables
>;
export const PasskeyChallengesInsertMutationDocument = new TypedDocumentString(`
    mutation PasskeyChallengesInsertMutation($objects: [webauthn_challengesInsertInput!]!) {
  insertIntowebauthn_challengesCollection(objects: $objects) {
    records {
      webauthn_challenge_id
      webauthn_challenge_value
    }
  }
}
    `) as unknown as TypedDocumentString<
  PasskeyChallengesInsertMutationMutation,
  PasskeyChallengesInsertMutationMutationVariables
>;
export const PasskeyChallengesDeleteMutationDocument = new TypedDocumentString(`
    mutation PasskeyChallengesDeleteMutation($atMost: Int! = 1, $filter: webauthn_challengesFilter) {
  deleteFromwebauthn_challengesCollection(atMost: $atMost, filter: $filter) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  PasskeyChallengesDeleteMutationMutation,
  PasskeyChallengesDeleteMutationMutationVariables
>;
export const PasskeyProfileIdByEmailQueryDocument = new TypedDocumentString(`
    query PasskeyProfileIdByEmailQuery($email_to_check: String!) {
  profile_id_by_email(email_to_check: $email_to_check)
}
    `) as unknown as TypedDocumentString<PasskeyProfileIdByEmailQueryQuery, PasskeyProfileIdByEmailQueryQueryVariables>;
