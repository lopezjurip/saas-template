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

## Schema-level configuration

The schema comment in `packages/supabase/supabase/migrations/00000000000000_schema.sql`:

```sql
comment on schema public is e'@graphql({"inflect_names": true, "max_rows": 250})';
```

**`inflect_names: true`** — pg_graphql converts all SQL identifiers to GraphQL conventions:

| SQL | GraphQL |
|---|---|
| `organization_name` (field) | `organizationName` |
| `organizations` (table → type) | `Organizations` |
| `viewer_organizations` (function) | `viewerOrganizations` |
| `organizationsFilter` (arg type) | `OrganizationsFilter` |
| `organizationsOrderBy!` (arg type) | `OrganizationsOrderBy!` |
| `insertIntoorganizationsCollection` | `insertIntoOrganizationsCollection` |

**FK relationship naming**: singular FK (one-to-one) becomes singular field; plural (one-to-many) becomes plural. Example: `organizations → tenants` is a singular FK, so it becomes `tenant` (singular), not `tenants`. Always verify FK cardinality when adding relationship fields.

**`max_rows: 250`** — schema-wide connection page cap. Per-table override is not yet supported (needs pg_graphql ≥ 1.5.12; Supabase local bundles 1.5.11). Do not add per-table `max_rows` comments yet.

## totalCount and aggregate

All 26 public tables have `totalCount` and `aggregate` enabled:

```sql
comment on table public.organizations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
```

When adding a new table, always add this comment. In GraphQL:

```graphql
query {
  viewerOrganizations {
    totalCount
    aggregate {
      count
    }
    edges { node { organizationId organizationName } }
  }
}
```

## Colocation

Page-only operation stays in page:

```ts
const HomePickerPageQuery = gql(`
  query HomePickerPageQuery {
    viewerOrganizations(
      filter: { organizationDisabledAt: { is: NULL } }
      orderBy: [{ organizationName: AscNullsLast }]
    ) {
      edges {
        node {
          organizationId
          organizationName
          tenant { tenantSlug tenantName }
        }
      }
    }
  }
`);
```

Reusable server query lives in `hooks/get-*.ts`; reusable client query in `hooks/use-*.ts`.
Do not create generic query barrels.

## Reusable hook pattern (`get-*` / `use-*`)

All `viewer*` collection hooks expose full pagination variables. Server hooks use
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
    $filter: OrganizationsFilter
    $orderBy: [OrganizationsOrderBy!]
  ) {
    organizations: viewerOrganizations(
      first: $first  last: $last  after: $after  before: $before
      filter: $filter  orderBy: $orderBy
    ) { edges { node { ...ViewerOrganizationGetFragment } } }
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

`agencyId` is UUID (`string`), not `int` — do not copy `int` signatures from tenant/org hooks.

## Naming

Operation names globally unique. Current suffixes:

- Page: `HomePickerPageQuery`
- Server helper: `ViewerOrganizationsGet`
- Client hook: `ViewerOrganizationsUse`
- Component mutation: `ProfileSectionUpdateNameMutation`

Fragments follow consumer namespace, reference pg_graphql type name (PascalCase):

```ts
export const ViewerOrganizationGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationGetFragment on Organizations {
    organizationId
    tenantId
    organizationSlug
    organizationName
  }
`);
```

Use fragments when reused or when exporting `ResultOf` shape.

## Server operation

```ts
const graphy = await getGraphySession();
const { data, error } = await graphy.query({
  query: ViewerOrganizationByIdGetQuery,
  variables: { organizationId: organization_id },
});
if (error) throw error;
const organization = data["viewerOrganizationById"];
```

External result fields use bracket notation. Variable names in `gql` operations ($camelCase) must
match the generated schema argument names — always check SDL after codegen.

## Client operation

```ts
const { data: user } = useSupabaseUser();
return useGraphyQuery(
  user
    ? { query: ViewerOrganizationsHookQuery, variables: { tenantId: tenant_id } }
    : null,
  config,
);
```

Mutations:

```ts
const [, updateName] = useGraphyMutation(ProfileSectionUpdateNameMutation);
const { error } = await updateName({ profile_id: profileId, profile_name_full: profileNameFull });
```

Variable names in the `variables` object are user-defined; match them to what the gql operation declares.
Field names inside gql strings must be camelCase (matching pg_graphql inflection).

For a viewer-scoped SQL mutation that creates one row, select fields from the returned object:

```graphql
mutation CreateTenant($tenant_name: String!, $tenant_slug: String!) {
  tenant: viewerTenantCreate(
    tenantName: $tenant_name
    tenantSlug: $tenant_slug
  ) {
    tenantId
    tenantSlug
  }
}
```

## pg_graphql shapes

- Tables: `<Table>Collection` → Relay `edges/node/pageInfo` + `totalCount` + `aggregate`.
- Insert: `insertInto<Table>Collection(objects: [...])`.
- Update: `update<Table>Collection(filter: ..., set: ...)`.
- Delete: `deleteFrom<Table>Collection(filter: ...)`.
- SQL functions become root fields, e.g. `viewerOrganizationById(...)`.
- An explicitly `volatile` function is exposed on `Mutation`.
- `volatile returns setof public.<table> rows 1` is exposed as a singular nullable
  `<Table>` object (not a connection). Preserve this SQL signature for create RPCs instead of
  returning only the primary-key scalar.
- Relationships follow DB foreign keys; FK cardinality determines singular vs plural field name.

## SQL compatibility

- No hyphens in identifiers or enum values. One invalid enum can break whole introspection.
- External literals containing hyphens: `text` + `check`.
- Grant table privileges to `anon` when GraphQL requires schema visibility; RLS still gates rows.
- Prefer `viewer_*` functions/views for viewer-scoped reads.
- Prefer `useGraphyMutation` for authenticated browser mutations fully contained in one SQL
  transaction. Use a Server Action only for server-only APIs, secrets, trusted service-role
  orchestration, or external side effects.
- GraphQL lacks `ON CONFLICT`; use typed Supabase SDK for required upserts. Passkey challenge upsert is canonical example.
- Supabase Auth Admin APIs are not GraphQL; use service-role SDK.

## Type extraction

```ts
import type { ResultOf } from "@graphql-typed-document-node/core";

export type ViewerOrganization =
  ResultOf<typeof ViewerOrganizationGetFragment>;
```

Do not edit `apps/platform/generated/graphql/**` manually.

## Codegen workflow

After schema changes or adding operations:

```bash
pnpm db:reset          # replay schema + seed (rebuilds pg_graphql introspection)
pnpm generate:types    # regenerate packages/supabase/src/types.ts
pnpm generate:graphql:schema  # pull SDL from local Supabase
pnpm --filter @apps/platform run generate:graphql  # regenerate gql documents + types
pnpm build:dry         # catch TypeScript errors
```

All steps required in order when changing SQL schema. Skipping `generate:graphql:schema` leaves
the SDL stale and codegen may silently pass with wrong field names.
