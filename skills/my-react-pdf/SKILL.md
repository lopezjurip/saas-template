---
name: my-react-pdf
description: Repository-specific @react-pdf/renderer templates, react-pdf-tailwind styling, Rosetta locale injection, markdown rendering, preview app, and server rendering.
---

# React PDF

Package renders templates and provides webpack preview. App download route is not currently
wired.

## Source map

- Templates: `packages/react-pdf/src/templates/*.tsx`
- Tailwind adapter: `src/lib/tw.ts`
- Renderer: `src/render.ts`
- Markdown: `src/components/markdown.tsx`
- Preview router/app: `src/components/router.tsx`, `src/App.tsx`
- Dev: `pnpm --filter @packages/react-pdf dev` at `7102`

## Template

```tsx
export interface HelloWorldTemplateProps {
  locale?: string;
}

export function HelloWorldTemplate({
  locale = "en",
}: HelloWorldTemplateProps) {
  return (
    <LocaleProvider locale={locale}>
      <HelloWorldContent />
    </LocaleProvider>
  );
}

function HelloWorldContent() {
  const { t } = useRosetta(LOCALES);
  return (
    <Document title="..." author="SaaS Template">
      <Page size="A4" style={tw("bg-white text-xs")}>
        <View><Text>{t("hero.title")}</Text></View>
      </Page>
    </Document>
  );
}
```

Use React PDF primitives only: `Document`, `Page`, `View`, `Text`, `Link`, `Image`, etc.
No DOM elements. `@react-pdf/renderer` has no `Table` primitive; build tables with Views.

## Styling

```ts
import { tw } from "../lib/tw";

<View style={tw("flex-row gap-3 border border-gray-200 p-4")} />
<View style={{ ...tw("h-2 rounded"), width: "75%", backgroundColor: "#1e40af" }} />
```

`tw()` uses `react-pdf-tailwind` + `clsx`. React PDF CSS differs from browser CSS; verify in
preview. Use inline style for dynamic values.

## Fixed footer/page count

```tsx
<View fixed style={tw("absolute bottom-5 left-10 right-10")}>
  <Text render={({ pageNumber, totalPages }) =>
    `${pageNumber} / ${totalPages}`
  } />
</View>
```

## Render server-side

```ts
import { renderPdf } from "@packages/react-pdf/render";
import { HelloWorldTemplate } from
  "@packages/react-pdf/templates/helloworld";

const instance = renderPdf(<HelloWorldTemplate locale="es-CL" />);
const buffer = await instance.toBuffer();
```

Route must authenticate, authorize tenant/org data, then return `application/pdf`. Never trust
record ID without RLS/permission check.

## Markdown

Use bundled `Markdown` component for supported mdast nodes. See
`templates/markdown-demo.tsx`. Unsupported markdown must be added deliberately to renderer.

## Adding template

1. Add template file.
2. Use provider/consumer split for locale.
3. Export props + template + optional default props.
4. Register preview route in `src/components/router.tsx`.
5. Test multiple pages, wrapping, long content, locale.
6. Run format/build.

No barrel exports; package wildcard handles direct paths.
