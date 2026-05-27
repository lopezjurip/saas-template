/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export enum Tenant_Tier {
  Enterprise = "enterprise",
  Free = "free",
  Pro = "pro",
}

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

export type AccountPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type AccountPageQueryQuery = {
  profile: {
    profile_id: string;
    profile_name_full: string | null;
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

export type AccountPasskeysSectionDeleteMutationMutationVariables = Exact<{
  webauthn_credential_id: string;
}>;

export type AccountPasskeysSectionDeleteMutationMutation = {
  deleteFromwebauthn_credentialsCollection: { affectedCount: number };
};

export type AccountProfileFormUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type AccountProfileFormUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

export type DashboardPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type DashboardPageQueryQuery = {
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

export type OnboardingNameStepUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type OnboardingNameStepUpdateNameMutationMutation = { updateprofilesCollection: { affectedCount: number } };

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
  organizationsCollection: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdGetQueryQueryVariables = Exact<{
  organization_id: number;
}>;

export type ViewerOrganizationByIdGetQueryQuery = {
  organizationsCollection: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
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
  tenantsCollection: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
  } | null;
};

export type ViewerTenantBySlugGetQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;

export type ViewerTenantBySlugGetQueryQuery = {
  tenantsCollection: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
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
  organizationsCollection: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdHookQueryQueryVariables = Exact<{
  organization_id: number;
}>;

export type ViewerOrganizationByIdHookQueryQuery = {
  organizationsCollection: {
    edges: Array<{
      node: { organization_id: number; tenant_id: number; organization_slug: string; organization_name: string };
    }>;
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
  tenantsCollection: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
  } | null;
};

export type ViewerTenantBySlugHookQueryQueryVariables = Exact<{
  tenant_slug: string;
}>;

export type ViewerTenantBySlugHookQueryQuery = {
  tenantsCollection: {
    edges: Array<{ node: { tenant_id: number; tenant_slug: string; tenant_name: string; tenant_tier: Tenant_Tier } }>;
  } | null;
};

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
export const AccountPageQueryDocument = new TypedDocumentString(`
    query AccountPageQuery {
  profile: viewer_profile {
    profile_id
    profile_name_full
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
    `) as unknown as TypedDocumentString<AccountPageQueryQuery, AccountPageQueryQueryVariables>;
export const AccountPasskeysSectionDeleteMutationDocument = new TypedDocumentString(`
    mutation AccountPasskeysSectionDeleteMutation($webauthn_credential_id: UUID!) {
  deleteFromwebauthn_credentialsCollection(
    filter: {webauthn_credential_id: {eq: $webauthn_credential_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  AccountPasskeysSectionDeleteMutationMutation,
  AccountPasskeysSectionDeleteMutationMutationVariables
>;
export const AccountProfileFormUpdateNameMutationDocument = new TypedDocumentString(`
    mutation AccountProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateprofilesCollection(
    filter: {profile_id: {eq: $profile_id}}
    set: {profile_name_full: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  AccountProfileFormUpdateNameMutationMutation,
  AccountProfileFormUpdateNameMutationMutationVariables
>;
export const DashboardPageQueryDocument = new TypedDocumentString(`
    query DashboardPageQuery {
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
    `) as unknown as TypedDocumentString<DashboardPageQueryQuery, DashboardPageQueryQueryVariables>;
export const OnboardingNameStepUpdateNameMutationDocument = new TypedDocumentString(`
    mutation OnboardingNameStepUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateprofilesCollection(
    filter: {profile_id: {eq: $profile_id}}
    set: {profile_name_full: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  OnboardingNameStepUpdateNameMutationMutation,
  OnboardingNameStepUpdateNameMutationMutationVariables
>;
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
  organizationsCollection(
    filter: {tenant_id: {eq: $tenant_id}, organization_disabled_at: {is: NULL}}
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
  organizationsCollection(
    filter: {organization_id: {eq: $organization_id}, organization_disabled_at: {is: NULL}}
    first: 1
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
  tenantsCollection(
    filter: {tenant_disabled_at: {is: NULL}}
    orderBy: [{tenant_name: AscNullsLast}]
  ) {
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
  tenantsCollection(
    filter: {tenant_slug: {eq: $tenant_slug}, tenant_disabled_at: {is: NULL}}
    first: 1
  ) {
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
  organizationsCollection(
    filter: {tenant_id: {eq: $tenant_id}, organization_disabled_at: {is: NULL}}
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
  organizationsCollection(
    filter: {organization_id: {eq: $organization_id}, organization_disabled_at: {is: NULL}}
    first: 1
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
  tenantsCollection(
    filter: {tenant_disabled_at: {is: NULL}}
    orderBy: [{tenant_name: AscNullsLast}]
  ) {
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
  tenantsCollection(
    filter: {tenant_slug: {eq: $tenant_slug}, tenant_disabled_at: {is: NULL}}
    first: 1
  ) {
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
}`) as unknown as TypedDocumentString<ViewerTenantBySlugHookQueryQuery, ViewerTenantBySlugHookQueryQueryVariables>;
