---
name: my-graphy
description: Repository-specific @packages/graphy runtime client, server factories, React SWR hooks, mutations, errors, and pagination. Use when executing generated GraphQL documents.
---

# Graphy Runtime

Imports are direct:

```ts
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { useGraphyMutation, useGraphyQuery } from "@packages/graphy/react";
```

No package barrel.

## Existing factories

- Session server: `apps/platform/lib/graphy/graphy.server.ts`
- Browser: `apps/platform/lib/graphy/graphy.browser.ts`
- Service role: `apps/platform/lib/graphy/graphy.service.ts`
- Provider: `apps/platform/components/graphy-provider.tsx`

Server:

```ts
const graphy = await getGraphySession();
const { data, error } = await graphy.query({
  query: ViewerOrganizationsGetQuery,
  variables: { tenant_id },
});
```

`getGraphySession()` is React `cache()`-wrapped and forwards current access token.

Service role:

```ts
const graphy = getGraphyServiceRole();
```

Use only trusted server code after caller validation. It sends service key as `apikey` and
Bearer token, bypassing RLS.

## Client provider

`GraphyClientProvider` listens to `supabase.auth.onAuthStateChange`, rebuilds client on token
change, and `GraphyProvider` namespaces SWR keys. Root app already wraps provider.

## Query hook

```ts
const result = useGraphyQuery(
  user
    ? { query: ViewerTenantBySlugHookQuery, variables: { tenant_slug } }
    : null,
  config,
);
```

`null` pauses. Cache key includes namespace, URL, token hash, persisted-document hash,
variables. Set `indifferent: true` only for data identical across users; token hash omitted.

## Mutation hook

```ts
const [state, mutate] = useGraphyMutation(UpdateNameMutation);
const { data, error } = await mutate(
  { profile_id, profile_name_full },
  { thrownOnError: true },
);
```

State: `data`, `variables`, `error`, `isValidating`. Graphy does not auto-invalidate related
SWR queries. Call router refresh or SWR mutation deliberately.

Viewer-scoped create RPCs should return the created row from SQL:

```ts
const CreateTenantMutation = gql(`
  mutation CreateTenantMutation($tenant_name: String!, $tenant_slug: String!) {
    tenant: viewer_tenant_create(
      tenant_name: $tenant_name
      tenant_slug: $tenant_slug
    ) {
      tenant_id
    }
  }
`);

const [, createTenant] = useGraphyMutation(CreateTenantMutation);
const { data, error } = await createTenant({ tenant_name, tenant_slug });
const tenant_id = data?.["tenant"]?.["tenant_id"];
```

Use this direct client path when the RPC derives identity from the authenticated JWT and all
work is transactional SQL. Do not add a Server Action merely to proxy the same GraphQL
mutation. A Server Action remains appropriate for auth admin calls, secrets, service-role
workflows, email delivery, or other server-only/external effects.

## Client methods

- `fetch(...)`: returns data, throws Graphy errors.
- `query(...)`: returns `{data,error}` for known Graphy errors.
- `mutate(...)`: alias of `query(...)`.

Errors:

```ts
isGraphyNetworkError(error)
isGraphyResponseError(error, "PGRST301")
isGraphyGraphQLError(error)
```

GraphQL errors arrive with HTTP 200 and become `GraphyGraphQLError`.

## Pagination

Use `@packages/graphy/react-pagination` for headless cursor/offset state. Prefer cursor:

```ts
const [pagination, setPagination] = usePaginationCursorState({ first: 100 });
const { data } = useGraphyQuery({
  query: RowsQuery,
  variables: { ...pagination },
});
const actions = usePaginationCursor(
  data?.["rows"]?.["pageInfo"],
  pagination,
  setPagination,
);
```

For server iteration, use `GRAPHY_ITER_CURSOR` from `@packages/graphy/graphy-iter`.

## Rules

- Generated documents only; do not send raw query strings.
- Read response payload with bracket notation.
- RLS path uses session client. Service role use must be explicit and rare.
- Do not wrap one Graphy call in a new thin hook unless reused.
