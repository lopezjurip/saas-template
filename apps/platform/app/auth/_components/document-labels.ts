import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";

type DocumentKind = "nin" | "passport";

/**
 * True only for the one (country, kind) tuple we know how to format/validate: a Chilean RUT.
 * Every other country is an unknown formatting rule — we keep the raw value untouched.
 */
function IS_KNOWN_FORMAT(country: string, kind: DocumentKind): boolean {
  return country === "CL" && kind === "nin";
}

/**
 * Preferred label per (country, kind) tuple. The "nin" kind is contextual per country —
 * in Chile it's "RUT", in Brazil "CPF", in Argentina "DNI", etc. The DB column stays
 * `nin` (national identification number) regardless of country.
 */
const NIN_LABEL_BY_COUNTRY: Record<string, string> = {
  CL: "RUT",
  BR: "CPF",
  AR: "DNI",
  CO: "Cédula de ciudadanía",
  MX: "CURP",
  PE: "DNI",
  UY: "Cédula de identidad",
  PY: "Cédula de identidad",
  EC: "Cédula",
  BO: "Cédula de identidad",
  VE: "Cédula de identidad",
  ES: "DNI",
  PT: "Cartão de Cidadão",
  US: "SSN",
};

const NIN_PLACEHOLDER_BY_COUNTRY: Record<string, string> = {
  CL: "12.345.678-9",
  BR: "000.000.000-00",
  AR: "12345678",
  CO: "1234567890",
  MX: "AAAA000000HAAAAA00",
  PE: "12345678",
};

export function DOCUMENT_VALUE_LABEL(country: string, kind: DocumentKind): string {
  if (kind === "passport") return "Pasaporte";
  return NIN_LABEL_BY_COUNTRY[country] ?? "Número de documento";
}

export function DOCUMENT_VALUE_PLACEHOLDER(country: string, kind: DocumentKind): string {
  if (kind === "passport") return "AB1234567";
  return NIN_PLACEHOLDER_BY_COUNTRY[country] ?? "ABC123456";
}

/**
 * Normalizes a document value as the user types. For a Chilean RUT we strip everything down to
 * digits + verifier (so re-formatting on blur is deterministic); for every other country/kind we
 * have no rule, so the raw input passes through unchanged.
 * @example
 * NORMALIZE_DOCUMENT("CL", "nin", "18.523.312-k") // "18523312K"
 * NORMALIZE_DOCUMENT("BR", "nin", "000.000.000-00") // "000.000.000-00"
 * NORMALIZE_DOCUMENT("CL", "passport", "P 12 34") // "P 12 34"
 */
export function NORMALIZE_DOCUMENT(country: string, kind: DocumentKind, raw: string): string {
  return IS_KNOWN_FORMAT(country, kind) ? RUT_NORMALIZE(raw) : raw;
}

/**
 * Formats a document value for display (used on mount and on blur). For a Chilean RUT we render
 * dots + dash; for every other country/kind we have no rule, so the value is returned as-is —
 * never coerce an unknown country's document into Chilean RUT shape.
 * @example
 * FORMAT_DOCUMENT("CL", "nin", "18523312K") // "18.523.312-K"
 * FORMAT_DOCUMENT("AR", "nin", "12345678") // "12345678"
 * FORMAT_DOCUMENT("CL", "passport", "P1234567") // "P1234567"
 */
export function FORMAT_DOCUMENT(country: string, kind: DocumentKind, value: string): string {
  if (!IS_KNOWN_FORMAT(country, kind) || value.length <= 1) return value;
  return RUT_FORMAT(value, { dots: true, dash: true });
}
