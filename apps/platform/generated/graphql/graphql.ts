/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TenantHomeQueryQueryVariables = Exact<{
  tenantId: number;
}>;


export type TenantHomeQueryQuery = { profile: { profile_name_full: string | null } | null, organizationsCollection: { edges: Array<{ node: { organization_id: number, organization_name: string, organization_slug: string } }> } | null };

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
    query TenantHomeQuery($tenantId: Int!) {
  profile: viewer_profile {
    profile_name_full
  }
  organizationsCollection(
    filter: {organization_disabled_at: {is: NULL}, tenant_id: {eq: $tenantId}}
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
    `) as unknown as TypedDocumentString<TenantHomeQueryQuery, TenantHomeQueryQueryVariables>;
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