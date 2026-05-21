import { Text } from "@react-pdf/renderer";
import { HelloWorldTemplate, helloWorldDefaultProps } from "../templates/helloworld";

export type PDFTemplateID = "helloworld";

export const PDF_PAGES: { id: PDFTemplateID; component: any; props: any }[] = [
  {
    id: "helloworld",
    component: HelloWorldTemplate,
    props: helloWorldDefaultProps,
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
