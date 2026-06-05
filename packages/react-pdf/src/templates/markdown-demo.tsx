import { Document, Page } from "@react-pdf/renderer";
import { Markdown } from "../components/markdown";
import { tw } from "../lib/tw";

const DEMO_MARKDOWN = `
# Heading 1

## Heading 2

### Heading 3

Regular paragraph with **bold text** and *italic text* and **bold *nested italic* bold**.

---

**PRIMERO:** Definiciones

**"Término de ejemplo":** Este es el significado del término, el cual aplica para todos los efectos del presente Contrato, ya sea en singular o plural.

---

Unordered list:

- Item one with **bold**
- Item two with *italic*
- Item three plain

Ordered list:

1. First item
2. Second item with **emphasis**
3. Third item

---

> This is a blockquote paragraph used for special notices or callouts.

A paragraph with a [link to SaaS Template](https://example.com) inline.
`.trim();

export const markdownDemoDefaultProps = {};

export function MarkdownDemoTemplate() {
  return (
    <Document>
      <Page size="A4" style={tw("text-sm leading-6 py-20 px-20")}>
        <Markdown>{DEMO_MARKDOWN}</Markdown>
      </Page>
    </Document>
  );
}
