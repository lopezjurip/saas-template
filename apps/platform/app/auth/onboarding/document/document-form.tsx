"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type DocumentTripletCountry, DocumentTripletFields } from "~/app/auth/_components/document-triplet-fields";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CheckDocumentValues, checkDocumentSchema } from "../../document/schemas";

const log = debug("app:forms:onboarding-document");

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
  const supabase = useSupabase();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckDocumentValues>({
    resolver: zodResolver(checkDocumentSchema),
    defaultValues: {
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
    },
  });

  async function onSubmit(values: CheckDocumentValues) {
    setError(null);
    const { data: userResult } = await supabase.auth.getUser();
    const profile_id = userResult.user?.id;
    if (!profile_id) {
      router.push(ROUTE_HREF(ROUTE("/auth")));
      return;
    }
    // RLS self-write (profile_id = viewer); the DB trigger normalizes/validates the value.
    // Upsert so re-submitting the same (country, kind) overwrites instead of conflicting.
    const { error: upsertError } = await supabase.from("profile_identities").upsert(
      {
        profile_id,
        address_level0_id: values.address_level0_id,
        profile_identity_document_kind: values.profile_identity_document_kind,
        profile_identity_document_value: values.profile_identity_document_value,
      },
      { onConflict: "profile_id,address_level0_id,profile_identity_document_kind" },
    );
    if (upsertError) {
      log.error("[onSubmit] failed to upsert profile identity: %o", upsertError);
      setError(t("error"));
      return;
    }
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 w-full">
        <span>{form.formState.isSubmitting ? t("saving") : t("save")}</span>
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  saved: "Documento guardado",
  redirecting: "Volviendo al inicio…",
  hint: "Necesitamos el país para adaptar el formato y la validación del documento. Para algunos países también pediremos una foto más adelante.",
  save: "Guardar documento",
  saving: "Guardando…",
  error: "No pudimos guardar el documento. Revisa el valor e intenta de nuevo.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    saved: "Document saved",
    redirecting: "Returning to overview…",
    hint: "We need the country to adapt the document format and validation. For some countries we will also ask for a photo later.",
    save: "Save document",
    saving: "Saving…",
    error: "We couldn't save the document. Check the value and try again.",
  } satisfies typeof LOCALE_ES,
  pt: {
    saved: "Documento salvo",
    redirecting: "Voltando ao início…",
    hint: "Precisamos do país para adaptar o formato e a validação do documento. Para alguns países também pediremos uma foto mais tarde.",
    save: "Salvar documento",
    saving: "Salvando…",
    error: "Não foi possível salvar o documento. Verifique o valor e tente novamente.",
  } satisfies typeof LOCALE_ES,
};
