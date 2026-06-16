---
name: my-graphql-codegen
description: Repository-specific two-stage GraphQL schema and operation code generation. Use after SQL/pg_graphql changes, GraphQL operation edits, generated type errors, or schema introspection failures.
---

# GraphQL Codegen

Two stages. Always use pnpm.

## Files

- Schema config: `packages/supabase/graphql.config.ts`
- Schema outputs: `packages/supabase/generated/graphql/graphql.schema.{json,graphql}`
- Operation config: `apps/platform/graphql.config.ts`
- Operation outputs: `apps/platform/generated/graphql/**`

## Normal workflow

After SQL changes:

```bash
pnpm db:reset
pnpm generate:types
pnpm generate:graphql:schema
pnpm --filter @apps/platform run generate:graphql
```

Schema-only **reformat** from the checked-in JSON (no DB introspection):

```bash
pnpm generate:graphql:schema:local
```

> ⚠️ **`:local` will NOT pick up new DB objects.** It only re-emits the SDL from the
> already-committed `graphql.schema.json`. If you just added/changed an RPC, table, or column and
> run `:local`, the new GraphQL fields are silently missing and the matching `gql()` doc fails to
> generate. After any schema change you must run the **live** `pnpm generate:graphql:schema` (it
> introspects the running DB via the `/graphql/v1` HTTP endpoint), then `pnpm generate:types`.
> Canonical order: `db:reset` → `generate:graphql:schema` → `generate:types` → operations.

Operation-only changes (no SQL touched):

```bash
pnpm --filter @apps/platform run generate:graphql
```

Do not use npm, ad hoc output paths, or redirect generated output manually.

> **Note:** `pnpm generate:graphql:platform` is NOT a valid root command — always use the
> `--filter @apps/platform` form above.

## Stage 1: schema

`packages/supabase/graphql.config.ts` loads app env. Default introspects:

```ts
const href_graphql = `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`;
```

with anon `apiKey`. It writes introspection JSON + sorted SDL. `--local` reads existing JSON;
it does not introspect DB.

**Prerequisite:** `apps/platform/.env.local` must exist with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. The config loads env from that path via `@next/env`. If
missing, URL resolves as `undefined` and introspection silently fails with "Unable to find any
GraphQL type definitions for `undefined/graphql/v1`".

If introspection suddenly returns empty/broken schema, inspect SQL names first. pg_graphql
requires names matching `[_a-zA-Z0-9]`; hyphenated enum value can break entire schema.

## Exposing an RPC as a query / mutation

pg_graphql surfaces a `public` function on `Query` or `Mutation` automatically — no comment
directive needed. The rules that actually decide whether (and where) it shows up:

- **Volatility picks the field's home.** `stable`/`immutable` → `Query`; `volatile` → `Mutation`.
  Mark it **explicitly** `volatile` for a mutation (don't rely on the plpgsql default).
- **Return shape.** To get a single typed row back (so callers can select its columns), return
  `setof public.<table> rows 1` (the `viewer_*_create`/`_update` pattern). It appears as
  `Mutation { viewerThing(arg1: …, arg2: …): <Table> }`; snake args become camelCase.
- **Execute privilege = visibility.** pg_graphql includes a function only if the introspecting
  role can `EXECUTE` it. The default grant is `EXECUTE` to `PUBLIC` (which already includes `anon`
  and `authenticated`), so **do not add** `revoke … from public; grant … to anon, authenticated`
  boilerplate — it's noise. These functions self-guard via an internal `viewer_*` permission
  check, so PUBLIC execute is safe.
- **Call it from the client**, not a pass-through Server Action — `useGraphyMutation(Doc)` (see
  `my-graphy` / AGENTS.md "Client choice").

**Verify exposure before building on it.** After `db:reset` + live `generate:graphql:schema`,
grep the SDL:

```bash
rg 'viewerYourFn' packages/supabase/generated/graphql/graphql.schema.graphql
```

If it's missing there but you expect it, check pg_graphql directly in the DB (this reflects the
truth regardless of the HTTP cache):

```sql
select graphql.resolve('{ __schema { mutationType { fields { name } } } }');
```

If the DB shows it but the regenerated SDL doesn't, you ran `:local` (cached JSON) or the
PostgREST schema cache is stale — run the live `generate:graphql:schema` (or
`notify pgrst, 'reload schema';` then regenerate). Only delete the old Server Action / wire the
client once the field is present in the SDL.

## Stage 2: operations

Platform config reads schema JSON and scans:

```ts
documents: ["./{app,components,hooks,lib}/**/*.{graphql,ts,tsx}"]
```

Client preset settings matter:

```ts
{
  fragmentMasking: false,
  gqlTagName: "gql",
  documentMode: "string",
  strictScalars: true,
  skipTypename: true,
  dedupeFragments: true
}
```

Scalars:

- `Int`, `Float` -> `number`
- `BigInt`, `BigFloat` -> `string`
- `Cursor`, `Opaque`, `Time`, `Date`, `Datetime`, `UUID` -> `string`
- `JSON` -> `string` in current config

## Rules

- Every operation name globally unique.
- Import generated `gql` from `~/generated/graphql`.
- Generated files are committed, never manually edited.
- SQL schema change requires both Supabase types and GraphQL schema regeneration.
- Operation change requires platform generation before typecheck.
- If `gql("...")` returns `unknown`, operation text differs from generated registry. Regenerate.
- Validate with `pnpm build:dry`.
