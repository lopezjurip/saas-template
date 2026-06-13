import { ImageResponse } from "next/og";
import type { SupportedLocale } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SaaS Template";

const LOCALES: Record<SupportedLocale, { title: string; tagline: string; tag: string }> = {
  "es-CL": { title: "SaaS Template", tagline: "Plantilla SaaS lista para producción", tag: "Chat-first" },
  "en-US": { title: "SaaS Template", tagline: "Production-ready SaaS template", tag: "Chat-first" },
  "pt-BR": { title: "SaaS Template", tagline: "Template SaaS pronto para produção", tag: "Chat-first" },
};

export default async function Image() {
  const safeLocale = await getServerLocale();
  const content = LOCALES[safeLocale];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: 80,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#f8fafc",
            color: "#0f172a",
            fontWeight: 800,
            fontSize: 32,
          }}
        >
          H
        </div>
        <span style={{ fontSize: 24, letterSpacing: 4, opacity: 0.7, textTransform: "uppercase" }}>{content.tag}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1 }}>{content.title}</div>
        <div style={{ fontSize: 44, lineHeight: 1.25, opacity: 0.85, maxWidth: 900 }}>{content.tagline}</div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, opacity: 0.6 }}
      >
        <span>example.com</span>
        <span style={{ textTransform: "uppercase", letterSpacing: 3 }}>{safeLocale}</span>
      </div>
    </div>,
    { ...size },
  );
}
