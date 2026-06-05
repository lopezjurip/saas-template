---
name: psql-query
description: Run SQL against the local Supabase Postgres for debugging, inspection, and authorized patches. Use when the user asks to query the DB, inspect data, check RLS, run plpgsql diagnostics, or apply manual SQL changes. Reads execute freely; writes require explicit approval.
---

# psql-query — local Postgres queries

## Connection

The local Postgres URL lives in the `DATABASE_URL` env var, injected by Claude Code from `.claude/settings.local.json` (set by `pnpm db:env:development`). Use it directly:

```bash
psql "$DATABASE_URL" -c "select current_database(), current_user;"
```

The DB user `postgres` is the local superuser — RLS is bypassed by default on this connection. To test policies, use `set local role authenticated` + `set local request.jwt.claims to '…'` inside a transaction (see Patterns).

### If `$DATABASE_URL` is empty

The variable is loaded at Claude session start, so a freshly-provisioned workspace may not have it yet. Recover with **either**:

- **One-off (current session):** resolve inline.
  ```bash
  export DATABASE_URL=$(pnpm --filter @packages/supabase exec supabase status -o env 2>/dev/null | awk -F= '/^DB_URL=/{gsub(/"/,"",$2); print $2}')
  ```
- **Persistent (future sessions):** run `pnpm db:env:development` to (re)write `.claude/settings.local.json` and `.env.development.local`, then restart Claude.

If the inline resolver also returns empty, Supabase isn't running — `pnpm db:start` first.

## Always read the schema first

The single source of truth for tables, policies, triggers, helper functions, and grants is:

```
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

Read the relevant sections before composing any non-trivial query. Tip: `Grep` for the table name there instead of `\d` in psql — the file shows comments, constraints, and intent that `\d` strips. Use psql introspection (`\dt`, `\d+ table_name`, `\df viewer_*`, `\dp`) only as a secondary check or when investigating drift between schema file and live DB.

For RLS work also check `packages/supabase/supabase/tests/**/*.test.sql` for pgTAP examples of how callers are mocked.

## Read queries — execute freely

Run without asking when:

- Statement is `SELECT` (including CTEs, `EXPLAIN`, `EXPLAIN ANALYZE` on SELECT), `SHOW`, `\d`/`\df`/`\dp` meta-commands.
- Calling only `IMMUTABLE` or `STABLE` functions (most `viewer_*` helpers, `now()`, `jsonb_*`, `auth.uid()`, formatting/cast helpers).
- Wrapped in `begin; … rollback;` — even mutating statements are safe when the transaction is guaranteed to roll back. Use this pattern to dry-run a write and inspect what it would have touched.

```bash
psql "$DATABASE_URL" -c "select tenant_id, count(*) from public.organizations group by 1;"

# Multi-line: heredoc
psql "$DATABASE_URL" <<'SQL'
explain analyze
select * from public.memberships m
join public.profiles p on p.profile_id = m.profile_id
where m.organization_id = 1;
SQL

# Dry-run a write to see what it would change
psql "$DATABASE_URL" <<'SQL'
begin;
update public.profiles set onboarded = true where profile_id = '...';
select profile_id, onboarded from public.profiles where profile_id = '...';
rollback;
SQL
```

## Write operations — require approval

A write is anything that persists state past commit:

- DML: `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `TRUNCATE`, `COPY ... FROM`.
- DDL: `CREATE`, `ALTER`, `DROP`, `GRANT`, `REVOKE`, `COMMENT`, `REFRESH MATERIALIZED VIEW`.
- Calling a `VOLATILE` function with observable side effects (most `auth.admin_*`, anything that mutates a table, `setval`, advisory locks held past txn).
- Sequence mutation (`setval`, `nextval` when persisted).
- Any `SECURITY DEFINER` function unless you have read its body and confirmed it's pure read.

**Before running a write you must:**

1. Show the exact SQL to the user.
2. State the affected scope in one line: rows targeted (with a `select count(*)` from the same `WHERE`), tables, irreversibility.
3. Wait for explicit approval — accepted phrases: "ok", "go", "approve", "yes", "dale". A thumbs-up emoji counts. Silence does not.
4. Prefer `begin; … commit;` with a guard query inside the transaction (`select` the rows you just changed) so you can show the diff before commit.

**Per-session approval:** if the user says "approved for this session" (or "session approval", "carta blanca", or similar), record that and skip per-action approval for writes for the rest of the conversation. Still show the SQL before each run. The approval does not carry across sessions.

**Always require fresh approval, even mid-session:**

- `DROP`, `TRUNCATE`, `DELETE` without a `WHERE`, `ALTER TABLE ... DROP COLUMN`, anything touching `auth.*` or `storage.*` schemas, anything inside a function marked `SECURITY DEFINER` that mutates, and any statement affecting >1000 rows.

**Schema changes belong in the migration file, not ad-hoc psql.** If the change should persist across `pnpm db:reset`, edit `00000000000000_schema.sql` and reset instead of patching the live DB. Only use direct DDL for one-off diagnostic objects (a temp view, an `EXPLAIN`-only index) that you also drop in the same session.

## Patterns

### Impersonate an authenticated user (test RLS)

```bash
psql "$DATABASE_URL" <<'SQL'
begin;
set local role authenticated;
set local request.jwt.claims to '{"sub":"<profile_uuid>","app_metadata":{"tenants":[{"id":1,"slug":"acme"}],"organizations":[{"id":1}]}}';
select * from public.organizations;  -- now filtered by RLS
rollback;
SQL
```

### Inspect a viewer_* helper

```bash
psql "$DATABASE_URL" -c "\df+ public.viewer_has_permission"
```

### Tail recent rows from a table

```bash
psql "$DATABASE_URL" -c "select * from public.memberships order by created_at desc limit 20;"
```

### Run a `.sql` file

```bash
psql "$DATABASE_URL" -f path/to/file.sql
```

## When psql is the wrong tool

- **Repeatable schema changes** → edit the migration file, `pnpm db:reset`, `pnpm generate:types`.
- **Type-safe app queries** → use the Supabase client / GraphQL via `@packages/graphy`. psql is for debugging and one-off patches, not application code.
- **RLS test you want to keep** → write it as pgTAP under `packages/supabase/supabase/tests/` and run with `pnpm test:db`.
- **Bulk data load** → use `\copy` from a vetted CSV, not 10k individual `INSERT`s.

## Output etiquette

- For wide tables, prefer `\x on` (expanded display) or `select` only the columns you need.
- Limit ad-hoc selects to `limit 50` unless the user asked for the full set — long psql output bloats context.
- When showing query results to the user, paste only the rows that matter; don't dump the whole table.
