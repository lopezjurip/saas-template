/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type AddressesLevel0Filter = {
  addressLevel0CreatedAt?: DatetimeFilter | null | undefined;
  addressLevel0DisabledAt?: DatetimeFilter | null | undefined;
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
  addressLevel0DisabledAt?: OrderByDirection | null | undefined;
  addressLevel0Emoji?: OrderByDirection | null | undefined;
  addressLevel0HiddenAt?: OrderByDirection | null | undefined;
  addressLevel0Id?: OrderByDirection | null | undefined;
  addressLevel0Name?: OrderByDirection | null | undefined;
  addressLevel0UpdatedAt?: OrderByDirection | null | undefined;
};

export type AgenciesFilter = {
  agencyCreatedAt?: DatetimeFilter | null | undefined;
  agencyDisabledAt?: DatetimeFilter | null | undefined;
  agencyId?: UuidFilter | null | undefined;
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
  agencyDisabledAt?: OrderByDirection | null | undefined;
  agencyId?: OrderByDirection | null | undefined;
  agencyName?: OrderByDirection | null | undefined;
  agencySlug?: OrderByDirection | null | undefined;
  agencyUpdatedAt?: OrderByDirection | null | undefined;
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

export type OrganizationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: Array<OrganizationsFilter> | null | undefined;
  nodeId?: IdFilter | null | undefined;
  /** Negates a filter */
  not?: OrganizationsFilter | null | undefined;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: Array<OrganizationsFilter> | null | undefined;
  organizationCreatedAt?: DatetimeFilter | null | undefined;
  organizationDisabledAt?: DatetimeFilter | null | undefined;
  organizationId?: IntFilter | null | undefined;
  organizationName?: StringFilter | null | undefined;
  organizationSlug?: StringFilter | null | undefined;
  organizationUpdatedAt?: DatetimeFilter | null | undefined;
  tenantId?: IntFilter | null | undefined;
};

export type OrganizationsOrderBy = {
  organizationCreatedAt?: OrderByDirection | null | undefined;
  organizationDisabledAt?: OrderByDirection | null | undefined;
  organizationId?: OrderByDirection | null | undefined;
  organizationName?: OrderByDirection | null | undefined;
  organizationSlug?: OrderByDirection | null | undefined;
  organizationUpdatedAt?: OrderByDirection | null | undefined;
  tenantId?: OrderByDirection | null | undefined;
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

export enum TenantTier {
  Enterprise = "enterprise",
  Free = "free",
  Pro = "pro",
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
  tenantDisabledAt?: DatetimeFilter | null | undefined;
  tenantId?: IntFilter | null | undefined;
  tenantName?: StringFilter | null | undefined;
  tenantSlug?: StringFilter | null | undefined;
  tenantTier?: TenantTierFilter | null | undefined;
  tenantUpdatedAt?: DatetimeFilter | null | undefined;
};

export type TenantsOrderBy = {
  tenantCreatedAt?: OrderByDirection | null | undefined;
  tenantDisabledAt?: OrderByDirection | null | undefined;
  tenantId?: OrderByDirection | null | undefined;
  tenantName?: OrderByDirection | null | undefined;
  tenantSlug?: OrderByDirection | null | undefined;
  tenantTier?: OrderByDirection | null | undefined;
  tenantUpdatedAt?: OrderByDirection | null | undefined;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: string | null | undefined;
  in?: Array<string> | null | undefined;
  is?: FilterIs | null | undefined;
  neq?: string | null | undefined;
};

export type AgencyCreateMutationMutationVariables = Exact<{
  agency_name: string;
  agency_slug: string;
}>;

export type AgencyCreateMutationMutation = { agency: { agencyId: string } | null };

export type ProfileSectionUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type ProfileSectionUpdateNameMutationMutation = { updateProfilesCollection: { affectedCount: number } };

export type SessionsSectionPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type SessionsSectionPageQueryQuery = {
  viewerSessions: {
    edges: Array<{
      node: {
        id: string | null;
        userAgent: string | null;
        ip: string | null;
        createdAt: string | null;
        refreshedAt: string | null;
        notAfter: string | null;
      };
    }>;
  } | null;
};

export type SessionsSectionSessionFragmentFragment = {
  id: string | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: string | null;
  refreshedAt: string | null;
  notAfter: string | null;
};

export type HomePickerPageQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HomePickerPageQueryQuery = {
  viewerOrganizations: {
    edges: Array<{
      node: {
        organizationId: number;
        organizationName: string;
        organizationSlug: string;
        tenant: { tenantId: number; tenantSlug: string; tenantName: string } | null;
      };
    }>;
  } | null;
};

export type EditOrganizationMembershipGrantPermissionMutationMutationVariables = Exact<{
  organization_membership_id: number;
  permission_id: string;
}>;

export type EditOrganizationMembershipGrantPermissionMutationMutation = {
  insertIntoOrganizationMembershipPermissionsCollection: { affectedCount: number } | null;
};

export type EditOrganizationMembershipRevokePermissionMutationMutationVariables = Exact<{
  organization_membership_id: number;
  permission_id: string;
}>;

export type EditOrganizationMembershipRevokePermissionMutationMutation = {
  deleteFromOrganizationMembershipPermissionsCollection: { affectedCount: number };
};

export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables = Exact<{
  organization_membership_id: number;
  now: string;
}>;

export type EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation = {
  updateOrganizationMembershipsCollection: { affectedCount: number };
};

export type MembersPendingInvitationsCancelMutationMutationVariables = Exact<{
  organization_membership_id: number;
  now: string;
}>;

export type MembersPendingInvitationsCancelMutationMutation = {
  updateOrganizationMembershipsCollection: { affectedCount: number };
};

export type CreateTenantFormMutationMutationVariables = Exact<{
  tenant_name: string;
  tenant_slug: string;
}>;

export type CreateTenantFormMutationMutation = { tenant: { tenantId: number } | null };

export type OnboardingProfileFormUpdateNameMutationMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type OnboardingProfileFormUpdateNameMutationMutation = { updateProfilesCollection: { affectedCount: number } };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HealthQueryQuery = { healthCurrentTimestamp: string | null };

export type ScopeSelectorOrgsQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ScopeSelectorOrgsQueryQuery = {
  viewerOrganizations: {
    edges: Array<{ node: { organizationId: number; organizationName: string; tenant: { tenantSlug: string } | null } }>;
  } | null;
};

export type ScopeSelectorAgenciesQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ScopeSelectorAgenciesQueryQuery = {
  agencies: { edges: Array<{ node: { agencyId: string; agencySlug: string; agencyName: string } }> } | null;
};

export type PostHogIdentifyQueryVariables = Exact<{ [key: string]: never }>;

export type PostHogIdentifyQuery = {
  profile: {
    profileId: string;
    profileNameFull: string | null;
    profileOnboardedAt: string | null;
    profileCreatedAt: string;
  } | null;
  tenants: {
    edges: Array<{ node: { tenantId: number; tenantSlug: string; tenantTier: TenantTier; tenantCreatedAt: string } }>;
  } | null;
  organizations: {
    edges: Array<{ node: { organizationId: number; organizationName: string; tenantId: number } }>;
  } | null;
};

export type CountryGetFragmentFragment = {
  addressLevel0Id: string;
  addressLevel0Name: string;
  addressLevel0Emoji: string | null;
};

export type CountriesGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AddressesLevel0Filter | null | undefined;
  orderBy?: Array<AddressesLevel0OrderBy> | AddressesLevel0OrderBy | null | undefined;
}>;

export type CountriesGetQuery = {
  addressesLevel0: {
    edges: Array<{ node: { addressLevel0Id: string; addressLevel0Name: string; addressLevel0Emoji: string | null } }>;
  } | null;
};

export type ViewerAgencyGetFragmentFragment = { agencyId: string; agencySlug: string; agencyName: string };

export type ViewerAgenciesGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AgenciesFilter | null | undefined;
  orderBy?: Array<AgenciesOrderBy> | AgenciesOrderBy | null | undefined;
}>;

export type ViewerAgenciesGetQuery = {
  agencies: { edges: Array<{ node: { agencyId: string; agencySlug: string; agencyName: string } }> } | null;
};

export type ViewerAgencyByIdGetQueryVariables = Exact<{
  agencyId: string;
}>;

export type ViewerAgencyByIdGetQuery = { agency: { agencyId: string; agencySlug: string; agencyName: string } | null };

export type ViewerAgencyBySlugGetQueryVariables = Exact<{
  agencySlug: string;
}>;

export type ViewerAgencyBySlugGetQuery = {
  agency: { agencyId: string; agencySlug: string; agencyName: string } | null;
};

export type ViewerOrganizationGetFragmentFragment = {
  organizationId: number;
  tenantId: number;
  organizationSlug: string;
  organizationName: string;
};

export type ViewerOrganizationsGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;

export type ViewerOrganizationsGetQuery = {
  organizations: {
    edges: Array<{
      node: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdQueryQueryVariables = Exact<{
  organizationId: number;
}>;

export type ViewerOrganizationByIdQueryQuery = {
  organization: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string } | null;
};

export type ViewerOrganizationBySlugQueryQueryVariables = Exact<{
  organizationSlug: string;
}>;

export type ViewerOrganizationBySlugQueryQuery = {
  organizations: {
    edges: Array<{
      node: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string };
    }>;
  } | null;
};

export type ViewerProfileGetFragmentFragment = {
  profileId: string;
  profileNameFull: string | null;
  profileOnboardedAt: string | null;
  profileDisabledAt: string | null;
  profileCreatedAt: string;
  profileUpdatedAt: string;
};

export type ViewerProfileGetQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerProfileGetQuery = {
  profile: {
    profileId: string;
    profileNameFull: string | null;
    profileOnboardedAt: string | null;
    profileDisabledAt: string | null;
    profileCreatedAt: string;
    profileUpdatedAt: string;
  } | null;
};

export type ViewerTenantGetFragmentFragment = {
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
  tenantTier: TenantTier;
};

export type ViewerTenantsGetQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;

export type ViewerTenantsGetQuery = {
  tenants: {
    edges: Array<{ node: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } }>;
  } | null;
};

export type ViewerTenantByIdGetQueryVariables = Exact<{
  tenantId: number;
}>;

export type ViewerTenantByIdGetQuery = {
  tenant: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } | null;
};

export type ViewerTenantBySlugGetQueryVariables = Exact<{
  tenantSlug: string;
}>;

export type ViewerTenantBySlugGetQuery = {
  tenant: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } | null;
};

export type CountryHookUseFragmentFragment = {
  addressLevel0Id: string;
  addressLevel0Name: string;
  addressLevel0Emoji: string | null;
};

export type CountriesUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AddressesLevel0Filter | null | undefined;
  orderBy?: Array<AddressesLevel0OrderBy> | AddressesLevel0OrderBy | null | undefined;
}>;

export type CountriesUseQuery = {
  addressesLevel0: {
    edges: Array<{ node: { addressLevel0Id: string; addressLevel0Name: string; addressLevel0Emoji: string | null } }>;
  } | null;
};

export type ViewerAgencyUseFragmentFragment = { agencyId: string; agencySlug: string; agencyName: string };

export type ViewerAgenciesUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: AgenciesFilter | null | undefined;
  orderBy?: Array<AgenciesOrderBy> | AgenciesOrderBy | null | undefined;
}>;

export type ViewerAgenciesUseQuery = {
  agencies: { edges: Array<{ node: { agencyId: string; agencySlug: string; agencyName: string } }> } | null;
};

export type ViewerAgencyByIdUseQueryVariables = Exact<{
  agencyId: string;
}>;

export type ViewerAgencyByIdUseQuery = { agency: { agencyId: string; agencySlug: string; agencyName: string } | null };

export type ViewerAgencyBySlugUseQueryVariables = Exact<{
  agencySlug: string;
}>;

export type ViewerAgencyBySlugUseQuery = {
  agency: { agencyId: string; agencySlug: string; agencyName: string } | null;
};

export type ViewerOrganizationUseFragmentFragment = {
  organizationId: number;
  tenantId: number;
  organizationSlug: string;
  organizationName: string;
};

export type ViewerOrganizationsUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: OrganizationsFilter | null | undefined;
  orderBy?: Array<OrganizationsOrderBy> | OrganizationsOrderBy | null | undefined;
}>;

export type ViewerOrganizationsUseQuery = {
  organizations: {
    edges: Array<{
      node: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string };
    }>;
  } | null;
};

export type ViewerOrganizationByIdUseQueryVariables = Exact<{
  organizationId: number;
}>;

export type ViewerOrganizationByIdUseQuery = {
  organization: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string } | null;
};

export type ViewerOrganizationBySlugUseQueryVariables = Exact<{
  organizationSlug: string;
}>;

export type ViewerOrganizationBySlugUseQuery = {
  organizations: {
    edges: Array<{
      node: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string };
    }>;
  } | null;
};

export type ViewerProfileUseFragmentFragment = {
  profileId: string;
  profileNameFull: string | null;
  profileOnboardedAt: string | null;
  profileDisabledAt: string | null;
  profileCreatedAt: string;
  profileUpdatedAt: string;
};

export type ViewerProfileUseQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerProfileUseQuery = {
  profile: {
    profileId: string;
    profileNameFull: string | null;
    profileOnboardedAt: string | null;
    profileDisabledAt: string | null;
    profileCreatedAt: string;
    profileUpdatedAt: string;
  } | null;
};

export type ViewerTenantUseFragmentFragment = {
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
  tenantTier: TenantTier;
};

export type ViewerTenantsUseQueryVariables = Exact<{
  first?: number | null | undefined;
  last?: number | null | undefined;
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: TenantsFilter | null | undefined;
  orderBy?: Array<TenantsOrderBy> | TenantsOrderBy | null | undefined;
}>;

export type ViewerTenantsUseQuery = {
  tenants: {
    edges: Array<{ node: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } }>;
  } | null;
};

export type ViewerTenantByIdUseQueryVariables = Exact<{
  tenantId: number;
}>;

export type ViewerTenantByIdUseQuery = {
  tenant: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } | null;
};

export type ViewerTenantBySlugUseQueryVariables = Exact<{
  tenantSlug: string;
}>;

export type ViewerTenantBySlugUseQuery = {
  tenant: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } | null;
};

export type UpdateProfileMcpMutationVariables = Exact<{
  profile_id: string;
  profile_name_full: string;
}>;

export type UpdateProfileMcpMutation = { updateProfilesCollection: { affectedCount: number } };

export type ListTenantsMcpQueryVariables = Exact<{ [key: string]: never }>;

export type ListTenantsMcpQuery = {
  tenants: {
    edges: Array<{ node: { tenantId: number; tenantSlug: string; tenantName: string; tenantTier: TenantTier } }>;
  } | null;
};

export type ListOrganizationsMcpQueryVariables = Exact<{ [key: string]: never }>;

export type ListOrganizationsMcpQuery = {
  organizations: {
    edges: Array<{
      node: { organizationId: number; tenantId: number; organizationSlug: string; organizationName: string };
    }>;
  } | null;
};

export type WhoamiMcpQueryVariables = Exact<{ [key: string]: never }>;

export type WhoamiMcpQuery = {
  profile: {
    profileId: string;
    profileNameFull: string | null;
    profileOnboardedAt: string | null;
    profileDisabledAt: string | null;
    profileCreatedAt: string;
    profileUpdatedAt: string;
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
export const SessionsSectionSessionFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment SessionsSectionSessionFragment on UserSessions {
  id
  userAgent
  ip
  createdAt
  refreshedAt
  notAfter
}
    `,
  { fragmentName: "SessionsSectionSessionFragment" },
) as unknown as TypedDocumentString<SessionsSectionSessionFragmentFragment, unknown>;
export const CountryGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment CountryGetFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}
    `,
  { fragmentName: "CountryGetFragment" },
) as unknown as TypedDocumentString<CountryGetFragmentFragment, unknown>;
export const ViewerAgencyGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}
    `,
  { fragmentName: "ViewerAgencyGetFragment" },
) as unknown as TypedDocumentString<ViewerAgencyGetFragmentFragment, unknown>;
export const ViewerOrganizationGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerOrganizationGetFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}
    `,
  { fragmentName: "ViewerOrganizationGetFragment" },
) as unknown as TypedDocumentString<ViewerOrganizationGetFragmentFragment, unknown>;
export const ViewerProfileGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerProfileGetFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDisabledAt
  profileCreatedAt
  profileUpdatedAt
}
    `,
  { fragmentName: "ViewerProfileGetFragment" },
) as unknown as TypedDocumentString<ViewerProfileGetFragmentFragment, unknown>;
export const ViewerTenantGetFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerTenantGetFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}
    `,
  { fragmentName: "ViewerTenantGetFragment" },
) as unknown as TypedDocumentString<ViewerTenantGetFragmentFragment, unknown>;
export const CountryHookUseFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment CountryHookUseFragment on AddressesLevel0 {
  addressLevel0Id
  addressLevel0Name
  addressLevel0Emoji
}
    `,
  { fragmentName: "CountryHookUseFragment" },
) as unknown as TypedDocumentString<CountryHookUseFragmentFragment, unknown>;
export const ViewerAgencyUseFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerAgencyUseFragment on Agencies {
  agencyId
  agencySlug
  agencyName
}
    `,
  { fragmentName: "ViewerAgencyUseFragment" },
) as unknown as TypedDocumentString<ViewerAgencyUseFragmentFragment, unknown>;
export const ViewerOrganizationUseFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerOrganizationUseFragment on Organizations {
  organizationId
  tenantId
  organizationSlug
  organizationName
}
    `,
  { fragmentName: "ViewerOrganizationUseFragment" },
) as unknown as TypedDocumentString<ViewerOrganizationUseFragmentFragment, unknown>;
export const ViewerProfileUseFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerProfileUseFragment on Profiles {
  profileId
  profileNameFull
  profileOnboardedAt
  profileDisabledAt
  profileCreatedAt
  profileUpdatedAt
}
    `,
  { fragmentName: "ViewerProfileUseFragment" },
) as unknown as TypedDocumentString<ViewerProfileUseFragmentFragment, unknown>;
export const ViewerTenantUseFragmentFragmentDoc = new TypedDocumentString(
  `
    fragment ViewerTenantUseFragment on Tenants {
  tenantId
  tenantSlug
  tenantName
  tenantTier
}
    `,
  { fragmentName: "ViewerTenantUseFragment" },
) as unknown as TypedDocumentString<ViewerTenantUseFragmentFragment, unknown>;
export const AgencyCreateMutationDocument = new TypedDocumentString(`
    mutation AgencyCreateMutation($agency_name: String!, $agency_slug: String!) {
  agency: viewerAgencyCreate(agencyName: $agency_name, agencySlug: $agency_slug) {
    agencyId
  }
}
    `) as unknown as TypedDocumentString<AgencyCreateMutationMutation, AgencyCreateMutationMutationVariables>;
export const ProfileSectionUpdateNameMutationDocument = new TypedDocumentString(`
    mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateProfilesCollection(
    filter: {profileId: {eq: $profile_id}}
    set: {profileNameFull: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  ProfileSectionUpdateNameMutationMutation,
  ProfileSectionUpdateNameMutationMutationVariables
>;
export const SessionsSectionPageQueryDocument = new TypedDocumentString(`
    query SessionsSectionPageQuery {
  viewerSessions {
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
export const HomePickerPageQueryDocument = new TypedDocumentString(`
    query HomePickerPageQuery {
  viewerOrganizations(
    filter: {organizationDisabledAt: {is: NULL}}
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
export const EditOrganizationMembershipGrantPermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipGrantPermissionMutation($organization_membership_id: Int!, $permission_id: String!) {
  insertIntoOrganizationMembershipPermissionsCollection(
    objects: [{organizationMembershipId: $organization_membership_id, permissionId: $permission_id}]
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditOrganizationMembershipGrantPermissionMutationMutation,
  EditOrganizationMembershipGrantPermissionMutationMutationVariables
>;
export const EditOrganizationMembershipRevokePermissionMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokePermissionMutation($organization_membership_id: Int!, $permission_id: String!) {
  deleteFromOrganizationMembershipPermissionsCollection(
    filter: {organizationMembershipId: {eq: $organization_membership_id}, permissionId: {eq: $permission_id}}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditOrganizationMembershipRevokePermissionMutationMutation,
  EditOrganizationMembershipRevokePermissionMutationMutationVariables
>;
export const EditOrganizationMembershipRevokeOrganizationMembershipMutationDocument = new TypedDocumentString(`
    mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($organization_membership_id: Int!, $now: Datetime!) {
  updateOrganizationMembershipsCollection(
    filter: {organizationMembershipId: {eq: $organization_membership_id}}
    set: {organizationMembershipRevokedAt: $now}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  EditOrganizationMembershipRevokeOrganizationMembershipMutationMutation,
  EditOrganizationMembershipRevokeOrganizationMembershipMutationMutationVariables
>;
export const MembersPendingInvitationsCancelMutationDocument = new TypedDocumentString(`
    mutation MembersPendingInvitationsCancelMutation($organization_membership_id: Int!, $now: Datetime!) {
  updateOrganizationMembershipsCollection(
    filter: {organizationMembershipId: {eq: $organization_membership_id}, profileId: {is: NULL}, organizationMembershipRevokedAt: {is: NULL}, organizationMembershipRejectedAt: {is: NULL}}
    set: {organizationMembershipRevokedAt: $now, organizationMembershipInviteToken: null}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  MembersPendingInvitationsCancelMutationMutation,
  MembersPendingInvitationsCancelMutationMutationVariables
>;
export const CreateTenantFormMutationDocument = new TypedDocumentString(`
    mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {
  tenant: viewerTenantCreate(tenantName: $tenant_name, tenantSlug: $tenant_slug) {
    tenantId
  }
}
    `) as unknown as TypedDocumentString<CreateTenantFormMutationMutation, CreateTenantFormMutationMutationVariables>;
export const OnboardingProfileFormUpdateNameMutationDocument = new TypedDocumentString(`
    mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
  updateProfilesCollection(
    filter: {profileId: {eq: $profile_id}}
    set: {profileNameFull: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<
  OnboardingProfileFormUpdateNameMutationMutation,
  OnboardingProfileFormUpdateNameMutationMutationVariables
>;
export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  healthCurrentTimestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const ScopeSelectorOrgsQueryDocument = new TypedDocumentString(`
    query ScopeSelectorOrgsQuery {
  viewerOrganizations(
    filter: {organizationDisabledAt: {is: NULL}}
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
  agencies: viewerAgencies(orderBy: [{agencyName: AscNullsLast}]) {
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
  tenants: viewerTenants {
    edges {
      node {
        tenantId
        tenantSlug
        tenantTier
        tenantCreatedAt
      }
    }
  }
  organizations: viewerOrganizations {
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
  agencies: viewerAgencies(
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
}`) as unknown as TypedDocumentString<ViewerAgenciesGetQuery, ViewerAgenciesGetQueryVariables>;
export const ViewerAgencyByIdGetDocument = new TypedDocumentString(`
    query ViewerAgencyByIdGet($agencyId: UUID!) {
  agency: viewerAgencyById(agencyId: $agencyId) {
    ...ViewerAgencyGetFragment
  }
}
    fragment ViewerAgencyGetFragment on Agencies {
  agencyId
  agencySlug
  agencyName
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
}`) as unknown as TypedDocumentString<ViewerAgencyBySlugGetQuery, ViewerAgencyBySlugGetQueryVariables>;
export const ViewerOrganizationsGetDocument = new TypedDocumentString(`
    query ViewerOrganizationsGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: OrganizationsFilter, $orderBy: [OrganizationsOrderBy!]) {
  organizations: viewerOrganizations(
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
  organizations: viewerOrganizations(
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
  profileDisabledAt
  profileCreatedAt
  profileUpdatedAt
}`) as unknown as TypedDocumentString<ViewerProfileGetQuery, ViewerProfileGetQueryVariables>;
export const ViewerTenantsGetDocument = new TypedDocumentString(`
    query ViewerTenantsGet($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: TenantsFilter, $orderBy: [TenantsOrderBy!]) {
  tenants: viewerTenants(
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
  agencies: viewerAgencies(
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
    query ViewerAgencyByIdUse($agencyId: UUID!) {
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
  organizations: viewerOrganizations(
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
  organizations: viewerOrganizations(
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
  profileDisabledAt
  profileCreatedAt
  profileUpdatedAt
}`) as unknown as TypedDocumentString<ViewerProfileUseQuery, ViewerProfileUseQueryVariables>;
export const ViewerTenantsUseDocument = new TypedDocumentString(`
    query ViewerTenantsUse($first: Int, $last: Int, $after: Cursor, $before: Cursor, $filter: TenantsFilter, $orderBy: [TenantsOrderBy!]) {
  tenants: viewerTenants(
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
export const UpdateProfileMcpDocument = new TypedDocumentString(`
    mutation UpdateProfileMcp($profile_id: UUID!, $profile_name_full: String!) {
  updateProfilesCollection(
    filter: {profileId: {eq: $profile_id}}
    set: {profileNameFull: $profile_name_full}
  ) {
    affectedCount
  }
}
    `) as unknown as TypedDocumentString<UpdateProfileMcpMutation, UpdateProfileMcpMutationVariables>;
export const ListTenantsMcpDocument = new TypedDocumentString(`
    query ListTenantsMcp {
  tenants: viewerTenants(orderBy: [{tenantName: AscNullsLast}]) {
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
  organizations: viewerOrganizations(orderBy: [{organizationName: AscNullsLast}]) {
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
    profileDisabledAt
    profileCreatedAt
    profileUpdatedAt
  }
}
    `) as unknown as TypedDocumentString<WhoamiMcpQuery, WhoamiMcpQueryVariables>;
