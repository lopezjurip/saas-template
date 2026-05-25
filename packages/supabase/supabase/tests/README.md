# Database tests (pgTAP)

These tests run inside Postgres via [pgTAP](https://pgtap.org/) and verify SQL-layer behavior: RLS policies, security-definer functions (`viewer_*`), triggers, and the JWT-issuing hook (`user_auth_hook`). The runner is `supabase test db`, which spawns `pg_prove` in Docker and points it at the local DB.

## Running

Bring Supabase up first (`pnpm db:start`), then from the repo root:

```
pnpm test:db
```

The tests run against the same local DB as `pnpm dev` and the seed (`packages/supabase/supabase/seed.sql`). Each test file wraps itself in `begin; … rollback;` so it leaves no trace — running tests is safe even with the dev app open.

## Conventions

- One concern per file; name with `<topic>.test.sql`.
- Wrap the whole file in `begin; … rollback;`. Never commit.
- Mock the caller's JWT with `set local request.jwt.claims to '…'::jsonb::text;` AND `set local role authenticated;`. **Without `set local role`, you remain `postgres` and RLS is bypassed silently — your test will pass for the wrong reason.**
- Reuse the seeded users (`alice@humane.test` = `00000000-0000-0000-0000-00000000a11c`, `bob@humane.test` = `00000000-0000-0000-0000-00000000b00b`). If you need a third user, insert with a UUID outside the seed range so re-runs are idempotent.
- Use `select plan(N);` up top and `select * from finish();` at the bottom.
