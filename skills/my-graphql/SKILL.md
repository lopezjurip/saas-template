---
name: my-graphql
description: Repository-specific pg_graphql operation patterns, naming, colocation, generated document use, and Supabase GraphQL limitations. Use when writing or changing GraphQL queries, mutations, fragments, or SQL exposed through pg_graphql.
---

# GraphQL Operations

Endpoint: Supabase `pg_graphql` at `/graphql/v1`. Generated `gql`:

```ts
import { gql } from "~/generated/graphql";
```

Codegen workflow belongs to `my-graphql-codegen`. Runtime belongs to `my-graphy`.

## Colocation

Page-only operation stays in page:

```ts
const HomePickerPageQuery = gql(`
  query HomePickerPageQuery {
    viewer_organizations(
      filter: { organization_disabled_at: { is: NULL } }
      orderBy: [{ organization_name: AscNullsLast }]
    ) {
      edges {
        node {
          organization_id
          organization_name
          tenants { tenant_slug tenant_name }
        }
      }
    }
  }
`);
```

Reusable server query lives in `hooks/get-*.ts`; reusable client query in `hooks/use-*.ts`.
Do not create generic query barrels.

## Reusable hook pattern (`get-*` / `use-*`)

All `viewer_*` collection hooks expose full pagination variables. Server hooks use
`VariablesOf` for the options type; client hooks pass them straight through to `useGraphyQuery`.
Defaults (e.g. `first: 250`, default filter/orderBy) live inside the function, spread before
`...options` so callers can override any field:

```ts
// Server (hooks/get-viewer-organizations.ts)
export const ViewerOrganizationsGet = /*#__PURE__*/ gql(`
  query ViewerOrganizationsGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: organizationsFilter
    $orderBy: [organizationsOrderBy!]
  ) {
    organizations: viewer_organizations(
      first: $first  last: $last  after: $after  before: $before
      filter: $filter  orderBy: $orderBy
    ) { edges { node { ...Fragment } } }
  }
`);

type Vars = VariablesOf<typeof ViewerOrganizationsGet>;

export const getViewerOrganizations = cache(async (options?: Vars) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationsGet, variables: options ?? {} });
});

// Client (hooks/use-viewer-organizations.ts)
export function useViewerOrganizations(options?: Vars, config?: SWRConfiguration<Data>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerOrganizationsUse, variables: options ?? {} } : null, config);
}
```

For by-id / by-slug singular lookups expose `getViewerXByIdAssert` / `getViewerXBySlugAssert`
variants that call `notFound()` when the record is missing.

`agency_id` is UUID (`string`), not `int` — do not copy `int` signatures from tenant/org hooks.

## Naming

Operation names globally unique. Current suffixes:

- Page: `HomePickerPageQuery`
- Server helper: `ViewerOrganizationsGet`
- Client hook: `ViewerOrganizationsUse`
- Component mutation: `ProfileSectionUpdateNameMutation`

Fragments follow consumer namespace:

```ts
export const ViewerOrganizationGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationGetFragment on organizations {
    organization_id
    tenant_id
    organization_slug
    organization_name
  }
`);
```

Use fragments when reused or when exporting `ResultOf` shape.

## Server operation

```ts
const graphy = await getGraphySession();
const { data, error } = await graphy.query({
  query: ViewerOrganizationByIdGetQuery,
  variables: { organization_id },
});
if (error) throw error;
const organization = data["viewer_organization_by_id"];
```

External result fields use bracket notation.

## Client operation

```ts
const { data: user } = useSupabaseUser();
return useGraphyQuery(
  user
    ? { query: ViewerOrganizationsHookQuery, variables: { tenant_id } }
    : null,
  config,
);
```

Mutations:

```ts
const [, updateName] = useGraphyMutation(ProfileSectionUpdateNameMutation);
const { error } = await updateName({ profile_id, profile_name_full });
```

## pg_graphql shapes

- Tables: `tableCollection`, Relay `edges/node/pageInfo`.
- Insert: `insertIntotableCollection(objects: ...)`.
- Update/delete: pass `atMost`, `filter`, and `set` where required.
- SQL functions become root fields, e.g. `viewer_organization_by_id(...)`.
- Relationships follow DB foreign keys.

## SQL compatibility

- No hyphens in identifiers or enum values. One invalid enum can break whole introspection.
- External literals containing hyphens: `text` + `check`.
- Grant table privileges to `anon` when GraphQL requires schema visibility; RLS still gates rows.
- Prefer `viewer_*` functions/views for viewer-scoped reads.
- GraphQL lacks `ON CONFLICT`; use typed Supabase SDK for required upserts. Passkey challenge upsert is canonical example.
- Supabase Auth Admin APIs are not GraphQL; use service-role SDK.

## Type extraction

```ts
import type { ResultOf } from "@graphql-typed-document-node/core";

export type ViewerOrganization =
  ResultOf<typeof ViewerOrganizationGetFragment>;
```

Do not edit `apps/platform/generated/graphql/**` manually.
