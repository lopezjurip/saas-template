import { Text } from "@react-pdf/renderer";
import { HelloWorldTemplate, helloWorldDefaultProps } from "../templates/helloworld";
import { MarkdownDemoTemplate, markdownDemoDefaultProps } from "../templates/markdown-demo";

export type PDFTemplateID = "helloworld" | "markdown-demo";

export const PDF_PAGES: { id: PDFTemplateID; component: any; props: any }[] = [
  {
    id: "helloworld",
    component: HelloWorldTemplate,
    props: helloWorldDefaultProps,
  },
  {
    id: "markdown-demo",
    component: MarkdownDemoTemplate,
    props: markdownDemoDefaultProps,
  },
];

export function PDFRouter({ template }: { template: PDFTemplateID }) {
  for (const { id, component: Preview, props: defaultProps } of PDF_PAGES) {
    if (id === template) {
      return <Preview {...defaultProps} />;
    }
  }

  return <Text>Plantilla no encontrada: {template}</Text>;
}
