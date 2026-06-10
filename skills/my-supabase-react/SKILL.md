---
name: my-supabase-react
description: Repository-specific typed Supabase client usage in Next.js server components, server actions, proxy, browser components, auth state, SWR hooks, and tenant-scoped queries.
---

# Supabase in React/Next

Use factories from `@packages/supabase`. Never instantiate app clients elsewhere.

## Server

```ts
import {
  createServerClient,
  getSupabaseServerUser,
  getSupabaseServerUserMetadata,
} from "@packages/supabase/client.server";

const [supabase, user, metadata] = await Promise.all([
  createServerClient(),
  getSupabaseServerUser(),
  getSupabaseServerUserMetadata(),
]);
```

Exports are React `cache()`-wrapped per request. `createServerClient()` uses cookies and anon
key, so RLS applies.

## Browser

```ts
import { createBrowserClient } from
  "@packages/supabase/client.browser";

const supabase = createBrowserClient();
```

For component reuse:

```ts
import { useSupabase, useSupabaseUser } from
  "@packages/supabase/react";

const supabase = useSupabase();
const { data: user } = useSupabaseUser();
```

`useSupabaseUser` uses SWR key `supabase-user`. Do not add thin wrapper for one SDK call.

## User vs metadata

- `getSupabaseServerUser()`: verified persisted auth user.
- `getSupabaseServerSession()`: raw access token.
- `getSupabaseServerUserMetadata()`: decoded + Zod-validated hook claims.

Browser equivalents exist. Never trust `session.user` as validated identity; never expect
hook claims from `auth.getUser()`.

## Tenant-scoped query

RLS is mandatory but app queries still scope tenant:

```ts
const tenant = metadata?.["tenants"]?.find(
  (item) => item["slug"] === tenant_slug,
);
if (!tenant) notFound();

const { data, error } = await supabase
  .from("some_table")
  .select("*")
  .eq("tenant_id", tenant["id"]);
```

For org-scoped data, validate org belongs to active tenant and filter `organization_id`.

## Server action

Use `authedAction` when possible; context already supplies validated `user` + server client:

```ts
export const actionSave = authedAction
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from("profiles")
      .update({ profile_name_full: parsedInput.name })
      .eq("profile_id", user.id);
    if (error) throw error;
  });
```

Exported server action name starts `action`.

## Service role

```ts
import { createServiceRoleClient } from
  "@packages/supabase/client.service";
```

Bypasses RLS. Server-only. Validate caller and permission with RLS client first. Use for auth
admin, bootstrap, cross-row orchestration, or intentionally privileged lookups.

## Auth changes

After mutations affecting JWT claims:

```ts
await supabase.auth.refreshSession();
```

`GraphyClientProvider` listens for auth changes and rebuilds token-scoped Graphy client.

## Realtime

Supabase Realtime is available but no shared repository abstraction exists. If adding:
create channel inside effect, include tenant/org filter when API supports it, validate payload
shape, remove channel on cleanup. Do not cast payload with `as any`.

## Rules

- External rows/payloads: bracket notation.
- `NEXT_PUBLIC_COOKIE_DOMAIN` makes browser/server cookies cross `*.lvh.me`.
- Proxy owns token refresh; server component cookie write failures are intentionally ignored.
- Prefer Graphy for existing typed GraphQL read/mutation patterns; use SDK where GraphQL lacks
  feature, auth API is needed, or current code already uses SDK.
