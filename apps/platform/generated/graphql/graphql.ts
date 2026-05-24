/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TenantHomeQueryQueryVariables = Exact<{
  tenant_id: number;
}>;


export type TenantHomeQueryQuery = { profile: { profile_name_full: string | null } | null, tenant: { tenant_id: number, tenant_name: string, tenant_slug: string, organizationsCollection: { edges: Array<{ node: { organization_id: number, organization_name: string, organization_slug: string } }> } | null } | null };

export type AccountPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountPageQueryQuery = { profile: { profile_id: string, profile_name_full: string | null, webauthn_credentialsCollection: { edges: Array<{ node: { webauthn_credential_id: string, webauthn_credential_friendly_name: string | null, webauthn_credential_device_type: string, webauthn_credential_backup_state: string, webauthn_credential_created_at: string, webauthn_credential_last_used_at: string | null } }> } | null } | null };

export type DashboardPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardPageQueryQuery = { viewer_organizations: { edges: Array<{ node: { organization_id: number, organization_name: string, organization_slug: string, tenants: { tenant_id: number, tenant_slug: string, tenant_name: string } | null } }> } | null };

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { health_current_timestamp: string | null };

export type ViewerProfileFragmentFragment = { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string };

export type UseViewerProfileHookQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UseViewerProfileHookQueryQuery = { profile: { profile_id: string, profile_name_full: string | null, profile_onboarded_at: string | null, profile_disabled_at: string | null, profile_created_at: string, profile_updated_at: string } | null };

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
export const ViewerProfileFragmentFragmentDoc = new TypedDocumentString(`
    fragment ViewerProfileFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}
    `, {"fragmentName":"ViewerProfileFragment"}) as unknown as TypedDocumentString<ViewerProfileFragmentFragment, unknown>;
export const TenantHomeQueryDocument = new TypedDocumentString(`
    query TenantHomeQuery($tenant_id: Int!) {
  profile: viewer_profile {
    profile_name_full
  }
  tenant: viewer_tenant_by_id(target_tenant_id: $tenant_id) {
    tenant_id
    tenant_name
    tenant_slug
    organizationsCollection(
      filter: {organization_disabled_at: {is: NULL}}
      orderBy: [{organization_name: AscNullsLast}]
    ) {
      edges {
        node {
          organization_id
          organization_name
          organization_slug
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<TenantHomeQueryQuery, TenantHomeQueryQueryVariables>;
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
export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  health_current_timestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const UseViewerProfileHookQueryDocument = new TypedDocumentString(`
    query UseViewerProfileHookQuery {
  profile: viewer_profile {
    ...ViewerProfileFragment
  }
}
    fragment ViewerProfileFragment on profiles {
  profile_id
  profile_name_full
  profile_onboarded_at
  profile_disabled_at
  profile_created_at
  profile_updated_at
}`) as unknown as TypedDocumentString<UseViewerProfileHookQueryQuery, UseViewerProfileHookQueryQueryVariables>;