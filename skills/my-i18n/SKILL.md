---
name: my-i18n
description: Repository-specific @packages/rosetta, locale routing, dictionaries, server/client translation, locale sentinel links, email, and PDF localization patterns.
---

# i18n

Supported app locales: `es`, `en`, `pt`. Default: `es`. Config:
`apps/platform/lib/i18n.ts`.

## Routing

`apps/platform/proxy.ts` owns locale routing:

- Missing locale -> cookie/Accept-Language/default -> redirect.
- `/[locale]/...` sentinel -> active locale redirect.
- URL locale written to `NEXT_LOCALE` cookie before session update.

Client links needing active locale use literal sentinel:

```tsx
<Link href="/[locale]/tenants/create">Crear</Link>
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

export default async function Page(props: PageProps<"/[locale]/home">) {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return <h1>{t("title")}</h1>;
}
```

Use `ROSETTA` from `~/lib/i18n`. Route params are external: bracket access when not
destructuring.

## Server actions

Cookie locale:

```ts
const locale = await getServerLocale();
const r = ROSETTA(LOCALES, locale);
throw new Error(r.t("invite_failed"));
```

Use `getServerLocale()` from `~/lib/i18n.server`.

## Client component

App layout supplies `LocaleProvider`. Use:

```ts
import { useRosetta } from "~/hooks/use-rosetta";

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

## Rules

- User-facing strings belong in dictionaries except deliberate prototypes.
- Keep dictionaries near sole consumer.
- Use `IS_SUPPORTED_LOCALE` before trusting route locale when needed.
- HTML `lang` uses BCP47 mapping from `LOCALE_TO_BCP47` when full tag needed.
