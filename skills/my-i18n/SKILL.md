---
name: my-i18n
description: Repository-specific @packages/rosetta, cookie-based locale (no URL segment), dictionaries, server/client translation, email, and PDF localization patterns.
---

# i18n

Supported app locales: `es`, `en`, `pt`. Default: `es`. Config:
`apps/platform/lib/i18n.ts`.

## API surface

All i18n lives in `~/lib/i18n*` — three files, one place:

| Module | Context | Key exports |
|---|---|---|
| `~/lib/i18n` | shared | `ROSETTA`, `LOCALE_CONFIG`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `IS_SUPPORTED_LOCALE`, `LOCALE_FROM_PATH`, `SupportedLocale` |
| `~/lib/i18n.server` | server-only | `getServerLocale`, `assertLocale`, `getRosetta`, `LOCALE_FROM_REQUEST`, `HEADER_ACCEPT_LANGUAGE_PARSE` |
| `~/lib/i18n.client` | client-only | `useRosetta`, `useLocale`, `LocaleProvider`, `RosettaProvider` |

`hooks/` only has real React hooks with state/router:
- `~/hooks/use-locale-param` — reads locale from URL params (`useParams`)
- `~/hooks/use-locale-cookie` — reads/sets locale cookie (`useStateCookie`, `useRouter`)

## Routing

Locale is **not** a URL segment. `apps/platform/proxy.ts` resolves it from the `NEXT_LOCALE` cookie (falling back to `Accept-Language`, then the default) and persists it in that cookie before the session update. There is no `/[locale]/` prefix and no sentinel to rewrite.

Client links are plain paths — never embed a locale, and never pass `locale` to `ROUTE` (the helper strips it: `delete query["locale"]` in `apps/platform/lib/route.ts`):

```tsx
<Link href={ROUTE("/tenants/create")}>Crear</Link>
```

Do not thread locale props only to construct hrefs.

## Server component

Colocate dictionary:

```ts
const LOCALE_ES = {
  title: "Miembros",
  count: "{{count}} miembros",
};
const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Members",
    count: "{{count}} members",
  } satisfies typeof LOCALE_ES,
};

export default async function Page(props: PageProps<"/home">) {
  // locale comes from the cookie via getRosetta — never from props.params
  const { t } = await getRosetta(LOCALES);
  return <h1>{t("title")}</h1>;
}
```

Use `ROSETTA` from `~/lib/i18n`. Route params are external: bracket access when not
destructuring.

## Server actions

Cookie locale:

```ts
import { getServerLocale, getRosetta } from "~/lib/i18n.server";

// With explicit locale (e.g. from params):
const { t } = getRosetta(LOCALES, locale);

// Without locale (reads cookie):
const locale = await getServerLocale();
const { t } = ROSETTA(LOCALES, locale);
```

## Client component

App layout supplies `LocaleProvider`. Use:

```ts
import { useRosetta } from "~/lib/i18n.client";

const { t } = useRosetta(LOCALES);
```

For many children sharing same dictionary, use `RosettaProvider`. Do not use
`withRosettaLocales` inside React PDF; it adds a DOM `<div>`.

## Dictionary behavior

- Base locale defines shape; other locales `satisfies typeof BASE`.
- Dotted keys supported.
- `{{name}}` interpolation supported.
- Function values supported for plural/custom logic.
- Regional locale inherits base: `es-CL` merges `es` + overrides.
- Missing key returns `""` by default; `{ strict: true }` throws.

Current package imports are direct:

```ts
import { RosettaImpl } from "@packages/rosetta/rosetta";
import {
  LocaleProvider,
  RosettaProvider,
  useLocale,
  useRosetta,
} from "@packages/rosetta/use-rosetta";
```

No `@packages/rosetta` barrel.

## Email/PDF

Non-Next renderers must inject BCP47 locale:

```tsx
export function Template({ locale = "es-CL", ...props }: Props) {
  return (
    <LocaleProvider locale={locale}>
      <TemplateContent {...props} />
    </LocaleProvider>
  );
}
```

Provider and consumer must be separate components; provider value is unavailable in same
component render.

## File ownership — never pass dictionaries or `t`

Each file is the sole owner of its strings. Never import/export `LOCALES` between files; two files
needing the same key each duplicate it (colocation beats DRY).

- **Never pass the dictionary object as a prop.** A server page builds no `dict` to hand a client child.
- **Never pass the translator (`t`) or a `ReturnType<typeof useRosetta>` across a function/component
  boundary** as an argument or prop. Each component/sub-component calls `useRosetta(LOCALES)` itself
  (`LOCALES` is module-scoped, so it's free). A helper that builds labelled data (tab descriptors,
  menu items) does **not** take `t` — inline the build where `t` is in scope, or return string *keys*
  and translate at the call site. A `t` parameter is the same anti-pattern as a `dict` prop.
- **`LOCALE_ES` and `LOCALES` go at the bottom of the file**, after all component/function
  definitions. They are data constants — keep imports and logic at the top.

## Rules

- User-facing strings belong in dictionaries except deliberate prototypes.
- Keep dictionaries near sole consumer.
- Avoid `IS_SUPPORTED_LOCALE`, trust Rosetta.
- HTML `lang` uses BCP47 mapping from `LOCALE_TO_BCP47` when full tag needed.
- `generateStaticParams` for locale-parameterized pages must include `locale`: `SUPPORTED_LOCALES.flatMap(locale => items.map(item => ({ locale, ...item })))`.
