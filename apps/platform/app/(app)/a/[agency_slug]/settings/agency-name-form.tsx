"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";

const UpdateAgencyNameMutation = /*#__PURE__*/ gql(`
  mutation UpdateAgencyNameMutation($agency_id: Int!, $agency_name: String!) {
    updateAgenciesCollection(
      filter: { agencyId: { eq: $agency_id } }
      set: { agencyName: $agency_name }
    ) {
      affectedCount
    }
  }
`);

/**
 * Agency rename control. Agencies have no self-management permission catalog — authority
 * rides on membership (the same set that can load the settings page), so the row is updated
 * straight from the client via pg_graphql, gated by the "agencies update by affiliates" RLS
 * policy (no Server Action, no RPC). RLS silently affects 0 rows when the caller isn't a
 * member, so success is keyed on affectedCount rather than the mere absence of an error.
 *
 * @example <AgencyNameForm agencyId={1} agencyName="BDO Auditors" />
 */
export function AgencyNameForm({ agencyId, agencyName }: { agencyId: number; agencyName: string }) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [name, setName] = useState(agencyName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [updateState, updateAgency] = useGraphyMutation(UpdateAgencyNameMutation);
  const pending = updateState.isValidating;

  const dirty = name.trim() !== agencyName && name.trim().length > 0;

  async function onSave() {
    setError(null);
    setSaved(false);
    const { data, error: mutationError } = await updateAgency({ agency_id: agencyId, agency_name: name.trim() });
    if (mutationError || !data?.["updateAgenciesCollection"]?.["affectedCount"]) {
      setError(t("save_failed"));
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="agency-name">{t("name_label")}</Label>
      <Input
        id="agency-name"
        value={name}
        disabled={pending}
        maxLength={256}
        onChange={(event) => {
          setName(event.target.value);
          setSaved(false);
        }}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="mt-1 flex items-center gap-3">
        <Button size="sm" disabled={!dirty || pending} onClick={onSave}>
          {pending ? t("saving") : t("save")}
        </Button>
        {saved && !dirty ? <span className="text-muted-foreground text-xs">{t("saved")}</span> : null}
      </div>
    </div>
  );
}

const LOCALE_ES = {
  name_label: "Nombre de la agencia",
  save: "Guardar",
  saving: "Guardando…",
  saved: "Guardado",
  save_failed: "No pudimos guardar los cambios. Intenta de nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  name_label: "Agency name",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  save_failed: "We couldn't save the changes. Try again.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  name_label: "Nome da agência",
  save: "Salvar",
  saving: "Salvando…",
  saved: "Salvo",
  save_failed: "Não foi possível salvar as alterações. Tente novamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
