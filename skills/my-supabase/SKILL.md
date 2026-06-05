---
name: my-supabase
description: Supabase database design, SQL patterns, RLS policies, and generated type conventions.
---

# Supabase: Database Design & SQL Patterns

## Naming Conventions

**Tables & Columns:** `snake_case` only (no hyphens — breaks PostgreSQL/GraphQL introspection)
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Foreign keys:** Column ends with `_id`, references the table by id
```sql
user_id BIGINT REFERENCES users(id)
post_id BIGINT REFERENCES posts(id)
```

## Multi-Tenancy Pattern

Two-level model: **tenants** (billing/customer) + **organizations** (operating units)

```sql
CREATE TABLE tenants (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  UNIQUE (organization_id, user_id)
);
```

Every tenant-scoped table carries denormalized `tenant_id` for cheap filtering:
```sql
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  -- Index for RLS
  UNIQUE (tenant_id, id)
);

CREATE INDEX idx_posts_tenant ON posts(tenant_id);
CREATE INDEX idx_posts_organization ON posts(organization_id);
```

## Row-Level Security (RLS)

Enable RLS per table:
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

Use `viewer_*` SQL functions for checking auth state:

```sql
-- Allow users to view posts in their organization
CREATE POLICY posts_org_select ON posts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM members
      WHERE user_id = auth.uid()
    )
  );

-- Allow insert only if user is in the org
CREATE POLICY posts_org_insert ON posts FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM members
      WHERE user_id = auth.uid()
    )
  );

-- Allow update/delete by author only
CREATE POLICY posts_author_update ON posts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY posts_author_delete ON posts FOR DELETE
  USING (user_id = auth.uid());
```

## Timestamps

Always use `TIMESTAMP WITH TIME ZONE`:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

Never use `TIMESTAMP` without timezone — causes confusion across regions.

## Type Generation

After schema changes, regenerate types:
```bash
pnpm db:reset    # Apply migrations
pnpm generate:types  # Run codegen → src/types.ts
```

Generated `Database` type is your source of truth:
```typescript
import type { Database } from "~/supabase.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
```

## Common Patterns

### Soft Deletes

```sql
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  deleted_at TIMESTAMP WITH TIME ZONE,
  -- ...
);

-- RLS: exclude soft-deleted rows
CREATE POLICY posts_not_deleted ON posts FOR SELECT
  USING (deleted_at IS NULL);

-- Soft delete function
CREATE FUNCTION soft_delete_post(post_id BIGINT) RETURNS void AS $$
BEGIN
  UPDATE posts SET deleted_at = now() WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Audit Trails

```sql
CREATE TABLE post_audit_log (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  changed_fields JSONB,
  changed_by BIGINT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT now()
);

-- Trigger on update
CREATE FUNCTION audit_post_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO post_audit_log (post_id, action, changed_fields, changed_by)
  VALUES (NEW.id, 'UPDATE', jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_audit AFTER UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION audit_post_change();
```

### Denormalization for Performance

Cache counts in parent tables:
```sql
CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  post_count BIGINT DEFAULT 0,
  -- ...
);

-- Update count on insert
CREATE FUNCTION increment_organization_post_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations SET post_count = post_count + 1 WHERE id = NEW.organization_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_count_increment AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION increment_organization_post_count();
```

## Permissions

Grant roles by operation type:
```sql
-- Public endpoint (anon role)
GRANT SELECT ON users TO anon;

-- Authenticated users
GRANT SELECT, INSERT, UPDATE ON posts TO authenticated;
GRANT SELECT ON organizations TO authenticated;

-- Service role (backend only)
-- All permissions via service key
```
