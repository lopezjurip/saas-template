export type LegalLocale = "es" | "en" | "pt";
export type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";

export type LegalNavItem = { id: LegalSection; label: string; path: string };

export type LegalCopy = {
  sidebarTitle: string;
};

export const LEGAL_NAV = {
  es: [
    { id: "terms", label: "Términos del servicio", path: "/legal/terms" },
    { id: "privacy", label: "Privacidad", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Seguridad", path: "/legal/security" },
  ],
  en: [
    { id: "terms", label: "Terms of Service", path: "/legal/terms" },
    { id: "privacy", label: "Privacy", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Security", path: "/legal/security" },
  ],
  pt: [
    { id: "terms", label: "Termos de Serviço", path: "/legal/terms" },
    { id: "privacy", label: "Privacidade", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Segurança", path: "/legal/security" },
  ],
} satisfies Record<LegalLocale, LegalNavItem[]>;

export const LEGAL_COPY = {
  es: { sidebarTitle: "Documentos" },
  en: { sidebarTitle: "Documents" },
  pt: { sidebarTitle: "Documentos" },
} satisfies Record<LegalLocale, LegalCopy>;

export function LEGAL_LOCALE(locale: string): LegalLocale {
  if (locale === "en" || locale === "pt") return locale;
  return "es";
}
