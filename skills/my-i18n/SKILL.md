---
name: my-i18n
description: Internationalization patterns for React/Next.js. Use when adding translations, multi-language support, or when i18n is mentioned.
---

# Internationalization (i18n) — @packages/rosetta

Use `@packages/rosetta` for all i18n needs. It's already in the monorepo.

## Installation

```typescript
import { useRosetta, LocaleProvider, useLocale } from "@packages/rosetta";
```

## Quick Start

```tsx
import { useRosetta } from "@packages/rosetta";

const LOCALES = {
  es: { hello: "Hola {{name}}" },
  en: { hello: "Hello {{name}}" },
};

function MyComponent() {
  const { t } = useRosetta(LOCALES);
  return <h1>{t("hello", { name: "Alice" })}</h1>;
}
```

## Setup in Next.js App

Wrap root layout with `LocaleProvider`:

```typescript
// app/layout.tsx
import { LocaleProvider } from "@packages/rosetta";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = "es"; // Read from URL, cookies, or negotiation
  
  return (
    <html>
      <body>
        <LocaleProvider locale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
```

## Type-Safe Message Dictionary

Always define base locale first, then use `satisfies` for others:

```tsx
// 1. Define base locale as const to preserve types
const LOCALE_EN = {
  "common.yes": "Yes",
  "common.no": "No",
  "common.save": "Save",
  greeting: "Hello {{name}}",
  items: (p: { count: number }) =>
    p.count === 1 ? "1 item" : "{{count}} items",
} as const;

// 2. Define other locales with type safety
const LOCALE_ES = {
  "common.yes": "Sí",
  "common.no": "No",
  "common.save": "Guardar",
  greeting: "¡Hola {{name}}!",
  items: (p: { count: number }) =>
    p.count === 1 ? "1 artículo" : "{{count}} artículos",
} satisfies typeof LOCALE_EN;

// 3. Combine into LOCALES dict
const LOCALES = { en: LOCALE_EN, es: LOCALE_ES };
```

**Benefits:**
- TypeScript enforces all keys exist in every locale
- Missing keys → compile error
- Function signatures must match
- IDE autocomplete on `t("key")`

## Usage Patterns

```tsx
const { t } = useRosetta(LOCALES);

// Simple key
t("common.yes");        // "Yes"

// With parameters
t("greeting", { name: "Alice" }); // "Hello Alice"

// Function-based (pluralization)
t("items", { count: 5 }); // "5 items"

// Missing key falls back to key itself
t("nonexistent.key");   // "nonexistent.key"
```

## Locale Injection (email/PDF templates)

For packages without Next.js routing (email templates, PDF generators), inject locale via context:

```tsx
import { LocaleProvider, useRosetta } from "@packages/rosetta";

export function EmailTemplate({ locale = "en", name }: { locale: string; name: string }) {
  return (
    <LocaleProvider locale={locale}>
      <EmailContent name={name} />
    </LocaleProvider>
  );
}

// Separate component reads from context
function EmailContent({ name }: { name: string }) {
  const { t } = useRosetta(LOCALES);
  return <p>{t("welcome", { name })}</p>;
}
```

**Important:** Always split into provider + consumer components when both setting and reading locale.

## Using in Lists

Locale context works across list items automatically:

```tsx
function ItemRow({ item }: { item: Item }) {
  const { t } = useRosetta(LOCALES);
  return <li>{t("common.name")}: {item.name}</li>;
}

export function ItemList({ items }: { items: Item[] }) {
  return (
    <LocaleProvider locale="en">
      <ul>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </LocaleProvider>
  );
}
```

## Reading Current Locale

```tsx
import { useLocale } from "@packages/rosetta";

function MyComponent() {
  const locale = useLocale(); // "en", "es", etc.
  return <div>Current locale: {locale}</div>;
}
```

## Switching Locales

Locale comes from `LocaleProvider` at the top level. Update it there to switch for entire app.

```tsx
// In root layout or provider
const [locale, setLocale] = useState("es");

<LocaleProvider locale={locale}>
  <Button onClick={() => setLocale("en")}>English</Button>
  <Button onClick={() => setLocale("es")}>Español</Button>
  {children}
</LocaleProvider>
```

## Performance Tips

- Keep message dictionaries colocated with components that use them
- Use `RosettaProvider` (not `LocaleProvider`) for .map() lists if you want isolated locale context
- Avoid recreating dictionaries on every render
- For large apps, consider lazy-loading locale data by region

See `@packages/rosetta/src/rosetta.ts` for full API.
