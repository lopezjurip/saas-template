"use client";

import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
import { Controller, type FieldValues, type UseFormReturn } from "react-hook-form";
import { useRosetta } from "~/lib/i18n.client";
import { DOCUMENT_VALUE_LABEL, DOCUMENT_VALUE_PLACEHOLDER } from "./document-labels";

export type DocumentTripletCountry = {
  addressLevel0Id: string;
  addressLevel0Name: string;
  addressLevel0Emoji?: string | null;
};

type Props<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>;
  countries: DocumentTripletCountry[];
  legend?: string;
  required?: boolean;
};

export function DocumentTripletFields<TFormValues extends FieldValues>({
  form,
  countries,
  legend,
  required = false,
}: Props<TFormValues>) {
  const { t } = useRosetta(LOCALES);
  const { control, watch } = form;
  const country = (watch("address_level0_id" as never) as unknown as string | undefined) ?? "CL";
  const kind = ((watch("profile_identity_document_kind" as never) as unknown as string | undefined) ?? "nin") as
    | "nin"
    | "passport";
  const isClNin = country === "CL" && kind === "nin";
  const ninLabel = DOCUMENT_VALUE_LABEL(country, "nin");
  const valuePlaceholder = DOCUMENT_VALUE_PLACEHOLDER(country, kind);

  const fields = (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address_level0_id">{t("label_country")}</Label>
        <Controller
          control={control}
          name={"address_level0_id" as never}
          render={({ field }) => (
            <Select value={(field.value as string) || "CL"} onValueChange={field.onChange}>
              <SelectTrigger id="address_level0_id" className="w-full">
                <SelectValue placeholder={t("select_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem
                    key={c["addressLevel0Id"]}
                    value={c["addressLevel0Id"]}
                    textValue={c["addressLevel0Name"]}
                  >
                    {c["addressLevel0Emoji"] ? `${c["addressLevel0Emoji"]} ` : ""}
                    {c["addressLevel0Name"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        control={control}
        name={"profile_identity_document_value" as never}
        render={({ field, fieldState }) => {
          function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
            const raw = e.target.value;
            if (isClNin) {
              field.onChange(RUT_NORMALIZE(raw));
            } else {
              field.onChange(raw);
            }
          }
          function onBlurHandler() {
            if (isClNin) {
              const normalized = field.value as string;
              if (normalized && normalized.length > 1) {
                field.onChange(RUT_FORMAT(normalized));
              }
            }
            field.onBlur();
          }
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile_identity_document_value">{t("label_document")}</Label>
              <div className="border-input focus-within:ring-ring/50 focus-within:border-ring flex items-stretch overflow-hidden rounded-md border bg-transparent focus-within:ring-[3px]">
                <Controller
                  control={control}
                  name={"profile_identity_document_kind" as never}
                  render={({ field: kindField }) => (
                    <Select value={(kindField.value as string) || "nin"} onValueChange={kindField.onChange}>
                      <SelectTrigger
                        size="sm"
                        className="border-input shrink-0 rounded-none border-0 border-r bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-input focus-visible:outline-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nin">{ninLabel}</SelectItem>
                        <SelectItem value="passport">{t("passport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <input
                  id="profile_identity_document_value"
                  placeholder={valuePlaceholder}
                  autoComplete="off"
                  value={(field.value as string | undefined) ?? ""}
                  onBlur={onBlurHandler}
                  ref={field.ref as React.Ref<HTMLInputElement>}
                  onChange={onChangeHandler}
                  aria-invalid={!!fieldState.error}
                  className="flex-1 min-w-0 bg-transparent px-3 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
                />
              </div>
              {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
            </div>
          );
        }}
      />
    </>
  );

  /**
   * When required (page-level form like /auth/document or invite tab), render naked —
   * the containing Card already provides a visual frame. When optional (signup forms),
   * wrap in a fieldset to group it visually as a "secondary" block within a bigger form.
   */
  if (required) {
    return <div className="flex flex-col gap-3">{fields}</div>;
  }

  return (
    <fieldset className="border-border flex flex-col gap-3 rounded-md border p-3">
      <legend className="text-muted-foreground px-1 text-xs">{legend ?? t("optional_legend")}</legend>
      {fields}
    </fieldset>
  );
}

const LOCALE_ES = {
  label_country: "País",
  label_document: "Documento",
  passport: "Pasaporte",
  select_placeholder: "Selecciona…",
  optional_legend: "Documento de identidad (opcional)",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_country: "Country",
  label_document: "Document",
  passport: "Passport",
  select_placeholder: "Select…",
  optional_legend: "Identity document (optional)",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_country: "País",
  label_document: "Documento",
  passport: "Passaporte",
  select_placeholder: "Selecione…",
  optional_legend: "Documento de identidade (opcional)",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
