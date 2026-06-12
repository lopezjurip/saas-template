"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  type DocumentTripletCountry,
  DocumentTripletFields,
} from "~/app/[locale]/auth/_components/document-triplet-fields";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CheckDocumentValues, checkDocumentSchema } from "../../../document/schemas";

type Props = {
  countries: DocumentTripletCountry[];
};

/**
 * Collects the country-specific document triplet during onboarding.
 * @example <DocumentForm countries={countries} />
 */
export function DocumentForm({ countries }: Props) {
  const locale = useLocaleParam();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const form = useForm<CheckDocumentValues>({
    resolver: zodResolver(checkDocumentSchema),
    defaultValues: {
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
    },
  });

  function onSubmit(values: CheckDocumentValues) {
    void values;
    setDone(true);
    setTimeout(() => router.push(ROUTE_HREF(ROUTE("/[locale]/auth/onboarding", { locale }))), 700);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border bg-muted/35 p-5 text-center">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background">
          <Check size={18} />
        </span>
        <strong className="text-sm font-medium text-foreground">Documento guardado</strong>
        <span className="text-[12.5px] text-muted-foreground">Volviendo al inicio…</span>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <DocumentTripletFields form={form} countries={countries} required />

      <p className="text-xs leading-[1.4] text-muted-foreground">
        Necesitamos el país para adaptar el formato y la validación del documento. Para algunos países también pediremos
        una foto más adelante.
      </p>

      <Button type="submit" className="h-10 w-full">
        <span>Guardar documento</span>
      </Button>
    </form>
  );
}
