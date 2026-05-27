import { z } from "zod";
import { documentTripletShape, REFINE_DOCUMENT_TRIPLET } from "~/app/[locale]/auth/_components/document-triplet-schema";

export const signupSchema = z
  .object({
    full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
    email: z.email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    ...documentTripletShape,
  })
  .superRefine(REFINE_DOCUMENT_TRIPLET);

export type SignupValues = z.infer<typeof signupSchema>;
