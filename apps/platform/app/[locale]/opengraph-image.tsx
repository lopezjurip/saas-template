import { ImageResponse } from "next/og";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, type SupportedLocale } from "~/lib/i18n";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Humane";

const LOCALES: Record<SupportedLocale, { title: string; tagline: string; tag: string }> = {
  es: { title: "Humane", tagline: "HR y Nómina para empresas chilenas", tag: "Chat-first" },
  en: { title: "Humane", tagline: "HR & Payroll for Chilean companies", tag: "Chat-first" },
  pt: { title: "Humane", tagline: "RH e Folha de pagamento para empresas chilenas", tag: "Chat-first" },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
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
        <span>resolvecom.com</span>
        <span style={{ textTransform: "uppercase", letterSpacing: 3 }}>{safeLocale}</span>
      </div>
    </div>,
    { ...size },
  );
}
