import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { PDF_PAGES, PDFRouter, type PDFTemplateID } from "./components/router";

function useStateQuery(key: string, defaultValue: string) {
  const searchParams = new URLSearchParams(location.search);
  const initial = searchParams.get(key) || defaultValue;
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const newUrl = new URL(location.href);
    newUrl.searchParams.set(key, value);
    history.replaceState(null, "", newUrl.toString());
  }, [key, value]);

  return [value, setValue] as const;
}

function App() {
  const [template, setTemplate] = useStateQuery("template", "helloworld");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "8px 16px",
          background: "#1e40af",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#fff", fontFamily: "sans-serif", fontSize: 13, fontWeight: 600 }}>PDF Preview</span>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ fontSize: 13, padding: "2px 6px", borderRadius: 4 }}
        >
          {PDF_PAGES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.id}
            </option>
          ))}
        </select>
      </div>

      <PDFViewer width="100%" style={{ flex: 1, border: "none" }} key={template}>
        <PDFRouter template={template as PDFTemplateID} />
      </PDFViewer>
    </div>
  );
}

export default App;
