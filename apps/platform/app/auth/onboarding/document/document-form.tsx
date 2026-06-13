"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type DocumentTripletCountry, DocumentTripletFields } from "~/app/auth/_components/document-triplet-fields";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CheckDocumentValues, checkDocumentSchema } from "../../document/schemas";

type Props = {
  countries: DocumentTripletCountry[];
};

/**
 * Collects the country-specific document triplet during onboarding.
 * @example <DocumentForm countries={countries} />
 */
export function DocumentForm({ countries }: Props) {
  const { t } = useRosetta(LOCALES);
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
    setTimeout(() => router.push(ROUTE_HREF(ROUTE("/auth/onboarding"))), 700);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border bg-muted/35 p-5 text-center">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background">
          <Check size={18} />
        </span>
        <strong className="text-sm font-medium text-foreground">{t("saved")}</strong>
        <span className="text-xs text-muted-foreground">{t("redirecting")}</span>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <DocumentTripletFields form={form} countries={countries} required />

      <p className="text-xs leading-[1.4] text-muted-foreground">{t("hint")}</p>

      <Button type="submit" className="h-10 w-full">
        <span>{t("save")}</span>
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  saved: "Documento guardado",
  redirecting: "Volviendo al inicio…",
  hint: "Necesitamos el país para adaptar el formato y la validación del documento. Para algunos países también pediremos una foto más adelante.",
  save: "Guardar documento",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    saved: "Document saved",
    redirecting: "Returning to overview…",
    hint: "We need the country to adapt the document format and validation. For some countries we will also ask for a photo later.",
    save: "Save document",
  } satisfies typeof LOCALE_ES,
  pt: {
    saved: "Documento salvo",
    redirecting: "Voltando ao início…",
    hint: "Precisamos do país para adaptar o formato e a validação do documento. Para alguns países também pediremos uma foto mais tarde.",
    save: "Salvar documento",
  } satisfies typeof LOCALE_ES,
};
