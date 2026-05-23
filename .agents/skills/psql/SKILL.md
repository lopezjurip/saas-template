---
name: psql
description: "Run SQL against the local Supabase dev DB. Use when the user asks to query, inspect, or debug the database directly. Trigger: /psql"
trigger: /psql
---

# /psql

Direct psql access to the local Supabase development database.

## Connection

```
postgresql://postgres:postgres@127.0.0.1:54422/postgres
```

This is fixed in `packages/supabase/supabase/config.toml` (`[db] port = 54422`).

## Usage examples

```
/psql                              # open a psql shell (interactive)
/psql \dt public.*                 # list all tables in public schema
/psql \dn                          # list schemas
/psql select * from tenants;       # run a query
/psql select count(*) from organization_members;
```

## What you must do when invoked

1. **Check if Supabase is running** before any query — run:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54422/postgres -c "select 1" 2>&1
   ```
   If it fails with "Connection refused", tell the user to run `pnpm db:start` and stop.

2. **Execute the user's SQL or meta-command** using Bash + psql:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54422/postgres \
     --no-password \
     -c "<sql or meta-command>"
   ```
   For multi-statement queries use `-c "..."` once or chain with multiple `-c` flags.
   For `\dt`, `\dn`, `\d tablename`, etc., pass them as the `-c` argument — psql accepts meta-commands that way.

3. **If no SQL was given** (bare `/psql`), print a quick overview:
   - List of non-empty schemas: `select nspname from pg_catalog.pg_namespace order by nspname;`
   - List of tables in `public` and `protected`: `\dt public.* \dt protected.*`

4. **Format output clearly.** Use `--expanded` (`-x`) when rows would be wider than ~120 chars. Use `--csv` only if the user explicitly asks.

5. **Never run destructive DDL** (`DROP`, `TRUNCATE`, `DELETE` without a WHERE, `ALTER ... DROP`) without explicitly confirming with the user first. Schema changes belong in `packages/supabase/supabase/migrations/00000000000000_schema.sql` followed by `pnpm db:reset`.

6. **Service-role context:** For queries that need elevated access (e.g. `protected.*` tables), add `SET ROLE service_role;` before the query in the same `-c` block, or run as `postgres` (the default user in this connection string, which has superuser rights locally — use with care).

## Common inspection queries

```sql
-- All tables with row counts
select schemaname, tablename,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', schemaname, tablename), false, true, '')))[1]::text::int as rows
from pg_tables
where schemaname in ('public','protected','internal','private')
order by schemaname, tablename;

-- RLS policies on a table
select policyname, cmd, qual, with_check from pg_policies where tablename = '<table>';

-- Current grants on internal schema
select grantee, privilege_type from information_schema.role_usage_grants where object_schema = 'internal';

-- Supabase auth users
select id, email, created_at from auth.users order by created_at desc limit 20;
```
