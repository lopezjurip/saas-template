---
name: my-permissions
description: Repository-specific capability permissions, membership lifecycle, wildcard grants, RLS helpers, agency grants, admin checks, and pgTAP tests.
---

# Permissions

Capability-based. No role column.

## Schema

- `permissions(permission_id citext, ...)`: catalog; `*` wildcard.
- `memberships(membership_id, organization_id, profile_id, invite fields, lifecycle timestamps)`.
- `membership_permissions(membership_id, permission_id)`: grant. Org/profile derive through membership.
- `permission_presets(organization_id?, permission_preset_name, permission_preset_slugs[])`: UX bundle only.

Do not use stale `(organization_id, profile_id, permission_id)` grant shape.

Active membership requires:

```sql
m.profile_id = viewer
and m.membership_accepted_at is not null
and m.membership_revoked_at is null
and m.membership_rejected_at is null
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

UI listing: `viewer_membership_permissions()`.

## RLS

Permission table write policy:

```sql
using (
  membership_id in (
    select m.membership_id
    from public.memberships m
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
await admin.from("membership_permissions").insert({
  membership_id,
  permission_id: "*",
});
```

GraphQL client mutations use `membership_id` + `permission_id` filters. Presets only supply
slug arrays; applying one means explicit grant mutations.

After membership acceptance/revocation or tenant/org membership change, refresh JWT because
membership IDs affect tenant/org claims. Permission-only changes are DB-backed and do not need
JWT refresh for enforcement.

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
- `viewer_agency_permission_org_ids(permission)`
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
set local request.jwt.claims to '{"sub":"...","app_metadata":{...}}';
select ok(public.viewer_has_permission(1, 'members_manage'), '...');
select * from finish();
rollback;
```

Without `set local role authenticated`, postgres bypasses RLS and test is invalid.

Relevant tests: `viewer_permissions`, `rls_memberships`, `membership_invariants`,
`permission_presets_validate`, `journey_escalation_attempts`.
