---
name: my-react-email
description: Repository-specific React Email template patterns in @packages/react-email, including exports, local preview, Rosetta locale injection, props, and rendering boundaries.
---

# React Email

Package currently provides templates + preview. Delivery provider is not wired in app.
Do not claim Resend sending exists until code/dependency is added.

## Source map

- Package: `packages/react-email`
- Template: `src/templates/welcome_email.tsx`
- Preview: `pnpm --filter @packages/react-email dev` at port `7101`
- Export pattern: `@packages/react-email/templates/<file>`

## Template shape

```tsx
export interface WelcomeEmailProps {
  empleadoNombre: string;
  empresaNombre: string;
  loginUrl: string;
  locale?: string;
}

export function WelcomeEmail({
  locale = "es-CL",
  ...props
}: WelcomeEmailProps) {
  return (
    <LocaleProvider locale={locale}>
      <WelcomeEmailContent {...props} />
    </LocaleProvider>
  );
}

export default WelcomeEmail;
```

Provider + consumer split required so `useLocale`/`useRosetta` sees injected locale.

## Dictionaries

Base locale defines shape:

```ts
const LOCALE_ES = {
  preview: "Bienvenido/a a {{empresaNombre}}",
  heading: "Bienvenido/a, {{empleadoNombre}}",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    preview: "Welcome to {{empresaNombre}}",
    heading: "Welcome, {{empleadoNombre}}",
  } satisfies typeof LOCALE_ES,
};
```

Inside content:

```tsx
const locale = useLocale();
const { t } = useRosetta(LOCALES);
return <Html lang={locale}>...</Html>;
```

## Preview props

```ts
WelcomeEmail.PreviewProps = {
  empleadoNombre: "María González",
  empresaNombre: "Constructora Ejemplo SpA",
  loginUrl: "https://lvh.me:7003",
  locale: "es-CL",
} satisfies WelcomeEmailProps;
```

Keep preview realistic and local-safe.

## Styling/components

Use `@react-email/components`: `Html`, `Head`, `Preview`, `Tailwind`, `Body`, `Container`,
`Section`, `Heading`, `Text`, `Button`, `Hr`. Email CSS support is limited; prefer simple
Tailwind classes and table-compatible React Email primitives.

## Adding template

1. Add `packages/react-email/src/templates/<snake_name>.tsx`.
2. Define typed props + locale.
3. Add base dictionary and typed translations.
4. Add `PreviewProps`.
5. Export named + default component.
6. Preview, then run format/build.

Package wildcard export exposes file automatically. No barrel.

## Sending boundary

When delivery is added, server-only route/action imports template and renderer/provider.
Never expose provider API key client-side. Keep sending orchestration in app or dedicated
package, not inside visual template.
