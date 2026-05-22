/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A high precision floating point value represented as a string */
  BigFloat: { input: string; output: string; }
  /** An arbitrary size integer represented as a string */
  BigInt: { input: string; output: string; }
  /** An opaque string using for tracking a position in results during pagination */
  Cursor: { input: string; output: string; }
  /** A date without time information */
  Date: { input: string; output: string; }
  /** A date and time */
  Datetime: { input: string; output: string; }
  /** A Javascript Object Notation value serialized as a string */
  JSON: { input: string; output: string; }
  /** Any type not handled by the type system */
  Opaque: { input: string; output: string; }
  /** A time without date information */
  Time: { input: string; output: string; }
  /** A universally unique identifier */
  UUID: { input: string; output: string; }
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  contains?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  eq?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Date']['input']>>;
  contains?: InputMaybe<Array<Scalars['Date']['input']>>;
  eq?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Date']['input']>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  contains?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  eq?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Float']['input']>>;
  contains?: InputMaybe<Array<Scalars['Float']['input']>>;
  eq?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Float']['input']>>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Int']['input']>>;
  contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  /** Deletes zero or more records from the `organization_members` collection */
  deleteFromorganization_membersCollection: Organization_MembersDeleteResponse;
  /** Deletes zero or more records from the `organizations` collection */
  deleteFromorganizationsCollection: OrganizationsDeleteResponse;
  /** Deletes zero or more records from the `profiles` collection */
  deleteFromprofilesCollection: ProfilesDeleteResponse;
  /** Deletes zero or more records from the `tenants` collection */
  deleteFromtenantsCollection: TenantsDeleteResponse;
  /** Adds one or more `organization_members` records to the collection */
  insertIntoorganization_membersCollection?: Maybe<Organization_MembersInsertResponse>;
  /** Adds one or more `organizations` records to the collection */
  insertIntoorganizationsCollection?: Maybe<OrganizationsInsertResponse>;
  /** Adds one or more `profiles` records to the collection */
  insertIntoprofilesCollection?: Maybe<ProfilesInsertResponse>;
  /** Adds one or more `tenants` records to the collection */
  insertIntotenantsCollection?: Maybe<TenantsInsertResponse>;
  /** Updates zero or more records in the `organization_members` collection */
  updateorganization_membersCollection: Organization_MembersUpdateResponse;
  /** Updates zero or more records in the `organizations` collection */
  updateorganizationsCollection: OrganizationsUpdateResponse;
  /** Updates zero or more records in the `profiles` collection */
  updateprofilesCollection: ProfilesUpdateResponse;
  /** Updates zero or more records in the `tenants` collection */
  updatetenantsCollection: TenantsUpdateResponse;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromorganization_MembersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Organization_MembersFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromorganizationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OrganizationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromtenantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TenantsFilter>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoorganization_MembersCollectionArgs = {
  objects: Array<Organization_MembersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoorganizationsCollectionArgs = {
  objects: Array<OrganizationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoprofilesCollectionArgs = {
  objects: Array<ProfilesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntotenantsCollectionArgs = {
  objects: Array<TenantsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationUpdateorganization_MembersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Organization_MembersFilter>;
  set: Organization_MembersUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateorganizationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OrganizationsFilter>;
  set: OrganizationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
  set: ProfilesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatetenantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TenantsFilter>;
  set: TenantsUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
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

export type PageInfo = {
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The root type for querying data */
export type Query = {
  email_exists?: Maybe<Scalars['Boolean']['output']>;
  health_current_timestamp?: Maybe<Scalars['Datetime']['output']>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `organization_members` */
  organization_membersCollection?: Maybe<Organization_MembersConnection>;
  /** A pagable collection of type `organizations` */
  organizationsCollection?: Maybe<OrganizationsConnection>;
  /** A pagable collection of type `profiles` */
  profilesCollection?: Maybe<ProfilesConnection>;
  /** A pagable collection of type `tenants` */
  tenantsCollection?: Maybe<TenantsConnection>;
  viewer_is_concierge?: Maybe<Scalars['Boolean']['output']>;
  viewer_profile?: Maybe<Profiles>;
  viewer_profile_id?: Maybe<Scalars['UUID']['output']>;
  viewer_tenant_validate?: Maybe<Scalars['Boolean']['output']>;
};


/** The root type for querying data */
export type QueryEmail_ExistsArgs = {
  email_to_check: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryOrganization_MembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Organization_MembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Organization_MembersOrderBy>>;
};


/** The root type for querying data */
export type QueryOrganizationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrganizationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrganizationsOrderBy>>;
};


/** The root type for querying data */
export type QueryProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


/** The root type for querying data */
export type QueryTenantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<TenantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TenantsOrderBy>>;
};


/** The root type for querying data */
export type QueryViewer_ProfileArgs = {
  strict?: InputMaybe<Scalars['Boolean']['input']>;
};


/** The root type for querying data */
export type QueryViewer_Profile_IdArgs = {
  strict?: InputMaybe<Scalars['Boolean']['input']>;
};


/** The root type for querying data */
export type QueryViewer_Tenant_ValidateArgs = {
  target_tenant_id: Scalars['Int']['input'];
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Array<Scalars['String']['input']>>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Time']['input']>>;
  contains?: InputMaybe<Array<Scalars['Time']['input']>>;
  eq?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Time']['input']>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars['UUID']['input']>>;
  contains?: InputMaybe<Array<Scalars['UUID']['input']>>;
  eq?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export enum Organization_Member_Role {
  Accountant = 'accountant',
  Employee = 'employee',
  Manager = 'manager',
  Owner = 'owner'
}

/** Boolean expression comparing fields on type "organization_member_role" */
export type Organization_Member_RoleFilter = {
  eq?: InputMaybe<Organization_Member_Role>;
  in?: InputMaybe<Array<Organization_Member_Role>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Organization_Member_Role>;
};

export type Organization_Members = Node & {
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  organization_id: Scalars['Int']['output'];
  organization_member_created_at: Scalars['Datetime']['output'];
  organization_member_disabled_at?: Maybe<Scalars['Datetime']['output']>;
  organization_member_role: Organization_Member_Role;
  organization_member_updated_at: Scalars['Datetime']['output'];
  organizations?: Maybe<Organizations>;
  profile_id: Scalars['UUID']['output'];
  profiles?: Maybe<Profiles>;
};

export type Organization_MembersConnection = {
  edges: Array<Organization_MembersEdge>;
  pageInfo: PageInfo;
};

export type Organization_MembersDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organization_Members>;
};

export type Organization_MembersEdge = {
  cursor: Scalars['String']['output'];
  node: Organization_Members;
};

export type Organization_MembersFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Organization_MembersFilter>>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Organization_MembersFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Organization_MembersFilter>>;
  organization_id?: InputMaybe<IntFilter>;
  organization_member_created_at?: InputMaybe<DatetimeFilter>;
  organization_member_disabled_at?: InputMaybe<DatetimeFilter>;
  organization_member_role?: InputMaybe<Organization_Member_RoleFilter>;
  organization_member_updated_at?: InputMaybe<DatetimeFilter>;
  profile_id?: InputMaybe<UuidFilter>;
};

export type Organization_MembersInsertInput = {
  organization_id?: InputMaybe<Scalars['Int']['input']>;
  organization_member_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_member_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_member_role?: InputMaybe<Organization_Member_Role>;
  organization_member_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Organization_MembersInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organization_Members>;
};

export type Organization_MembersOrderBy = {
  organization_id?: InputMaybe<OrderByDirection>;
  organization_member_created_at?: InputMaybe<OrderByDirection>;
  organization_member_disabled_at?: InputMaybe<OrderByDirection>;
  organization_member_role?: InputMaybe<OrderByDirection>;
  organization_member_updated_at?: InputMaybe<OrderByDirection>;
  profile_id?: InputMaybe<OrderByDirection>;
};

export type Organization_MembersUpdateInput = {
  organization_id?: InputMaybe<Scalars['Int']['input']>;
  organization_member_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_member_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_member_role?: InputMaybe<Organization_Member_Role>;
  organization_member_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Organization_MembersUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organization_Members>;
};

export type Organizations = Node & {
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  organization_created_at: Scalars['Datetime']['output'];
  organization_disabled_at?: Maybe<Scalars['Datetime']['output']>;
  organization_id: Scalars['Int']['output'];
  organization_membersCollection?: Maybe<Organization_MembersConnection>;
  organization_name: Scalars['String']['output'];
  organization_slug: Scalars['String']['output'];
  organization_updated_at: Scalars['Datetime']['output'];
  tenant_id: Scalars['Int']['output'];
  tenants?: Maybe<Tenants>;
};


export type OrganizationsOrganization_MembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Organization_MembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Organization_MembersOrderBy>>;
};

export type OrganizationsConnection = {
  edges: Array<OrganizationsEdge>;
  pageInfo: PageInfo;
};

export type OrganizationsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organizations>;
};

export type OrganizationsEdge = {
  cursor: Scalars['String']['output'];
  node: Organizations;
};

export type OrganizationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<OrganizationsFilter>>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<OrganizationsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<OrganizationsFilter>>;
  organization_created_at?: InputMaybe<DatetimeFilter>;
  organization_disabled_at?: InputMaybe<DatetimeFilter>;
  organization_id?: InputMaybe<IntFilter>;
  organization_name?: InputMaybe<StringFilter>;
  organization_slug?: InputMaybe<StringFilter>;
  organization_updated_at?: InputMaybe<DatetimeFilter>;
  tenant_id?: InputMaybe<IntFilter>;
};

export type OrganizationsInsertInput = {
  organization_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_name?: InputMaybe<Scalars['String']['input']>;
  organization_slug?: InputMaybe<Scalars['String']['input']>;
  organization_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_id?: InputMaybe<Scalars['Int']['input']>;
};

export type OrganizationsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organizations>;
};

export type OrganizationsOrderBy = {
  organization_created_at?: InputMaybe<OrderByDirection>;
  organization_disabled_at?: InputMaybe<OrderByDirection>;
  organization_id?: InputMaybe<OrderByDirection>;
  organization_name?: InputMaybe<OrderByDirection>;
  organization_slug?: InputMaybe<OrderByDirection>;
  organization_updated_at?: InputMaybe<OrderByDirection>;
  tenant_id?: InputMaybe<OrderByDirection>;
};

export type OrganizationsUpdateInput = {
  organization_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  organization_name?: InputMaybe<Scalars['String']['input']>;
  organization_slug?: InputMaybe<Scalars['String']['input']>;
  organization_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_id?: InputMaybe<Scalars['Int']['input']>;
};

export type OrganizationsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Organizations>;
};

export type Profiles = Node & {
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  organization_membersCollection?: Maybe<Organization_MembersConnection>;
  profile_created_at: Scalars['Datetime']['output'];
  profile_disabled_at?: Maybe<Scalars['Datetime']['output']>;
  profile_id: Scalars['UUID']['output'];
  profile_name_full?: Maybe<Scalars['String']['output']>;
  profile_onboarded_at?: Maybe<Scalars['Datetime']['output']>;
  profile_updated_at: Scalars['Datetime']['output'];
};


export type ProfilesOrganization_MembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Organization_MembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Organization_MembersOrderBy>>;
};

export type ProfilesConnection = {
  edges: Array<ProfilesEdge>;
  pageInfo: PageInfo;
};

export type ProfilesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesEdge = {
  cursor: Scalars['String']['output'];
  node: Profiles;
};

export type ProfilesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ProfilesFilter>>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ProfilesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ProfilesFilter>>;
  profile_created_at?: InputMaybe<DatetimeFilter>;
  profile_disabled_at?: InputMaybe<DatetimeFilter>;
  profile_id?: InputMaybe<UuidFilter>;
  profile_name_full?: InputMaybe<StringFilter>;
  profile_onboarded_at?: InputMaybe<DatetimeFilter>;
  profile_updated_at?: InputMaybe<DatetimeFilter>;
};

export type ProfilesInsertInput = {
  profile_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_id?: InputMaybe<Scalars['UUID']['input']>;
  profile_name_full?: InputMaybe<Scalars['String']['input']>;
  profile_onboarded_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ProfilesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesOrderBy = {
  profile_created_at?: InputMaybe<OrderByDirection>;
  profile_disabled_at?: InputMaybe<OrderByDirection>;
  profile_id?: InputMaybe<OrderByDirection>;
  profile_name_full?: InputMaybe<OrderByDirection>;
  profile_onboarded_at?: InputMaybe<OrderByDirection>;
  profile_updated_at?: InputMaybe<OrderByDirection>;
};

export type ProfilesUpdateInput = {
  profile_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_id?: InputMaybe<Scalars['UUID']['input']>;
  profile_name_full?: InputMaybe<Scalars['String']['input']>;
  profile_onboarded_at?: InputMaybe<Scalars['Datetime']['input']>;
  profile_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ProfilesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type Tenants = Node & {
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  organizationsCollection?: Maybe<OrganizationsConnection>;
  tenant_created_at: Scalars['Datetime']['output'];
  tenant_disabled_at?: Maybe<Scalars['Datetime']['output']>;
  tenant_id: Scalars['Int']['output'];
  tenant_name: Scalars['String']['output'];
  tenant_slug: Scalars['String']['output'];
  tenant_updated_at: Scalars['Datetime']['output'];
};


export type TenantsOrganizationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrganizationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrganizationsOrderBy>>;
};

export type TenantsConnection = {
  edges: Array<TenantsEdge>;
  pageInfo: PageInfo;
};

export type TenantsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tenants>;
};

export type TenantsEdge = {
  cursor: Scalars['String']['output'];
  node: Tenants;
};

export type TenantsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<TenantsFilter>>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<TenantsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<TenantsFilter>>;
  tenant_created_at?: InputMaybe<DatetimeFilter>;
  tenant_disabled_at?: InputMaybe<DatetimeFilter>;
  tenant_id?: InputMaybe<IntFilter>;
  tenant_name?: InputMaybe<StringFilter>;
  tenant_slug?: InputMaybe<StringFilter>;
  tenant_updated_at?: InputMaybe<DatetimeFilter>;
};

export type TenantsInsertInput = {
  tenant_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_name?: InputMaybe<Scalars['String']['input']>;
  tenant_slug?: InputMaybe<Scalars['String']['input']>;
  tenant_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type TenantsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tenants>;
};

export type TenantsOrderBy = {
  tenant_created_at?: InputMaybe<OrderByDirection>;
  tenant_disabled_at?: InputMaybe<OrderByDirection>;
  tenant_id?: InputMaybe<OrderByDirection>;
  tenant_name?: InputMaybe<OrderByDirection>;
  tenant_slug?: InputMaybe<OrderByDirection>;
  tenant_updated_at?: InputMaybe<OrderByDirection>;
};

export type TenantsUpdateInput = {
  tenant_created_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_disabled_at?: InputMaybe<Scalars['Datetime']['input']>;
  tenant_name?: InputMaybe<Scalars['String']['input']>;
  tenant_slug?: InputMaybe<Scalars['String']['input']>;
  tenant_updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type TenantsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tenants>;
};

export type HealthQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQueryQuery = { health_current_timestamp?: string | null };

export type TenantOrganizationsQueryQueryVariables = Exact<{
  tenantId: Scalars['Int']['input'];
}>;


export type TenantOrganizationsQueryQuery = { organizationsCollection?: { edges: Array<{ node: { organization_id: number, organization_name: string, organization_slug: string } }> } | null };

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

export const HealthQueryDocument = new TypedDocumentString(`
    query HealthQuery {
  health_current_timestamp
}
    `) as unknown as TypedDocumentString<HealthQueryQuery, HealthQueryQueryVariables>;
export const TenantOrganizationsQueryDocument = new TypedDocumentString(`
    query TenantOrganizationsQuery($tenantId: Int!) {
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
    `) as unknown as TypedDocumentString<TenantOrganizationsQueryQuery, TenantOrganizationsQueryQueryVariables>;