---
name: my-permissions
description: Capability-based permissions (ACL), membership_permissions table, SQL helpers, and permission checking patterns.
---

# Capability-Based Permissions (ACL)

## Schema

**Permission catalog** (immutable list):

```sql
CREATE TABLE public.permissions (
  id TEXT PRIMARY KEY,  -- e.g. 'posts_create', 'members_delete', 'organization_settings'
  name TEXT NOT NULL,
  description TEXT
);

INSERT INTO permissions (id, name) VALUES
  ('posts_read', 'View posts'),
  ('posts_create', 'Create posts'),
  ('posts_edit', 'Edit own posts'),
  ('members_view', 'View organization members'),
  ('members_manage', 'Add/remove members'),
  ('organization_settings', 'Modify organization settings'),
  ('*', 'Wildcard — all permissions');
```

**User permissions per organization:**

```sql
CREATE TABLE public.membership_permissions (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id),
  granted_at TIMESTAMP DEFAULT now(),
  UNIQUE (organization_id, user_id, permission_id)
);

CREATE INDEX idx_membership_permissions_user_perm
  ON membership_permissions(user_id, permission_id);
```

**Permission presets** (for UI bundles):

```sql
CREATE TABLE public.permission_presets (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- e.g. 'Owner', 'Manager', 'Member'
  permission_ids TEXT[] NOT NULL,
  NULL CHECK (organization_id IS NULL OR organization_id IS NOT NULL),
  UNIQUE (organization_id, name)
);

-- Global presets (org_id = NULL)
INSERT INTO permission_presets (name, permission_ids) VALUES
  ('Owner', ARRAY['*']),
  ('Manager', ARRAY['posts_create', 'posts_edit', 'members_view']),
  ('Member', ARRAY['posts_read', 'posts_create']);
```

## SQL Helper Functions

**Check if user has permission in organization:**

```sql
CREATE FUNCTION public.viewer_has_permission(
  _org_id BIGINT,
  _permission_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has specific permission OR wildcard
  RETURN EXISTS(
    SELECT 1 FROM membership_permissions
    WHERE organization_id = _org_id
      AND user_id = auth.uid()
      AND permission_id IN (_permission_id, '*')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Get all orgs where user has a permission:**

```sql
CREATE FUNCTION public.viewer_permission_org_ids(
  _permission_id TEXT
) RETURNS SETOF BIGINT AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT organization_id
    FROM membership_permissions
    WHERE user_id = auth.uid()
      AND permission_id IN (_permission_id, '*');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Get user's permissions in org:**

```sql
CREATE FUNCTION public.viewer_membership_permissions()
  RETURNS TABLE(organization_id BIGINT, permission_id TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT mp.organization_id, mp.permission_id
    FROM membership_permissions mp
    WHERE mp.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## RLS Policies

**Use `viewer_has_permission()` in policies:**

```sql
-- Create posts (requires 'posts_create')
CREATE POLICY posts_create ON posts FOR INSERT
  WITH CHECK (
    public.viewer_has_permission(organization_id, 'posts_create')
  );

-- Delete posts (requires 'posts_edit' OR is author)
CREATE POLICY posts_delete ON posts FOR DELETE
  USING (
    user_id = auth.uid() OR
    public.viewer_has_permission(organization_id, 'posts_edit')
  );

-- Manage members (requires 'members_manage')
CREATE POLICY members_manage ON membership_permissions FOR ALL
  USING (
    public.viewer_has_permission(organization_id, 'members_manage')
  )
  WITH CHECK (
    public.viewer_has_permission(organization_id, 'members_manage')
  );
```

## Grant/Revoke Permissions

```sql
-- Grant permission
INSERT INTO membership_permissions (organization_id, user_id, permission_id)
VALUES (123, 456, 'posts_create')
ON CONFLICT DO NOTHING;

-- Revoke permission
DELETE FROM membership_permissions
WHERE organization_id = 123
  AND user_id = 456
  AND permission_id = 'posts_create';

-- Add user to org with preset
INSERT INTO membership_permissions (organization_id, user_id, permission_id)
SELECT 123, 456, UNNEST(permission_ids)
FROM permission_presets
WHERE name = 'Manager' AND organization_id IS NULL;
```

## Server-Side Permission Check

```typescript
import { createSupabaseClient } from "~/lib/supabase";

export async function actionDeletePost(postId: number, orgId: number) {
  const supabase = createSupabaseClient();

  // Check permission before attempting delete
  const hasPermission = await supabase.rpc("viewer_has_permission", {
    _org_id: orgId,
    _permission_id: "posts_edit",
  });

  if (!hasPermission) {
    throw new Error("Access denied");
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}
```

## Client-Side Permission Gate

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase-browser";

export function PostManager({ orgId }: { orgId: number }) {
  const supabase = createSupabaseBrowserClient();

  const { data: hasPermission } = useQuery({
    queryKey: ["permission", orgId, "posts_create"],
    queryFn: async () => {
      const result = await supabase.rpc("viewer_has_permission", {
        _org_id: orgId,
        _permission_id: "posts_create",
      });
      return result.data;
    },
  });

  if (!hasPermission) {
    return <div>You don't have permission to create posts.</div>;
  }

  return <CreatePostForm orgId={orgId} />;
}
```

## Wildcard Permission

Special permission `*` grants all checks:

```sql
-- User has '*' for org 123
SELECT viewer_has_permission(123, 'any_permission_id');
-- TRUE (matches wildcard)
```

Useful for org owners — grant `*` instead of enumerating every permission.

## Bulk Operations with Presets

```typescript
export async function actionSetUserRole(
  orgId: number,
  userId: number,
  presetName: string
) {
  const supabase = createSupabaseClient();

  // Get preset permissions
  const { data: preset, error: presetError } = await supabase
    .from("permission_presets")
    .select("permission_ids")
    .eq("name", presetName)
    .eq("organization_id", null)
    .single();

  if (presetError) throw presetError;

  // Remove old permissions
  await supabase
    .from("membership_permissions")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  // Insert new permissions
  const { error } = await supabase.from("membership_permissions").insert(
    preset.permission_ids.map((permId: string) => ({
      organization_id: orgId,
      user_id: userId,
      permission_id: permId,
    }))
  );

  if (error) throw error;

  // Refresh JWT to pick up new claims
  await supabase.auth.refreshSession();
}
```

## Permission Checks in Middleware

```typescript
// middleware.ts
import { createSupabaseClient } from "~/lib/supabase";

export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  const requestPath = new URL(request.url).pathname;

  // Check if path requires permission
  const requiredPerm = getRequiredPermission(requestPath);
  if (!requiredPerm) return NextResponse.next();

  const orgId = getOrgFromRequest(request);
  const hasPermission = await supabase.rpc("viewer_has_permission", {
    _org_id: orgId,
    _permission_id: requiredPerm,
  });

  if (!hasPermission) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}
```

## Audit Trail for Permissions

```sql
CREATE TABLE permission_audit_log (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  user_id BIGINT REFERENCES users(id),
  action TEXT, -- 'granted', 'revoked'
  permission_id TEXT,
  granted_by BIGINT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER log_permission_grant
AFTER INSERT ON membership_permissions
FOR EACH ROW
EXECUTE FUNCTION log_permission_change('granted');

CREATE TRIGGER log_permission_revoke
AFTER DELETE ON membership_permissions
FOR EACH ROW
EXECUTE FUNCTION log_permission_change('revoked');
```

## Capability vs Role

| Aspect | Role | Capability |
|--------|------|-----------|
| **Enforcement** | Checked in code | Enforced at DB (RLS) |
| **Granularity** | Coarse (Manager, Admin) | Fine (posts_edit, members_delete) |
| **Scaling** | Hard to add new perms | Add row to permissions table |
| **User mental model** | "What is my job?" | "What can I do?" |

This design uses **capabilities** — always cheaper to add new capabilities without code changes.
