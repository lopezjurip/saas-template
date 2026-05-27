import { RUT_NORMALIZE, RUT_VALIDATE } from "@packages/utils/rut";
import { z } from "zod";

export const documentTripletShape = {
  address_level0_id: z.string().max(2).optional().or(z.literal("")),
  profile_identity_document_kind: z.enum(["nin", "passport"]).optional().or(z.literal("")),
  profile_identity_document_value: z.string().max(40).optional().or(z.literal("")),
};

export type DocumentTripletValues = {
  address_level0_id?: string | "";
  profile_identity_document_kind?: "nin" | "passport" | "";
  profile_identity_document_value?: string | "";
};

export type NormalizedDocumentTriplet = {
  country: string;
  kind: "nin" | "passport";
  value: string;
};

/**
 * Optional-document refinement. The triplet is fully optional — partial entries are
 * accepted silently (the trigger / extract helper just won't materialize anything in
 * the DB). The only validation that fires is when the value field is non-empty AND the
 * country/kind context implies a specific format (e.g. CL+NIN must be a valid RUT).
 */
export function REFINE_DOCUMENT_TRIPLET(values: DocumentTripletValues, ctx: z.RefinementCtx) {
  const country = (values["address_level0_id"] || "").trim();
  const kind = values["profile_identity_document_kind"] || "";
  const value = (values["profile_identity_document_value"] || "").trim();

  if (value === "") return;
  if (country === "CL" && kind === "nin") {
    if (!RUT_VALIDATE(RUT_NORMALIZE(value))) {
      ctx.addIssue({
        code: "custom",
        path: ["profile_identity_document_value"],
        message: "RUT inválido (verifica el dígito verificador)",
      });
    }
    return;
  }
  const cleaned = value.replace(/[^0-9a-zA-Z]/g, "");
  if (cleaned.length < 4 || cleaned.length > 32) {
    ctx.addIssue({
      code: "custom",
      path: ["profile_identity_document_value"],
      message: "El documento debe tener entre 4 y 32 caracteres",
    });
  }
}

export function EXTRACT_DOCUMENT_TRIPLET(values: DocumentTripletValues): NormalizedDocumentTriplet | null {
  const country = (values["address_level0_id"] || "").trim();
  const kind = values["profile_identity_document_kind"];
  const value = (values["profile_identity_document_value"] || "").trim();
  if (!country || !kind || !value) return null;
  return { country, kind, value };
}
