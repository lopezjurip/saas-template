type DocumentKind = "nin" | "passport";

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
