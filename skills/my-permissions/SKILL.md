---
name: my-permissions
description: Repository-specific capability permissions, membership lifecycle, wildcard grants, RLS helpers, agency grants, admin checks, and pgTAP tests.
---

# Permissions

Capability-based. No role column.

## Schema

- `permissions(permission_id citext, ...)`: catalog; `*` wildcard. Trimmed to English admin
  capabilities only: `*`, `organization_manage`, `members_manage`, `presets_manage`. There is no
  generic non-admin capability anymore (`presets_manage` is the closest stand-in).
- `organization_memberships(organization_membership_id, organization_id, profile_id, invite fields, lifecycle timestamps)`.
- `organization_membership_permissions(organization_membership_id, permission_id)`: grant. Org/profile derive through membership.
- `permission_presets(organization_id?, permission_preset_name, permission_preset_slugs[])`: UX bundle only. Seeded presets are Owner / Administrator / Member manager.

Do not use stale `(organization_id, profile_id, permission_id)` grant shape.

Active membership requires:

```sql
m.profile_id = viewer
and m.organization_membership_accepted_at is not null
and m.organization_membership_revoked_at is null
and m.organization_membership_rejected_at is null
```

## Helpers

Single check:

```ts
const { data, error } = await supabase.rpc("viewer_has_permission", {
  target_organization_id: organization_id,
  target_permission_id: "members_manage",
});
if (error || !data) throw new Error("Access denied");
```

RLS set helper:

```sql
organization_id in (
  select public.viewer_permission_org_ids('organization_manage')
)
```

Use set helper in policies; evaluated as InitPlan. `viewer_has_permission` suits one app-side
check. Both honor `*`.

UI listing: `viewer_organization_membership_permissions()`.

## RLS

Permission table write policy:

```sql
using (
  organization_membership_id in (
    select m.organization_membership_id
    from public.organization_memberships m
    where m.organization_id in (
      select public.viewer_permission_org_ids('members_manage')
    )
  )
)
```

Still enforce RLS even when UI/action checks permission first. App check improves error UX;
DB remains trust boundary.

## Grant/revoke

```ts
await admin.from("organization_membership_permissions").insert({
  organization_membership_id,
  permission_id: "*",
});
```

GraphQL client mutations use `organization_membership_id` + `permission_id` filters. Presets only
supply slug arrays; applying one means explicit grant mutations.

The JWT carries only `profile_id` (the `sub`/`auth.uid`); it no longer injects tenant/org/agency
claims. Membership and permission changes are resolved from the DB on each check, so they take
effect without a JWT refresh.

## Safety invariants

Schema triggers prevent:

- Revoking own membership.
- Revoking last active admin membership.
- Removing final `members_manage`/`*` admin grant.
- Invalid preset slugs.
- Inconsistent claimed membership state.

Do not bypass these with service role unless operation intentionally implements admin recovery.

## Agency access

Separate helpers:

- `viewer_agency_ids()`
- `viewer_agency_permission_org_ids(permission)` — covers explicit per-org grants and global
  (`organization_id is null`) grants only. There are no implicit organization grants.
- `viewer_has_agency_permission(org, permission)`
- `viewer_agency_tenant_ids()`

Agency grants expand read/cross-tenant access where policy says so. They do not automatically
grant tenant member write permissions.

## Tests

Add pgTAP under `packages/supabase/supabase/tests/`:

```sql
begin;
select plan(1);
set local role authenticated;
set local request.jwt.claims to '{"sub":"..."}';
select ok(public.viewer_has_permission(1, 'members_manage'), '...');
select * from finish();
rollback;
```

Without `set local role authenticated`, postgres bypasses RLS and test is invalid.

Relevant tests: `viewer_permissions`, `rls_memberships`, `membership_invariants`,
`permission_presets_validate`, `journey_escalation_attempts`.
