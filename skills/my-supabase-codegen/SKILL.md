---
name: my-supabase-codegen
description: Repository-specific Supabase TypeScript type generation workflow, generated Database usage, schema reset sequence, and generated-file rules.
---

# Supabase Type Generation

Generated file:

```text
packages/supabase/src/types.ts
```

Command:

```bash
pnpm generate:types
```

Root command runs:

```bash
pnpm --filter @packages/supabase generate:types
```

Package command:

```bash
supabase gen types --lang=typescript --local --schema public > src/types.ts
```

## Schema workflow

Prototype has one schema file:

```text
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

After change:

```bash
pnpm db:reset
pnpm generate:types
```

If change affects pg_graphql:

```bash
pnpm generate:graphql:schema
pnpm generate:graphql:platform
```

`db:reset` destroys local data, replays schema, then seed. Do not create incremental migration
unless project leaves prototype phase.

## Type use

```ts
import type { Database } from "@packages/supabase/types";

type Membership =
  Database["public"]["Tables"]["organization_memberships"]["Row"];
type MembershipInsert =
  Database["public"]["Tables"]["organization_memberships"]["Insert"];
type ViewerHasPermissionArgs =
  Database["public"]["Functions"]["viewer_has_permission"]["Args"];
```

Client factories already bind `Database`; normal query result inference needs no manual row
type.

## pg_graphql visibility

A table, view, or function only appears in the GraphQL schema if the `anon` role has at
least `SELECT` grant. `authenticated`-only grants are NOT enough — pg_graphql introspects as
`anon`.

```sql
-- Minimum to appear in GraphQL (queries):
grant select on table public.my_table to anon, authenticated;

-- To expose mutations, add the relevant verbs:
grant select, insert, update, delete on table public.my_table to anon, authenticated;
```

RLS policies still gate which rows are actually returned — grants only control schema
visibility. A table with RLS enabled but no anon `SELECT` grant will be invisible to
GraphQL entirely.

## Rules

- Never hand-edit generated file.
- Commit generated file.
- Never use `as any` to hide stale generation.
- Read external DB rows with bracket notation.
- If generated type lacks new object, verify reset succeeded against local DB.
- Type generation covers `public` schema only.
- SQL enum/value naming must remain pg_graphql-compatible.
- If a table vanishes from the GraphQL schema after `db:reset`, check its `grant to anon`.

## Verification

```bash
pnpm format:apply-unsafe
pnpm build:dry
```

Run `pnpm test:db` for RLS/functions/triggers. Generated diff can be large; inspect unexpected
object removal before accepting.
