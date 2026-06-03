// Agencies feature — mock data model + pure helpers.
// UI-only: no DB, RLS, JWT, or permission wiring (a later pass owns that).
// Platform-level groups of external people with cross-org read access.
// Data-only (no JSX): label/icon presentation lives in the consuming pages,
// where it goes through Rosetta. This module is the source of truth for which
// agencies, affiliates, permission slugs and grants exist.

export type AgencyKind = "audit" | "government" | "internal" | "accounting";
export type AffiliationState = "accepted" | "pending" | "revoked" | "rejected";
export type GrantKind = "explicit" | "implicit";

export type AgencyPermissionDef = {
  slug: string;
  label: string;
  desc: string;
};

// Agency capabilities are read-only by design. No write slugs exist.
export const AGENCY_PERMISSIONS: AgencyPermissionDef[] = /*#__PURE__*/ [
  { slug: "payroll_view", label: "Ver remuneraciones", desc: "Planillas, liquidaciones y haberes." },
  { slug: "reports_view", label: "Ver reportes", desc: "Paneles de analítica y estados financieros." },
  { slug: "documents_view", label: "Ver documentos", desc: "Contratos, anexos y respaldos." },
  { slug: "members_view", label: "Ver miembros", desc: "Listado de personas de la organización." },
  { slug: "compliance_view", label: "Ver cumplimiento", desc: "Datos tributarios y de cumplimiento normativo." },
  { slug: "audit_export", label: "Exportar auditoría", desc: "Descargar respaldos en CSV o PDF." },
];

export const AGENCY_WILDCARD = "*";

// ── Tenants / organizations the platform manages ────────────────────────────

export type Org = {
  id: string;
  name: string;
  slug: string;
  tenant: string;
  members: number;
};

export const ORGS: Org[] = /*#__PURE__*/ [
  { id: "org_acme", name: "Acme Studio", slug: "acme", tenant: "acme", members: 24 },
  { id: "org_corteza", name: "Corteza SpA", slug: "corteza", tenant: "corteza", members: 58 },
  { id: "org_andes", name: "Andes Retail", slug: "andes", tenant: "andes", members: 132 },
  { id: "org_vega", name: "Vega Salud", slug: "vega", tenant: "vega", members: 41 },
  { id: "org_nimbus", name: "Nimbus Labs", slug: "nimbus", tenant: "nimbus", members: 12 },
];

const ORG_INDEX = /*#__PURE__*/ (() => {
  const out: Record<string, Org> = {};
  for (const o of ORGS) out[o.id] = o;
  return out;
})();

// ── Agencies (the external firms) ───────────────────────────────────────────

export type Grant = {
  orgId: string | null; // null = global, every tenant + org
  slugs: string[];
  kind: GrantKind;
};

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  state: AffiliationState;
  role: string;
  joinedMeta: string;
};

export type Agency = {
  id: string;
  name: string;
  slug: string;
  kind: AgencyKind;
  blurb: string;
  affiliates: Affiliate[];
  grants: Grant[];
};

export const AGENCIES: Agency[] = /*#__PURE__*/ [
  {
    id: "ag_bdo",
    name: "BDO Auditores",
    slug: "bdo-auditores",
    kind: "audit",
    blurb: "Firma de auditoría externa contratada para revisar remuneraciones y estados financieros.",
    affiliates: [
      {
        id: "af_01",
        name: "María Soto",
        email: "msoto@bdo.cl",
        state: "accepted",
        role: "Socia auditora",
        joinedMeta: "Afiliada hace 8 meses",
      },
      {
        id: "af_02",
        name: "Felipe Vera",
        email: "fvera@bdo.cl",
        state: "accepted",
        role: "Auditor senior",
        joinedMeta: "Afiliado hace 6 meses",
      },
      {
        id: "af_03",
        name: "Daniela Rojas",
        email: "drojas@bdo.cl",
        state: "pending",
        role: "Auditora",
        joinedMeta: "Invitada hace 3 días",
      },
      {
        id: "af_04",
        name: "Ignacio Lillo",
        email: "ilillo@bdo.cl",
        state: "revoked",
        role: "Auditor",
        joinedMeta: "Acceso revocado hace 1 mes",
      },
    ],
    grants: [
      { orgId: "org_acme", slugs: ["payroll_view", "reports_view", "audit_export"], kind: "explicit" },
      { orgId: "org_corteza", slugs: ["payroll_view", "documents_view"], kind: "explicit" },
      { orgId: "org_andes", slugs: ["reports_view"], kind: "implicit" },
    ],
  },
  {
    id: "ag_sii",
    name: "Fiscalizadores SII",
    slug: "fiscalizadores-sii",
    kind: "government",
    blurb:
      "Servicio de Impuestos Internos. Revisión de cumplimiento tributario sobre los contribuyentes de la plataforma.",
    affiliates: [
      {
        id: "af_11",
        name: "Patricia Núñez",
        email: "pnunez@sii.cl",
        state: "accepted",
        role: "Fiscalizadora",
        joinedMeta: "Afiliada hace 1 año",
      },
      {
        id: "af_12",
        name: "Rodrigo Pavez",
        email: "rpavez@sii.cl",
        state: "accepted",
        role: "Fiscalizador",
        joinedMeta: "Afiliado hace 1 año",
      },
      {
        id: "af_13",
        name: "Camila Ortiz",
        email: "cortiz@sii.cl",
        state: "rejected",
        role: "Fiscalizadora",
        joinedMeta: "Rechazó la invitación",
      },
    ],
    grants: [
      { orgId: "org_acme", slugs: ["compliance_view"], kind: "implicit" },
      { orgId: "org_corteza", slugs: ["compliance_view"], kind: "implicit" },
      { orgId: "org_andes", slugs: ["compliance_view"], kind: "implicit" },
      { orgId: "org_vega", slugs: ["compliance_view"], kind: "implicit" },
    ],
  },
  {
    id: "ag_humane",
    name: "Soporte Humane",
    slug: "soporte-humane",
    kind: "internal",
    blurb:
      "Equipo interno de soporte de la plataforma. Acceso global de solo lectura para diagnosticar y acompañar a cualquier organización.",
    affiliates: [
      {
        id: "af_21",
        name: "Sofía Carrasco",
        email: "sofia@humane.app",
        state: "accepted",
        role: "Soporte L2",
        joinedMeta: "Equipo interno",
      },
      {
        id: "af_22",
        name: "Tomás Aguirre",
        email: "tomas@humane.app",
        state: "accepted",
        role: "Soporte L1",
        joinedMeta: "Equipo interno",
      },
    ],
    grants: [{ orgId: null, slugs: [AGENCY_WILDCARD], kind: "explicit" }],
  },
  {
    id: "ag_larrain",
    name: "Contadores Larraín",
    slug: "contadores-larrain",
    kind: "accounting",
    blurb: "Estudio contable externo que lleva la contabilidad de un grupo de clientes en la plataforma.",
    affiliates: [
      {
        id: "af_31",
        name: "Andrés Larraín",
        email: "andres@larrain.cl",
        state: "accepted",
        role: "Contador jefe",
        joinedMeta: "Afiliado hace 2 meses",
      },
      {
        id: "af_32",
        name: "Javiera Mella",
        email: "jmella@larrain.cl",
        state: "pending",
        role: "Contadora",
        joinedMeta: "Invitada ayer",
      },
    ],
    grants: [
      { orgId: "org_vega", slugs: ["reports_view", "documents_view", "audit_export"], kind: "explicit" },
      { orgId: "org_nimbus", slugs: ["reports_view", "documents_view"], kind: "explicit" },
    ],
  },
];

// ── Derived helpers (pure) ──────────────────────────────────────────────────

export function AGENCY_BY_SLUG(slug: string): Agency | undefined {
  return AGENCIES.find((a) => a.slug === slug);
}

export function ORG_BY_ID(id: string): Org | undefined {
  return ORG_INDEX[id];
}

export function IS_GLOBAL_AGENCY(a: Agency): boolean {
  return a.grants.some((g) => g.orgId === null && g.slugs.includes(AGENCY_WILDCARD));
}

export function ACTIVE_AFFILIATES(a: Agency): Affiliate[] {
  return a.affiliates.filter((af) => af.state === "accepted");
}

export function SCOPED_ORG_COUNT(a: Agency): number {
  const ids = new Set<string>();
  for (const g of a.grants) if (g.orgId) ids.add(g.orgId);
  return ids.size;
}

// Agencies that have access to a specific org (from the org's point of view).
export function AGENCIES_FOR_ORG(orgId: string): { agency: Agency; grant: Grant }[] {
  const out: { agency: Agency; grant: Grant }[] = [];
  for (const a of AGENCIES) {
    const global = a.grants.find((g) => g.orgId === null);
    if (global) {
      out.push({ agency: a, grant: global });
      continue;
    }
    const g = a.grants.find((gr) => gr.orgId === orgId);
    if (g) out.push({ agency: a, grant: g });
  }
  return out;
}

export type AccessibleOrg = { org: Org; slugs: string[]; implicit: boolean };

// Orgs an affiliate of this agency can read (the affiliate-portal point of view).
export function AFFILIATE_ORGS(a: Agency): AccessibleOrg[] {
  if (IS_GLOBAL_AGENCY(a)) {
    return ORGS.map((o) => ({ org: o, slugs: [AGENCY_WILDCARD], implicit: false }));
  }
  const out: AccessibleOrg[] = [];
  for (const g of a.grants) {
    if (!g.orgId) continue;
    const org = ORG_INDEX[g.orgId];
    if (org) out.push({ org, slugs: g.slugs, implicit: g.kind === "implicit" });
  }
  return out;
}

export function INITIALS_OF(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}
