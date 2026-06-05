---
name: my-pdf
description: React PDF patterns using @react-pdf/renderer, template structure, fonts, styling, and API routes.
---

# React PDF Templates

## Setup

**Install in `packages/react-pdf`:**
```bash
npm install @react-pdf/renderer
npm install -D @types/react-pdf
```

**Create `packages/react-pdf/src/lib/fonts.ts`:**
```typescript
import { Font } from "@react-pdf/renderer";

// Register fonts (must load before rendering)
Font.register({
  family: "Helvetica",
  src: "https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf",
});

Font.register({
  family: "Helvetica-Bold",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});
```

## Component Structure

Split into provider + content layers (same as email):

```typescript
// packages/react-pdf/src/templates/liquidacion.tsx
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { useRosetta, LocaleProvider } from "@packages/use-rosetta";
import type { Liquidacion } from "~/types";

const LOCALES = {
  es: {
    "title": "Liquidación de Sueldo",
    "period": "Período: {{from}} a {{to}}",
    "gross": "Sueldo Bruto",
    "net": "Líquido a Pagar",
  },
  en: {
    "title": "Payroll Statement",
    "period": "Period: {{from}} to {{to}}",
    "gross": "Gross Salary",
    "net": "Net Amount",
  },
} as const;

// Provider wrapper
export function LiquidacionDocument({
  data,
  locale = "es",
}: {
  data: Liquidacion;
  locale?: string;
}) {
  return (
    <LocaleProvider locale={locale}>
      <LiquidacionContent data={data} />
    </LocaleProvider>
  );
}

// Consumer
function LiquidacionContent({ data }: { data: Liquidacion }) {
  const { t } = useRosetta(LOCALES);

  return (
    <Document>
      <Page size="A4" style={{ padding: 40 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold" }}>
            {t("title")}
          </Text>
          <Text style={{ fontSize: 10, color: "#666" }}>
            {t("period", {
              from: data.period_start,
              to: data.period_end,
            })}
          </Text>
        </View>

        {/* Earnings table */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold" }}>
              {t("gross")}: ${data.gross}
            </Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={{ marginBottom: 20 }}>
          {data.deductions.map((d) => (
            <View key={d.id} style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ flex: 1, fontSize: 10 }}>{d.name}</Text>
              <Text style={{ fontSize: 10, textAlign: "right" }}>
                -${d.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Net */}
        <View style={{ borderTop: "2px solid #000", paddingTop: 8 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ flex: 1, fontFamily: "Helvetica-Bold" }}>
              {t("net")}
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>
              ${data.net}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

## Styling

@react-pdf doesn't support CSS — use `StyleSheet` or inline objects:

```typescript
import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottom: "1px solid #eee",
  },
  label: { flex: 1, fontSize: 10 },
  amount: { fontSize: 10, textAlign: "right", width: 100 },
});

<View style={styles.row}>
  <Text style={styles.label}>Salary</Text>
  <Text style={styles.amount}>$5,000</Text>
</View>
```

## API Route for PDF Generation

**`apps/platform/app/api/pdf/liquidacion/route.ts`:**
```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import { LiquidacionDocument } from "@packages/react-pdf";
import type { Database } from "~/supabase.types";

type Liquidacion = Database["public"]["Tables"]["liquidaciones"]["Row"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const liquidacionId = searchParams.get("id");
  const locale = searchParams.get("locale") || "es";

  if (!liquidacionId) {
    return new Response("Missing liquidacion id", { status: 400 });
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("liquidaciones")
    .select("*")
    .eq("id", Number(liquidacionId))
    .single();

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <LiquidacionDocument data={data} locale={locale} />
  );

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="liquidacion-${data.id}.pdf"`,
    },
  });
}
```

## Download from Client

```typescript
"use client";

export function DownloadLiquidacionButton({ liquidacionId }: { liquidacionId: number }) {
  const handleDownload = async () => {
    const response = await fetch(
      `/api/pdf/liquidacion?id=${liquidacionId}&locale=es`
    );
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidacion-${liquidacionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return <button onClick={handleDownload}>Descargar PDF</button>;
}
```

## Images

```typescript
import { Image } from "@react-pdf/renderer";

<Image
  src="https://example.com/logo.png"
  style={{ width: 100, height: 50, marginBottom: 20 }}
/>
```

Only HTTP(S) URLs work. Inline base64 also supported:
```typescript
const base64 = await fetch("/logo.png").then((r) => r.arrayBuffer()).then((b) => btoa(String.fromCharCode(...new Uint8Array(b))));
<Image src={`data:image/png;base64,${base64}`} />
```

## Tables

```typescript
import { Table, TableCell, TableHead, TableBody, TableRow } from "@react-pdf/renderer";

<Table>
  <TableHead>
    <TableRow>
      <TableCell>Item</TableCell>
      <TableCell>Amount</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>${item.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Performance

PDFs with large datasets can freeze. Use:
- Pagination (split into multiple pages)
- Lazy render (conditionally render sections)
- Stream from server (for very large PDFs)

```typescript
// Paginate if >100 items
const itemsPerPage = 50;
const pages = [];

for (let i = 0; i < data.items.length; i += itemsPerPage) {
  pages.push(data.items.slice(i, i + itemsPerPage));
}

{pages.map((pageItems) => (
  <Page key={pageItems[0].id}>
    {pageItems.map((item) => <Text>{item.name}</Text>)}
  </Page>
))}
```

## Avoid in react-pdf

- CSS/Tailwind (use `StyleSheet`)
- React hooks inside templates (❌ `useRosetta` directly — wrap in LocaleProvider)
- `<div>`, `<span>`, DOM elements (use `<View>`, `<Text>`)
- SVG (use PNG/JPG images)
