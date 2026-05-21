import { type DocumentProps, pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export function renderPdf(element: ReactElement<DocumentProps>) {
  return pdf(element);
}
