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
