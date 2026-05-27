import { LocaleProvider, useRosetta } from "@packages/rosetta/use-rosetta";
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { tw } from "../lib/tw";

const PROGRESS_BARS = [
  { label: "Layout", pct: 95, color: "#1e40af" },
  { label: "Typography", pct: 88, color: "#4f46e5" },
  { label: "Colors", pct: 100, color: "#059669" },
  { label: "Borders", pct: 82, color: "#7c3aed" },
  { label: "Links", pct: 70, color: "#d97706" },
];

const PALETTE = [
  { color: "#1e40af", label: "blue-800" },
  { color: "#4f46e5", label: "indigo-600" },
  { color: "#7c3aed", label: "violet-700" },
  { color: "#059669", label: "emerald-600" },
  { color: "#d97706", label: "amber-600" },
  { color: "#e11d48", label: "rose-600" },
  { color: "#4b5563", label: "gray-600" },
];

const GRID_STATS = [
  { num: "A4", label: "page size" },
  { num: "2", label: "pages" },
  { num: "36pt", label: "font max" },
  { num: "100%", label: "type-safe" },
  { num: "PDF", label: "output" },
  { num: "v4", label: "renderer" },
];

const CARD_HEADERS = [
  {
    title: "Flexbox Layout",
    bg: "#1e40af",
    body: "react-pdf supports flexbox just like the web — rows, columns, wrap, gap, flex, alignItems, justifyContent. Build complex multi-column documents with ease.",
  },
  {
    title: "StyleSheet / tw()",
    bg: "#059669",
    body: "Use react-pdf-tailwind's tw() to apply Tailwind utility classes as react-pdf styles. Combine conditionally with clsx — no custom StyleSheet needed.",
  },
  {
    title: "Multi-page",
    bg: "#7c3aed",
    body: "Documents span multiple pages. Use the fixed prop for persistent headers/footers, and render page numbers with the built-in render prop.",
  },
];

const LOCALE_EN = {
  "hero.tagline": "@packages/react-pdf",
  "hero.title": "Hello, World!",
  "hero.subtitle":
    "A showcase of @react-pdf/renderer + react-pdf-tailwind: typography, layout, color, flexbox, links, and multi-page documents — all type-safe.",
  "section.typography": "Typography",
  "section.palette": "Color Palette",
  "section.grid": "Layout Grid",
  "footer.title": "Hello World — react-pdf showcase",
  "page2.label": "Page 2",
  "page2.title": "More Capabilities",
  "section.progress": "Progress Bars — View + borderRadius",
  "section.nested": "Nested Layout",
  "section.links": "Links",
};

const LOCALES = {
  en: LOCALE_EN,
  es: {
    "hero.tagline": "@packages/react-pdf",
    "hero.title": "¡Hola, Mundo!",
    "hero.subtitle":
      "Demostración de @react-pdf/renderer + react-pdf-tailwind: tipografía, diseño, color, flexbox, enlaces y documentos multipágina — todo con tipos.",
    "section.typography": "Tipografía",
    "section.palette": "Paleta de Colores",
    "section.grid": "Cuadrícula de Diseño",
    "footer.title": "Hola Mundo — demostración react-pdf",
    "page2.label": "Página 2",
    "page2.title": "Más Capacidades",
    "section.progress": "Barras de Progreso — View + borderRadius",
    "section.nested": "Diseño Anidado",
    "section.links": "Enlaces",
  } satisfies typeof LOCALE_EN,
};

export interface HelloWorldTemplateProps {
  /** BCP 47 locale tag. Defaults to "en". */
  locale?: string;
}

export function HelloWorldTemplate({ locale = "en" }: HelloWorldTemplateProps) {
  return (
    <LocaleProvider locale={locale}>
      <HelloWorldContent />
    </LocaleProvider>
  );
}

function HelloWorldContent() {
  const { t } = useRosetta(LOCALES);

  return (
    <Document title="Hello World — react-pdf showcase" author="Humane">
      {/* ── Page 1 ── */}
      <Page size="A4" style={tw("bg-white font-helvetica text-gray-900 text-xs")}>
        {/* Hero */}
        <View style={tw("bg-blue-800 py-8 px-12")}>
          <Text style={tw("text-blue-200 text-xs uppercase tracking-widest mb-2")}>{t("hero.tagline")}</Text>
          <Text style={tw("text-white font-bold text-4xl leading-tight mb-3")}>{t("hero.title")}</Text>
          <Text style={tw("text-blue-200 text-sm leading-relaxed")}>{t("hero.subtitle")}</Text>
          <View style={tw("flex-row gap-2 mt-4")}>
            {["Typography", "Layout", "Colors", "Links"].map((tag, i) => {
              const bgs = ["bg-indigo-600", "bg-emerald-600", "bg-violet-700", "bg-amber-600"];
              return (
                <View key={tag} style={tw(`${bgs[i]} rounded-full px-3 py-1`)}>
                  <Text style={tw("text-white font-bold text-xs")}>{tag}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={tw("px-10 py-6")}>
          {/* Feature cards */}
          <View style={tw("flex-row gap-3 mb-6")}>
            {CARD_HEADERS.map(({ title, bg, body }) => (
              <View key={title} style={tw("flex-1 rounded border border-gray-200 overflow-hidden")}>
                <View style={{ ...tw("py-2 px-3"), backgroundColor: bg }}>
                  <Text style={tw("text-white font-bold text-xs")}>{title}</Text>
                </View>
                <View style={tw("p-3 bg-white")}>
                  <Text style={tw("text-gray-600 text-xs leading-relaxed")}>{body}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Typography */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>
            {t("section.typography")}
          </Text>
          <View style={tw("border-t border-gray-200 mb-5")} />
          <View style={tw("flex-row gap-5 mb-6")}>
            <View style={tw("flex-1")}>
              <Text style={tw("font-bold text-2xl text-gray-900 leading-tight mb-1")}>Heading 1</Text>
              <Text style={tw("font-bold text-xl text-gray-900 leading-tight mb-1")}>Heading 2</Text>
              <Text style={tw("font-bold text-base text-blue-800 leading-snug")}>Heading 3 — colored</Text>
            </View>
            <View style={tw("flex-1")}>
              <Text style={tw("text-sm text-gray-600 leading-relaxed mb-2")}>
                Body text at 14pt with 1.6 line-height. Mix Helvetica, Helvetica-Bold, and Helvetica-Oblique for
                emphasis without registering custom fonts.
              </Text>
              <Text style={tw("italic text-xs text-gray-400 leading-relaxed")}>
                Caption / label — italic, small, muted. For metadata and footnotes.
              </Text>
            </View>
          </View>

          {/* Color palette */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>
            {t("section.palette")}
          </Text>
          <View style={tw("border-t border-gray-200 mb-5")} />
          <View style={tw("flex-row gap-2 mb-6")}>
            {PALETTE.map(({ color, label }) => (
              <View key={label} style={{ ...tw("flex-1 h-8 rounded p-1 justify-end"), backgroundColor: color }}>
                <Text style={tw("text-white font-bold")} wrap={false}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats grid — two rows of 3 */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>{t("section.grid")}</Text>
          <View style={tw("border-t border-gray-200 mb-4")} />
          {[GRID_STATS.slice(0, 3), GRID_STATS.slice(3)].map((row, ri) => (
            <View key={`row-${ri}`} style={tw("flex-row gap-2 mb-2")}>
              {row.map(({ num, label }) => (
                <View key={label} style={tw("flex-1 border border-gray-200 bg-gray-50 rounded py-3 px-2 items-center")}>
                  <Text style={tw("font-bold text-2xl text-blue-800 mb-1")}>{num}</Text>
                  <Text style={tw("text-xs text-gray-400 tracking-wide")}>{label}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View
          style={tw(
            "absolute bottom-5 left-10 right-10 flex-row justify-between items-center border-t border-gray-200 pt-2",
          )}
          fixed
        >
          <Text style={tw("text-xs text-gray-400")}>{t("footer.title")}</Text>
          <Link src="https://react-pdf.org" style={tw("text-xs text-blue-500 no-underline")}>
            react-pdf.org
          </Link>
          <Text
            style={tw("text-xs text-gray-400")}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* ── Page 2 ── */}
      <Page size="A4" style={tw("bg-white font-helvetica text-gray-900 text-xs")}>
        {/* Mini hero */}
        <View style={tw("bg-blue-800 py-5 px-12")}>
          <Text style={tw("text-blue-200 text-xs uppercase tracking-widest mb-1")}>{t("page2.label")}</Text>
          <Text style={tw("text-white font-bold text-2xl leading-tight")}>{t("page2.title")}</Text>
        </View>

        <View style={tw("px-10 py-6")}>
          {/* Progress bars */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>
            {t("section.progress")}
          </Text>
          <View style={tw("border-t border-gray-200 mb-5")} />
          <View style={tw("mb-6")}>
            {PROGRESS_BARS.map(({ label, pct, color }) => (
              <View key={label} style={tw("flex-row items-center gap-2 mb-2")}>
                <Text style={tw("text-xs text-gray-600 w-16")}>{label}</Text>
                <View style={tw("flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden")}>
                  <View style={{ ...tw("h-1.5 rounded-full"), backgroundColor: color, width: `${pct}%` }} />
                </View>
                <Text style={tw("text-xs text-gray-400 w-6 text-right")}>{pct}%</Text>
              </View>
            ))}
          </View>

          {/* Nested layout */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>
            {t("section.nested")}
          </Text>
          <View style={tw("border-t border-gray-200 mb-5")} />
          <View style={tw("flex-row gap-3 mb-6")}>
            <View style={tw("flex-[2] bg-gray-50 border border-gray-200 rounded p-4")}>
              <Text style={tw("font-bold text-base text-blue-800 mb-2")}>Nested Views</Text>
              <Text style={tw("text-xs text-gray-600 leading-relaxed mb-3")}>
                Views nest arbitrarily deep. Each is a flex container. Combine borders, backgrounds, padding, and
                rounded corners to build rich layouts.
              </Text>
              <View style={tw("flex-row gap-2")}>
                {["flex", "gap", "wrap", "align", "justify"].map((tag) => (
                  <View key={tag} style={tw("bg-blue-100 rounded px-2 py-1")}>
                    <Text style={tw("text-xs text-blue-800 font-bold")}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={tw("flex-1 gap-2")}>
              {[
                { label: "Borders", color: "#1e40af" },
                { label: "Radius", color: "#4f46e5" },
                { label: "Opacity", color: "#7c3aed" },
                { label: "Overflow", color: "#059669" },
              ].map(({ label, color }) => (
                <View
                  key={label}
                  style={{ ...tw("flex-1 rounded justify-center items-center border-2"), borderColor: color }}
                >
                  <Text style={{ ...tw("text-xs font-bold"), color }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Links */}
          <Text style={tw("font-bold text-xs text-gray-400 uppercase tracking-widest mb-2")}>{t("section.links")}</Text>
          <View style={tw("border-t border-gray-200 mb-5")} />
          <View style={tw("bg-gray-50 border border-gray-200 rounded p-4 flex-row gap-6 items-center")}>
            <Text style={tw("flex-1 text-xs text-gray-600 leading-relaxed")}>
              The{" "}
              <Link src="https://react-pdf.org" style={tw("text-blue-500 no-underline")}>
                react-pdf.org
              </Link>{" "}
              docs cover all primitives. PDFs support clickable hyperlinks out of the box — wrap any Text in a Link with
              a src prop.
            </Text>
            <View style={tw("gap-2")}>
              <Link src="https://react-pdf.org" style={tw("text-sm text-blue-500 no-underline")}>
                react-pdf.org
              </Link>
              <Link src="https://github.com/diegomura/react-pdf" style={tw("text-sm text-blue-500 no-underline")}>
                GitHub repo
              </Link>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={tw(
            "absolute bottom-5 left-10 right-10 flex-row justify-between items-center border-t border-gray-200 pt-2",
          )}
          fixed
        >
          <Text style={tw("text-xs text-gray-400")}>{t("footer.title")}</Text>
          <Link src="https://react-pdf.org" style={tw("text-xs text-blue-500 no-underline")}>
            react-pdf.org
          </Link>
          <Text
            style={tw("text-xs text-gray-400")}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export const helloWorldDefaultProps: HelloWorldTemplateProps = {};
