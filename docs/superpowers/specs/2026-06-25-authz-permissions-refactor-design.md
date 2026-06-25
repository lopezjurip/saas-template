# Refactor de autorización estilo Zanzibar-lite (capa `authz`)

> Fecha: 2026-06-25 · Branch: `zanzibar-permissions` · Estado: diseño aprobado, pendiente de plan de implementación.
> Contexto: prototipo, **sin usuarios productivos** → cambios breaking permitidos. Esquema único en
> `packages/supabase/supabase/migrations/00000000000000_schema.sql` (sin migraciones incrementales).

## Objetivo

Centralizar la autorización en una **única API uniforme** dentro de Postgres, sin perder RLS como frontera de
seguridad. **No** se adoptan capacidades nuevas de Zanzibar (namespace configs, rewrite engine, zookies) ni se
sale a un servicio externo. Se adopta su **modelo conceptual** (sujeto · relación · objeto) y se consolida el
zoo actual de ~15 helpers `viewer_*` + 3 tablas de grants.

### Lo que NO es

- No es ReBAC con herencia arbitraria (sin árboles folder→doc genéricos).
- No es autorización row-level: el objeto siempre es `organization` / `tenant` / `agency`.
- No es un servicio externo (SpiceDB/OpenFGA). Todo vive en Postgres; RLS sigue mandando.
- No hay auditoría/append-log en este alcance.

## Principios

1. **Pertenencia ≠ permiso** (dos ejes ortogonales):
   - *Pertenencia (membership):* `profile ↔ organization`, `profile ↔ agency`. Estructural, con máquina de
     estados (invite/accept/revoke). Las tablas `organization_memberships` / `agency_memberships` quedan
     **intactas**.
   - *Permiso (grant):* `(sujeto, relación, objeto)`. Se consolida.
2. **Dos capas:**
   - *Núcleo* `authz.*`: recibe `profile_id` **siempre explícito**. Puro, no depende de `auth.uid()`.
     Testeable y reusable sobre terceros.
   - *Viewer* `viewer_*`: inyecta el `profile_id` propio del JWT (`viewer_profile_id(true)`). Única frontera
     con el JWT. **RLS usa esta capa.**
3. **Una sola verdad por concepto:** el predicado "membresía activa", la expansión del wildcard `'*'`, y las
   indirecciones (agencia→org, tenant→org) se definen una sola vez.
4. **Integridad referencial preservada** (decisión A2, ver abajo): el storage de grants se unifica con FKs
   reales, no con una tabla polimórfica `text`.

## Superficie de funciones

```
-- NÚCLEO (profile_id explícito)                              -- VIEWER (inyecta el propio profile_id)
authz.check(profile_id, relation, object_type, object_id)→bool   viewer_can(relation, object_type, object_id)
authz.lookup(profile_id, relation, object_type)→setof bigint     viewer_can_objects(relation, object_type)
authz.relations(profile_id, object_type, object_id)→setof citext viewer_relations(object_type, object_id)
authz.member_objects(profile_id, object_type)→setof bigint       viewer_member_objects(object_type)
authz.agency_reachable_objects(profile_id, object_type)→setof id viewer_agency_reachable_objects(object_type)
```

- `object_type` = enum `authz.object_type` = `('organization','tenant','agency')` (tipado, no `text`).
- `relation` = slug del catálogo `public.permissions`. Incluye verbos por recurso (ej. `payrolls:read`,
  `payrolls:write`); el **objeto sigue siendo la org/tenant/agency** (org-scoped, no row-level).
- El wildcard `'*'` y la indirección agencia→org se resuelven **dentro** del núcleo, una sola vez.
- Funciones `STABLE`, `SECURITY DEFINER`, apoyadas en índices, compatibles con InitPlan.

### Resolución (núcleo)

`authz.check(P, relation, 'organization', O)` =
- **camino directo:** existe grant `subject=P, object_org=O, permission ∈ {relation, '*'}` **y** `P` es
  miembro activo de `O`; **o**
- **camino agencia (bridge):** `P` es miembro activo de una agencia `A` **y** existe grant
  `subject_agency=A, object_org ∈ {O, NULL=todas}, permission ∈ {relation, '*'}`.

Las dos condiciones del camino agencia son los dos ejes: *pertenencia* a la agencia + *permiso* de la agencia
sobre la org. Ninguna sola alcanza.

## Storage de grants — decisión **A2** (tipado unificado)

Una tabla `authz.grants` con sujeto y objeto como **uniones discriminadas vía FK + CHECK "exactamente uno"**.
Colapsa `organization_membership_permissions` + `agency_membership_permissions` + `agencies_organizations_grants`.

```sql
authz.grants(
  grant_id               bigint generated always as identity primary key,
  -- sujeto: exactamente uno
  subject_profile_id     uuid references public.profiles,
  subject_agency_id      int  references public.agencies,
  -- objeto: exactamente uno (object_organization_id NULL = "todas las orgs" SOLO cuando subject es agencia)
  object_organization_id int  references public.organizations,
  object_tenant_id       int  references public.tenants,
  object_agency_id       int  references public.agencies,
  permission_id          citext not null references public.permissions,
  -- lifecycle mínimo (sin audit-log en este alcance)
  ...
  -- CHECKs: exactamente un subject_*; exactamente un object_* (con la excepción NULL=todas para agencia)
)
```

- Mantiene FK al catálogo `permissions` y a `organizations`/`tenants`/`agencies`/`profiles`.
- El grant exige pertenencia (invariante "no hay permiso sin pertenencia") — el núcleo lo valida.
- **Wrinkle pendiente de implementación:** `object_organization_id = NULL` = "todas las orgs" (wildcard a
  nivel objeto, distinto de `permission_id='*'`). Se modela con índices únicos parciales (como hoy). Decidir
  en implementación si se mantiene o si todo grant de agencia debe nombrar su org. No bloquea el plan.

`public.permission_presets` (bundles UX) se mantiene apuntando al catálogo.

## RLS resultante (uniforme)

- **Visibilidad (pertenencia):** `col in (select viewer_member_objects(t)) or col in (select viewer_agency_reachable_objects(t))`.
- **Acción (permiso):** `col in (select viewer_can_objects(verbo, t))`.
- La agencia **nunca** aparece en la policy; vive en la función → imposible olvidar la rama de agencia en una
  tabla nueva.
- Patrón InitPlan-friendly (`col in (select …)`), mismo perfil de performance que hoy.

Ejemplos:

```sql
-- visibilidad
create policy "organizations_select" on public.organizations for select to authenticated
using ( organization_id in (select viewer_member_objects('organization'))
        or organization_id in (select viewer_agency_reachable_objects('organization')) );

-- acción / recurso org-scoped
create policy "payrolls_select" on public.payrolls for select to authenticated
using ( organization_id in (select viewer_can_objects('payrolls:read','organization')) );

create policy "payrolls_modify" on public.payrolls for all to authenticated
using      ( organization_id in (select viewer_can_objects('payrolls:write','organization')) )
with check ( organization_id in (select viewer_can_objects('payrolls:write','organization')) );

-- gestionar la agencia misma (object_type = 'agency', sin bridge)
create policy "agency_memberships_manage" on public.agency_memberships for all to authenticated
using ( agency_id in (select viewer_can_objects('agency_members_manage','agency')) );
```

## Storage (Supabase) — convención, sin grants propios

El acceso a objetos de storage **hereda** del acceso a la row espejo. Convención: `bucket ≡ tabla`,
`primer segmento del path ≡ PK`, `acceso al objeto ≡ acceso a la row`.

Read y write son **ejes independientes por bucket**, cada uno resuelto entre `{público, herencia-tabla, authz}`:

| bucket | READ | WRITE |
|---|---|---|
| `avatars` | público (bucket `public=true`) | dueño del namespace |
| `profiles` (docs privados) | hereda RLS de `public.profiles` (EXISTS) | dueño del namespace |
| `payrolls` (org-scoped, futuro) | `viewer_can('payrolls:read', org)` | `viewer_can('payrolls:write', org)` |

```sql
-- profiles: lectura delega a la RLS de public.profiles
create policy "profiles_objects_read" on storage.objects for select to authenticated
using ( bucket_id = 'profiles'
        and exists (select 1 from public.profiles p
                    where p.profile_id::text = (storage.foldername(name))[1]) );

-- escritura: tu propio namespace
create policy "profiles_objects_write" on storage.objects for insert to authenticated
with check ( bucket_id = 'profiles'
             and (storage.foldername(name))[1] = viewer_profile_id(true)::text );

-- avatars: bucket público (read nativo, sin policy de select); write del dueño
create policy "avatars_write_own" on storage.objects for insert to authenticated
with check ( bucket_id = 'avatars'
             and (storage.foldername(name))[1] = viewer_profile_id(true)::text );
```

**YAGNI / diferido:** el resolver row→org para buckets org-scoped y los **subfolders** (público a nivel objeto
dentro de un bucket privado, ej. `name like '%/avatar.%'` o `/public/`) quedan fuera de este alcance. Hoy solo
el shape `profiles/[profile_id]/**` y `avatars/[profile_id]/**`.

## Migración de call-sites

- **RLS:** todas las policies tenant/org-scoped → API nueva (`viewer_can_objects` / `viewer_member_objects` /
  `viewer_agency_reachable_objects`).
- **TS/React:** hooks/GraphQL que exponen permisos → superficie nueva. Los assert-wrappers
  (`getViewer*Assert`) **se mantienen** (son intencionales).
- **MCP** (`apps/platform/lib/mcp/tools/permissions.ts`): grant/revoke/set → escriben en `authz.grants`.
- **Seed + presets:** `permission_presets` sigue.
- **pgTAP:** portar la suite de permisos a la API nueva; tests del núcleo con `profile_id` explícito (sin
  falsear JWT claims) + tests de RLS con rol `authenticated` + claims.
- **Borrar (breaking, OK):** los ~15 `viewer_has_*` / `viewer_permission_*_ids` redundantes una vez migrados.

## Secuencia de implementación

Cada paso termina con `pnpm db:reset && pnpm generate:types` + pgTAP en **verde** antes del siguiente:

1. Crear schema `authz` + enum + funciones núcleo/viewer **leyendo de las tablas viejas** (sin tocar storage).
2. Migrar RLS de todas las tablas a la API nueva.
3. Migrar TS/React + MCP a la API nueva.
4. Colapsar storage de grants a `authz.grants` (migrar datos de las 3 tablas; resolver el wrinkle del
   `object_organization_id = NULL`).
5. Agregar policies de `storage.objects` (buckets `profiles` + `avatars`).
6. Borrar helpers/tablas muertos.

## Riesgos

- Refactor del layer crítico de seguridad: cada paso debe quedar verde (pgTAP) antes de avanzar.
- El `check` con rama de agencia debe quedar STABLE e indexado para no degradar InitPlan.
- El `generate:types` filtra a veces un banner dotenvx en `types.ts:1` — borrar tras cada regen.
- pgTAP por red docker puede romper; fallback corriendo los `.test.sql` por psql directo.
