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
pnpm generate:graphql:platform
```

Schema-only local regeneration from checked-in JSON:

```bash
pnpm generate:graphql:schema:local
```

Operation-only changes:

```bash
pnpm generate:graphql:platform
```

Do not use npm, ad hoc output paths, or redirect generated output manually.

## Stage 1: schema

`packages/supabase/graphql.config.ts` loads app env. Default introspects:

```ts
const href_graphql = `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`;
```

with anon `apiKey`. It writes introspection JSON + sorted SDL. `--local` reads existing JSON;
it does not introspect DB.

If introspection suddenly returns empty/broken schema, inspect SQL names first. pg_graphql
requires names matching `[_a-zA-Z0-9]`; hyphenated enum value can break entire schema.

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
