import type { Thing, WithContext } from "schema-dts";

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: This is required to render JSON-LD scripts in React.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
