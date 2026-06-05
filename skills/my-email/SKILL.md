---
name: my-email
description: Email template patterns using Resend and React Email, locale injection, component structure, and API routes.
---

# Email Templates with React Email + Resend

## Setup

**Install in `packages/react-email`:**
```bash
npm install react-email @react-email/components resend
```

**Dev server:**
```bash
cd packages/react-email
npm run dev  # http://localhost:7101
```

## Component Structure

Always split into provider + content (locale must be injected at provider level):

```typescript
// packages/react-email/src/templates/welcome.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Link,
  Img,
} from "@react-email/components";
import { useRosetta, LocaleProvider } from "@packages/use-rosetta";

const LOCALES = {
  es: {
    "subject": "Bienvenido a nuestra app",
    "greeting": "¡Hola {{name}}!",
    "body": "Nos alegra tenerte aquí.",
    "confirm": "Confirmar email",
  },
  en: {
    "subject": "Welcome to our app",
    "greeting": "Hello {{name}}!",
    "body": "We're excited to have you.",
    "confirm": "Confirm email",
  },
} as const;

// Provider wrapper — sets locale context
export function WelcomeEmail({
  name,
  confirmUrl,
  locale = "es",
}: {
  name: string;
  confirmUrl: string;
  locale?: string;
}) {
  return (
    <LocaleProvider locale={locale}>
      <WelcomeEmailContent name={name} confirmUrl={confirmUrl} />
    </LocaleProvider>
  );
}

// Content consumer — reads from context
function WelcomeEmailContent({
  name,
  confirmUrl,
}: {
  name: string;
  confirmUrl: string;
}) {
  const { t } = useRosetta(LOCALES);

  return (
    <Html>
      <Head />
      <Preview>{t("subject")}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: 20 }}>
          <Img
            src="https://example.com/logo.png"
            width={100}
            height={40}
            alt="Logo"
          />

          <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
            {t("greeting", { name })}
          </Text>

          <Text style={{ color: "#666", lineHeight: 1.6 }}>
            {t("body")}
          </Text>

          <Link
            href={confirmUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              borderRadius: 4,
              textDecoration: "none",
              marginTop: 20,
            }}
          >
            {t("confirm")}
          </Link>

          <Text style={{ color: "#999", fontSize: 12, marginTop: 40 }}>
            © Example Inc. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Send Email via API Route

**`apps/platform/app/api/email/send/route.ts`:**
```typescript
import { Resend } from "resend";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@packages/react-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, name, confirmUrl, locale } = await request.json();

  try {
    const html = await render(
      <WelcomeEmail
        name={name}
        confirmUrl={confirmUrl}
        locale={locale || "es"}
      />
    );

    const result = await resend.emails.send({
      from: "hello@example.com",
      to: email,
      subject: "Bienvenido", // Use locale-aware subject if needed
      html,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

## Server Action Wrapper

```typescript
"use server";

import { Resend } from "resend";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@packages/react-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function actionSendWelcomeEmail(
  email: string,
  name: string,
  confirmUrl: string,
  locale: string = "es"
) {
  const html = await render(
    <WelcomeEmail name={name} confirmUrl={confirmUrl} locale={locale} />
  );

  const result = await resend.emails.send({
    from: "hello@example.com",
    to: email,
    subject: locale === "es" ? "Bienvenido" : "Welcome",
    html,
  });

  if (result.error) throw result.error;
  return result;
}
```

## Resend Metadata & Tags

```typescript
await resend.emails.send({
  from: "hello@example.com",
  to: email,
  subject: "...",
  html,
  tags: ["welcome", "onboarding"],
  metadata: {
    user_id: userId,
    org_id: orgId,
  },
});
```

Use for tracking, segmentation, and debugging.

## Preview in Dev

**`packages/react-email/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "jsx": "react"
  }
}
```

**`packages/react-email/package.json`:**
```json
{
  "scripts": {
    "dev": "email dev"
  }
}
```

Visit `http://localhost:7101` to preview all templates. Hot reload on file changes.

## Styling Best Practices

1. **Inline styles** — email clients strip `<style>` tags
2. **Use `<Container>`** — applies max-width + centering
3. **No Tailwind** — won't work; use `style` objects or `@react-email/components` helpers
4. **Test across clients** — Gmail, Outlook, Apple Mail have different CSS support

```typescript
const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  fontFamily: "Arial, sans-serif",
};

const headingStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 16,
};

<Container style={containerStyle}>
  <Text style={headingStyle}>Hello</Text>
</Container>
```

## Images

Always use `https://` URLs. Base64 works but increases email size:

```typescript
<Img
  src="https://cdn.example.com/image.png"
  width={200}
  height={100}
  alt="Description"
/>
```

## Links & CTA Buttons

```typescript
<Link
  href="https://example.com/confirm?token=xyz"
  style={{
    display: "inline-block",
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px 24px",
    borderRadius: 4,
    textDecoration: "none",
    fontWeight: "bold",
  }}
>
  Confirm Email
</Link>
```

Some clients don't support button styles — provide fallback link text.

## Unsubscribe Link (Required)

Resend automatically adds List-Unsubscribe header, but include visible link:

```typescript
<Text style={{ fontSize: 10, color: "#999" }}>
  <Link href="https://example.com/unsubscribe?token=xyz">
    Unsubscribe from emails
  </Link>
</Text>
```

## Variables & Personalization

```typescript
export function OrderConfirmation({
  orderNumber,
  customerName,
  totalAmount,
}: {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
}) {
  return (
    <Html>
      <Body>
        <Text>Order #{orderNumber}</Text>
        <Text>Hi {customerName},</Text>
        <Text>Total: ${totalAmount.toFixed(2)}</Text>
      </Body>
    </Html>
  );
}
```

## Testing

Use Resend's test mode — emails don't actually send:

```typescript
const resend = new Resend(process.env.RESEND_API_KEY);

const result = await resend.emails.send({
  from: "hello@example.com",
  to: "test@example.com", // Use test@resend.dev
  subject: "Test",
  html: "<h1>Test</h1>",
});

console.log(result); // { id: "...", from: "...", to: "..." }
```

## Common Pitfalls

- ❌ Forgetting `LocaleProvider` wrapper before rendering
- ❌ Using `<div>` instead of `<Container>` / `<View>`
- ❌ Relying on CSS classes (won't be inlined)
- ❌ Not testing in actual email clients
- ❌ Large images (slow load, spam score)
- ❌ Too much HTML nesting (email client limits)
