---
name: humane-graphql
description: GraphQL patterns for Humane React/Next.js codebase. Use when writing queries, mutations, fragments, or when GraphQL/data-fetching are mentioned.
---

# GraphQL Patterns - Humane

## Stack

| Layer | Package |
|---|---|
| GraphQL client | `@packages/graphy` |
| Supabase GraphQL endpoint | `{NEXT_PUBLIC_SUPABASE_URL}/graphql/v1` |
| Type generation | `@graphql-codegen/client-preset` — `pnpm generate:graphql:tenant` |
| SWR hooks | `useGraphyQuery` / `useGraphyMutation` from `@packages/graphy/react` |

## Quick Start (Server Component)

Each app has `lib/graphy/graphy.server.ts` with `GRAPHY_SERVER_ANON_CREATE`. Always use it — don't instantiate `GraphyClientSupabase` directly.

```tsx
import { gql } from "~/generated/graphql";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { GRAPHY_SERVER_ANON_CREATE } from "~/lib/graphy/graphy.server";

const MyQuery = gql(`
  query MyQuery($tenantId: Int!) {
    thingsCollection(filter: { tenant_id: { eq: $tenantId } }) {
      edges { node { thing_id name } }
    }
  }
`);

type MyQueryType = ResultOf<typeof MyQuery>;

export default async function MyPage() {
  const { data: { session } } = await supabase.auth.getSession();
  const graphy = GRAPHY_SERVER_ANON_CREATE(session);
  const { data } = await graphy.query({ query: MyQuery, variables: { tenantId } });
}
```

## Quick Start (Client Component with SWR)

```tsx
import { gql } from "~/generated/graphql";
import { useGraphyQuery } from "@packages/graphy/react";

const ViewerOrgs = gql(`
  query ViewerOrgs {
    organizationsCollection {
      edges { node { organization_id organization_name } }
    }
  }
`);

function OrgList() {
  const { data, isLoading, error } = useGraphyQuery({ query: ViewerOrgs });
  if (isLoading) return <div>Cargando...</div>;
  return <ul>{data?.organizationsCollection?.edges.map(e => <li key={e.node.organization_id}>{e.node.organization_name}</li>)}</ul>;
}
```

## Setup

`apps/tenant` is fully wired. To add to another app:

1. **Install codegen deps** (in the app):
   ```bash
   pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/introspection @graphql-codegen/schema-ast graphql dotenv
   ```

2. **Copy `apps/tenant/graphql.config.ts`** and adjust paths for the new app.

3. **Add generate scripts** to app `package.json`:
   ```json
   "generate:graphql": "graphql-codegen -c graphql.config.ts",
   "generate:graphql:local": "graphql-codegen -c graphql.config.ts --local"
   ```

4. **Add root shortcut** to root `package.json`:
   ```json
   "generate:graphql:<app>": "pnpm --filter @apps/<app> run generate:graphql"
   ```

## Query Colocation

**CRITICAL**: Queries must never be in standalone files. Define `gql(...)` in the **same file** that uses it.

```tsx
// ✅ apps/tenant/app/admin/empleados/page.tsx — query lives here
const AdminEmpleadosPageQuery = gql(`
  query AdminEmpleadosPageQuery($tenantId: Int!) {
    empleadosCollection(filter: { tenant_id: { eq: $tenantId } }) {
      edges { node { empleado_id nombre } }
    }
  }
`);

// ❌ Never extract to lib/graphql/empleados.ts and import it
import { AdminEmpleadosPageQuery } from "~/lib/graphql/empleados";
```

## Operation Naming

**CRITICAL**: Every GraphQL operation must have a **unique name** across the entire application.

```tsx
// ✅ Good — unique, descriptive
const AdminContratosListPageQuery = /*#__PURE__*/ gql(`
  query AdminContratosListPageQuery {
    empleados {
      id
      nombre
    }
  }
`);

// ❌ Bad — generic, may conflict
const EmpleadosQuery = /*#__PURE__*/ gql(`
  query EmpleadosQuery {
    empleados { id }
  }
`);
```

**Pattern**: `{PageOrComponent}{Feature}Query` / `{PageOrComponent}{Feature}Mutation`

## Queries with useGraphyQuery (once wired)

```tsx
// Basic query
const { data, isLoading, error, isValidating, mutate } = useGraphyQuery({
  query: MyQuery,
});

// Query with variables — do NOT wrap variables in useMemo
const { data } = useGraphyQuery({
  query: EmpleadoById,
  variables: { id: empleado_id },
});

// Public/unauthenticated query
const { data } = useGraphyQuery({
  query: PublicProfile,
  variables: { profile_id },
  indifferent: true,
});

// Conditional query (pause when not ready)
const { data } = useGraphyQuery(
  empleado_id
    ? { query: EmpleadoById, variables: { id: empleado_id } }
    : null,
);
```

## Mutations with useGraphyMutation (once wired)

```tsx
import { useGraphyMutation } from "~/hooks/use-graphy";

const ActualizarEmpleado = /*#__PURE__*/ gql`
  mutation ActualizarEmpleado($id: UUID!, $nombre: String!) {
    update_empleados_by_pk(pk_columns: { id: $id }, _set: { nombre: $nombre }) {
      id
      nombre
    }
  }
`;

function FormEmpleado() {
  const [{ data, error, isValidating }, mutate] = useGraphyMutation(ActualizarEmpleado);

  const handleSubmit = async () => {
    const result = await mutate(
      { id: "...", nombre: "Nuevo Nombre" },
      { thrownOnError: true },
    );
    if (result.error) console.error(result.error);
  };

  return <button onClick={handleSubmit}>Guardar</button>;
}
```

## Direct client usage (Server Actions / scripts)

```ts
import { GRAPHY_SERVER_ANON_CREATE } from "~/lib/graphy/graphy.server";
import { isGraphyNetworkError, isGraphyResponseError, isGraphyGraphQLError } from "@packages/graphy/graphy";

export async function serverAction(session: { access_token?: string | null } | null) {
  const client = GRAPHY_SERVER_ANON_CREATE(session);

  const { data, error } = await client.query({ query: MyQuery, variables: {} });

  if (error) {
    if (isGraphyNetworkError(error)) { /* network down */ }
    if (isGraphyResponseError(error)) { /* 4xx/5xx */ }
    if (isGraphyGraphQLError(error)) { /* schema/resolver error */ }
  }
}
```

## Fragments

```tsx
import type { ResultOf } from "@graphql-typed-document-node/core";

export const EmpleadoFragment = /*#__PURE__*/ gql`
  fragment EmpleadoFragment on empleados {
    empleado_id: id
    nombre
    rut
    cargo
  }
`;

export type EmpleadoFragmentType = /*#__PURE__*/ ResultOf<typeof EmpleadoFragment>;

// Use in query
const EmpleadosListQuery = /*#__PURE__*/ gql`
  query EmpleadosListQuery {
    empleados {
      ...EmpleadoFragment
    }
  }
`;
```

## Error Handling

```tsx
import type {
  GraphyError,
  GraphyNetworkError,
  GraphyResponseError,
  GraphyGraphQLError,
} from "@packages/graphy/graphy";

const { error } = useGraphyQuery({ query: MyQuery });

if (error) {
  if (error.type === "network") {
    // No se pudo conectar al servidor
  } else if (error.type === "response") {
    // Servidor devolvió error HTTP (error.status)
  } else if (error.type === "graphql") {
    // Error en el schema/resolver (error.errors)
  }
}
```

## Scalar Types

| GraphQL | TypeScript | Notes |
|---------|------------|-------|
| `BigInt` | `string` | Large integers |
| `BigFloat` | `string` | Large decimals |
| `UUID` | `string` | UUID v7 |
| `numeric` | `string` | e.g. montos |
| `timestamptz` | `string` | ISO 8601 |

## Column Aliasing

```tsx
const ViewerProfile = /*#__PURE__*/ gql`
  query ViewerProfile {
    viewer_profile {
      profile_id: id       # alias id → profile_id
      profile_email: email
    }
  }
`;
```

## Cursor Pagination (server-side / scripts)

```ts
import { GRAPHY_ITER_CURSOR } from "@packages/graphy/graphy-iter";

const client = GraphyClientSupabase(access_token);

for await (const { edge, i } of GRAPHY_ITER_CURSOR<EmpleadoNode>(
  client,
  EmpleadosConnection,
  { filter: { activo: { eq: true } } },
  { collectionKey: "empleadosCollection", size: 100 },
)) {
  console.log(edge.node);
}
```

## GraphQL Mutations require table UPDATE grant

Supabase only generates `updateXxxCollection` mutations for tables where `anon` has UPDATE permission.

**Symptom:** `updateXxxCollection` missing from generated types.

**Fix:** Add `update` to the table grant in `packages/supabase/supabase/migrations/00000000000000_schema.sql`:

```sql
-- Before:
grant select, insert on table public.empleados to anon, authenticated;

-- After:
grant select, insert, update on table public.empleados to anon, authenticated;
```

Then: `pnpm db:reset && pnpm generate:types`

## Quick Reference

| Need | Pattern |
|------|---------|
| **Query** | `const Q = /*#__PURE__*/ gql(\`query UniqueName { ... }\`)` |
| **Mutation** | `const M = /*#__PURE__*/ gql(\`mutation Name($v: T) { ... }\`)` |
| **Fragment** | `const F = /*#__PURE__*/ gql(\`fragment F on Type { ... }\`)` |
| **Use query** | `useGraphyQuery({ query: Q, variables })` |
| **Use mutation** | `const [state, mutate] = useGraphyMutation(M)` |
| **Pause query** | `useGraphyQuery(condition ? { query: Q } : null)` |
| **Server Component** | `new GraphyClientSupabase(url, key, token).query({ query: Q })` |
| **Pagination** | `GRAPHY_ITER_CURSOR(client, Q, vars, { collectionKey })` |
| **Column alias** | `profile_id: id` |
| **Generate types** | `pnpm generate:graphql:tenant` (or `generate:graphql:tenant:local`) |
