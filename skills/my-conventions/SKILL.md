---
name: my-conventions
description: Repository-specific cross-cutting TypeScript/TSX conventions — barrels, ~/ imports, typed route helpers, next-zod-route, bracket notation for external data, code style/naming, hooks, components, lint/build, file naming, commits, generated files. Read BEFORE writing any TS/TSX in apps/platform or packages/*.
---

# TS/TSX Conventions

Cross-cutting rules for all TypeScript/TSX in the repo. Subsystem rules live elsewhere:
SQL → `my-supabase`, GraphQL → `my-graphql`/`my-graphy`, i18n → `my-i18n`, auth/proxy → `my-auth`/`my-proxy`.

## No barrel index files

Never create `index.ts` (or `index.tsx`) whose sole purpose is re-exporting. Import directly from the source file.

## Imports

- Use `~/` alias for imports within `apps/platform/` (e.g. `~/lib/...`, `~/hooks/...`).
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/react-email`, `@packages/react-pdf`, etc.
- App code in `apps/platform/`; reusable logic in `@packages/*`.
- Never use `as any`.

## Typed route helpers (Next.js 16) — REQUIRED

**Always use `PageProps<"route">` for `page.tsx`, `LayoutProps<"route">` for `layout.tsx`, `RouteContext<"route">` for `route.ts`.** With `typedRoutes: true` in `next.config.ts`, Next.js generates these as global types under `.next/dev/types/`. Use instead of hand-rolling `{ params: Promise<...> }` — stays in sync with the actual file path, so renaming a folder fails type-check on next `pnpm build:dry`.

There is **no `locale` route param** — locale comes from a cookie/header, so `params` only ever holds real dynamic segments.

```ts
// page.tsx — dynamic segments come from props.params
export default async function Page(props: PageProps<"/t/[tenant_slug]/[organization_id]">) {
  const { tenant_slug, organization_id } = await props.params;
  const sp = await props.searchParams;
  const tab = SINGLE(sp["tab"]) ?? "";
}

// layout.tsx — static route, no params to read
export default async function Layout(props: LayoutProps<"/home">) {
  return <main>{props.children}</main>;
}

// route.ts
export async function GET(request: NextRequest, ctx: RouteContext<"/auth/callback">) {
  // const { ... } = await ctx.params; // only when the route has dynamic segments
}
```

`searchParams` is `Record<string, string | string[] | undefined>` (URL params can repeat). Narrow with `SINGLE(sp["foo"])` from `@packages/utils/array` to get the first value as `string | undefined`.

**Exception:** `page.tsx` / `layout.tsx` not `async` and not accessing `params`/`searchParams` — no typed props needed. But make it `async` if it needs any server-side capability.

## API route handlers — validate input with `next-zod-route`

For `route.ts` handlers consuming dynamic path params, query, or a JSON body, validate with **`next-zod-route`** instead of hand-parsing — it returns 400 on bad input and hands the handler fully-typed `context.params` / `context.query` / `context.body`. Param schema keys must match the `[segment]` folder names. Use `z.guid()` (loose, version-agnostic — matches the DB's `internal.is_uuid`) for uuid path params, **not** `z.uuid()` (which rejects non-RFC-version uuids like the seed's). The handler may return any `Response` (e.g. a streamed image).

```ts
// app/api/v1/organizations/[organization_id]/avatar/route.ts
export const GET = createZodRoute()
  .params(z.object({ organization_id: z.coerce.number().int().positive() }))
  .handler(async (_request, context) => {
    return streamPublicAvatar(/* … context.params.organization_id … */);
  });
```

Routes whose "invalid input" is a user-facing **redirect** (e.g. the auth `callback`/`confirm` flows redirecting to `/auth/error`) deliberately keep hand-parsing — next-zod-route's 400 doesn't fit that UX.

## Bracket notation for external data

Reading properties off objects from outside the program (GraphQL/REST responses, parsed JSON, file contents, webhook payloads, MCP tool results) → use bracket notation, not dot access.

```ts
// External data → brackets
const organization = edge["node"];
const tenantSlug = organization["tenants"]?.["tenant_slug"];
const slug = params["tenant_slug"]; // route params come from the request
const body = await request.json();
const email = body["email"];

// Class instances / library methods → dot
const { data, error } = await supabase.auth.getUser();
const session = await graphy.query({ query: DashboardPageQuery });
```

Brackets mark "this shape is contractual with another system" — distinguishes from class properties/methods owned by the program. TS narrowing works through brackets; no type-safety cost. Don't introduce intermediate `.map()`/`.filter()` arrays to extract a key — iterate the original collection and bracket from there.

**Mock/fixture data counts as external.** Objects from `~/lib/*-mock.ts` (and any fixture standing in for DB rows / API responses) are contractual with the future backend — read with brackets too (`agency["name"]`, `aff["email"]`). Destructuring top-level is fine — `const { org } = item` — then bracket leaf reads: `org["name"]`.

**pg_graphql connections (`edges`/`node`) — external too.** Bracket `["edges"]` / `["node"]` (never `.edges`/`.node`), iterate `["edges"]` once at the point of use, and **never** cast leaf reads (`as number`/`as string`) — the generated types already type them; use the value directly or `?? fallback` for nullables. No throwaway `.map(e => e.node).map().filter()` chains.

```tsx
// ✅ iterate edges in place, brackets, no casts, no intermediate arrays
{data?.["presets"]?.["edges"].map((edge) => {
  const p = edge["node"];
  return <li key={p["permissionPresetId"]}>{p["permissionPresetName"]}</li>;
})}

// ❌ throwaway arrays + dot access + casts
const presets = (data?.["presets"]?.edges ?? []).map((e) => e.node).map((p) => ({ id: p["permissionPresetId"] as number }));
```

## Links — bare paths, never pass `locale`

Locale is **not** a URL segment — the proxy resolves it from a cookie/header. So links are plain paths and **never** carry a locale. Do **not** pass `locale` into `ROUTE`/`ROUTE_HREF` (the helper strips it anyway — `delete query["locale"]` in `apps/platform/lib/route.ts`), and do **not** thread `locale` / `localePrefix` / a pre-built `base` string from a server `page.tsx` into a client component just to build hrefs. (Locale dictionary patterns: see `my-i18n`.)

```tsx
// ✅ build hrefs with ROUTE and the real params only — no locale
const inviteHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/new", {
  tenant_slug: agency["slug"],
  organization_id,
});
<Link href={inviteHref}>…</Link>
<Link href={ROUTE("/agencies/create")}>…</Link>

// ❌ never — locale is dead here and gets stripped
<Link href={ROUTE("/agencies/create", { locale })}>…</Link>
```

## Code Style

- Biome.js handles formatting/linting — don't fight it.
- Follow existing patterns in the codebase.
- English for code/comments; user-facing strings in locale files (see `my-i18n`).
- **Pure functions → `UPPER_CASE`.** Pure = deterministic on inputs, no observable side effects (no I/O, no DB/network/filesystem, no `redirect()`, no argument mutations, no `Date.now()`/`Math.random()`). Side-effectful or async-with-I/O functions stay `camelCase`. Constants stay `UPPER_CASE`. React components stay PascalCase regardless.
- **Server Actions → `action*` prefix.** Every exported function from a `"use server"` file gets the `action` prefix (`actionSetPassword`, `actionUpdateEmail`, `actionDeletePasskey`). The prefix replaces verbs like `set`/`update`/`save`/`do` — write `actionSetPassword`, not `actionDoSetPassword`. Applies to both `next-safe-action` actions and `formAction()` adapters (`actionSignOutForm`).
- **Named functions, never arrow functions.** Use `function myFn() {}` or `export function myFn() {}`, never `const myFn = () => {}`. Named functions are hoisted and show up in stack traces. Exception: short inline callbacks in `.map()` / `.filter()`.
- **Tailwind: prefer native scale sizes over arbitrary px.** Width/height/size/gap/padding → use the scale (`size-5`, `h-9`, `gap-2`) including v4 fractional steps like `size-4.5` (18px) — not arbitrary `h-[18px]`. Typography too: font-size scale (`text-xs`, `text-sm`, `text-2xl`) over `text-[13px]`. A recurring off-scale size → add a named `@theme` token in `apps/platform/styles/globals.css` (follow the `--text-tiny: 0.6875rem` precedent) and use it as `text-tiny`. Arbitrary bracket values are reserved for things scale and tokens genuinely can't express.
- **Map a discriminant to values with a keyed lookup, not `let` + `if/else`.** Several values varying together by one key → return from a `Record`-typed helper indexed by key — `const head = CONSOLE_HEAD(t)[tab]` — not mutable `let`s reassigned in an `if/else if` chain.
- **JSDoc + `@example` for new exports.** Small JSDoc with at least one `@example` on new functions, components, classes, constants. Skip `page.tsx` and `layout.tsx` — framework entry points, not reusable exports.
  ```ts
  /**
   * Builds the full apex URL for the given path.
   * @example APEX_URL("/home") // "https://example.com/home"
   */
  export function APEX_URL(path: string): string { … }
  ```
- **Logging pattern.** At the top of each file declare a namespaced logger mirroring the file's route path:
  ```ts
  const log = debug("app:t:[tenant_slug]:[organization_id]:settings:members:actions")
  ```
  Always call a method — `log.error(…)`, `log.warn(…)`, `log.info(…)` — never bare `log(…)`. Always prefix the message with `[functionName]` or `[handlerName]`:
  ```ts
  log.error("[actionInviteMember] permission check failed: %o", { organization_id, error })
  ```

## Hooks & Abstractions

**Avoid thin wrappers.** A hook wrapping a single SDK call adds noise without clarity. Prefer direct code:

```ts
// ❌ Thin wrapper — unnecessary indirection
function useSetEmail() {
  const [error, setError] = useState(null);
  async function setEmail(email: string) {
    try { await supabase.auth.updateUser({ email }); }
    catch (e) { setError(e.message); }
  }
  return { setEmail, error };
}

// ✅ Call the SDK directly in the component, handle error in place
async function onSubmit(email: string) {
  try { await supabase.auth.updateUser({ email }); }
  catch (e) { setError(e.message); }
}
```

**Encapsulate only when genuinely reusable.** Create a hook when:
- The same logic + state pattern repeats across 2+ components.
- It reduces boilerplate significantly (e.g. an OTP send/verify pair with error/pending state).
- It's "headless" — owns behavior but returns primitives for the caller to render.

If a package already does it (react-use, usehooks-ts, etc.), prefer the package. Don't invent.

## Components used only once stay in the same file

Don't extract a component to its own file unless reused in 2+ places. Single-use components belong inline in the page/layout that owns them.

**Exception:** a component long enough to hurt readability of the parent (>80 lines) → move to a separate file as an implementation detail. Comment why: `// Local component — used only in /auth/page.tsx`.

## Lint + Build (run in parallel)

After changes, run these concurrently — independent, safe to parallelize:

```bash
pnpm format:apply-unsafe  # Biome auto-fix including unsafe transforms
pnpm build:dry            # Turbo type-check / build without emitting output
```

**`build:dry` false positives — `PageProps` / `LayoutProps` / `RouteContext` not found:** these globals are generated by `next dev` into `.next/dev/types/`. Without a running dev server, `build:dry` emits ~40 `Cannot find name 'PageProps'` errors. Expected — not real failures. For clean output, run `pnpm dev` first (writes the type files), then `build:dry`.

**New route → run route typegen, don't rely on `pnpm dev`:** after **adding a new route folder** (e.g. `app/oauth/consent/page.tsx`), `tsc`/`build:dry` fails with `Type '"/oauth/consent"' does not satisfy the constraint 'AppRoutes'`. `tsc` reads the **build** route union in `.next/types/routes.d.ts`, which is separate from the dev one in `.next/dev/types/` — a running dev server alone does **not** refresh it. Regenerate it explicitly (same command as the `postinstall` script):

```bash
cd apps/platform && NODE_ENV=development pnpm exec next typegen
```

Then `PageProps<"/new-route">` and the `AppRoutes` union pick up the new path and `build:dry` passes.

## File & Script Naming

Use `noun-verb` order, not `verb-noun`: `skill-rename`, `alert-create`, `user-import`. Domain first, action second.

## Commit Messages

Conventional Commits with scope: `type(scope): description`
- `feat(auth): add passkey registration`
- `fix(proxy): handle subdomain redirect on auth routes`
- `chore(supabase): regenerate types after schema migration`

## Generated Files

Stage normally in git. Ignore when writing commit messages:
- `packages/supabase/src/types.ts` — Supabase DB types.
