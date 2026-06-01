"use client";

import type { GraphyError } from "@packages/graphy/graphy";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/hooks/use-rosetta";
import { PERMISSION_SLUG_WILDCARD } from "../../schemas";

const LOCALE_ES = {
  presets_label: "Plantillas",
  presets_hint: "Aplica una plantilla y luego ajusta los permisos individualmente.",
  permissions_label: "Permisos ({{count}})",
  wildcard_label: "Acceso completo (dueño)",
  wildcard_description: "Cubre todos los permisos actuales y futuros de la organización.",
  done: "Listo",
  remove_button: "Remover de la organización",
  remove_confirm: "¿Remover esta membresía? Perderá acceso a la organización.",
  wildcard_footer:
    'Cuando alguien tiene "acceso completo" el comodín cubre cualquier permiso. Quítalo si quieres asignar permisos de forma individual.',
  save_failed: "No pudimos guardar el cambio. Intenta de nuevo.",
  last_admin_protected: "Esta organización quedaría sin administradores. Primero dale acceso completo a otra persona.",
  self_remove_blocked: "Para salir de la organización pídele a otro administrador que te remueva.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    presets_label: "Templates",
    presets_hint: "Apply a template and tweak individual permissions afterwards.",
    permissions_label: "Permissions ({{count}})",
    wildcard_label: "Full access (owner)",
    wildcard_description: "Covers every current and future permission in the organization.",
    done: "Done",
    remove_button: "Remove from organization",
    remove_confirm: "Remove this membership? They'll lose access to the organization.",
    wildcard_footer:
      'When someone has "full access" the wildcard covers any permission. Remove it to assign permissions individually.',
    save_failed: "We couldn't save the change. Try again.",
    last_admin_protected:
      "This would leave the organization without any administrators. Give full access to someone else first.",
    self_remove_blocked: "To leave the organization, ask another administrator to remove you.",
  } satisfies typeof LOCALE_ES,
  pt: {
    presets_label: "Modelos",
    presets_hint: "Aplique um modelo e ajuste as permissões individualmente.",
    permissions_label: "Permissões ({{count}})",
    wildcard_label: "Acesso completo (dono)",
    wildcard_description: "Cobre todas as permissões atuais e futuras da organização.",
    done: "Pronto",
    remove_button: "Remover da organização",
    remove_confirm: "Remover esta membresia? Vai perder o acesso à organização.",
    wildcard_footer:
      'Quando alguém tem "acesso completo" o coringa cobre qualquer permissão. Remova-o se quiser atribuir permissões individualmente.',
    save_failed: "Não conseguimos salvar a alteração. Tente novamente.",
    last_admin_protected: "A organização ficaria sem administradores. Dê acesso completo a outra pessoa primeiro.",
    self_remove_blocked: "Para sair da organização, peça a outro administrador para te remover.",
  } satisfies typeof LOCALE_ES,
};

/**
 * Maps a Postgres trigger exception message to a locale key for the UI.
 * Falls back to `save_failed` when no specific code is recognized.
 * @example
 * setError(t(MAP_PG_ERROR_KEY(err)));
 */
function MAP_PG_ERROR_KEY(err: GraphyError): "last_admin_protected" | "self_remove_blocked" | "save_failed" {
  const msg = err.message;
  if (msg.includes("last_admin_protected")) return "last_admin_protected";
  if (msg.includes("self_remove_blocked")) return "self_remove_blocked";
  return "save_failed";
}

const GrantPermissionMutation = /*#__PURE__*/ gql(`
  mutation EditMembershipGrantPermissionMutation($membership_id: Int!, $permission_id: String!) {
    insertIntomembership_permissionsCollection(
      objects: [{ membership_id: $membership_id, permission_id: $permission_id }]
    ) {
      affectedCount
    }
  }
`);

const RevokePermissionMutation = /*#__PURE__*/ gql(`
  mutation EditMembershipRevokePermissionMutation($membership_id: Int!, $permission_id: String!) {
    deleteFrommembership_permissionsCollection(
      filter: { membership_id: { eq: $membership_id }, permission_id: { eq: $permission_id } }
    ) {
      affectedCount
    }
  }
`);

const RevokeMembershipMutation = /*#__PURE__*/ gql(`
  mutation EditMembershipRevokeMembershipMutation($membership_id: Int!, $now: Datetime!) {
    updatemembershipsCollection(
      filter: { membership_id: { eq: $membership_id } }
      set: { membership_revoked_at: $now }
    ) {
      affectedCount
    }
  }
`);

interface PermissionRow {
  permission_id: string;
  permission_description: string | null;
}

interface PresetRow {
  permission_preset_id: number;
  permission_preset_name: string;
  permission_preset_slugs: (string | null)[] | null;
  organization_id: number | null;
}

interface Props {
  membership_id: number;
  permissions: PermissionRow[];
  presets: PresetRow[];
  grantedSlugs: string[];
  membersHref: string;
}

type OptimisticAction =
  | { kind: "set_wildcard"; value: boolean }
  | { kind: "set_permission"; permission_id: string; granted: boolean }
  | { kind: "apply_preset"; slugs: string[] };

function APPLY_OPTIMISTIC(state: { wildcard: boolean; slugs: Set<string> }, action: OptimisticAction) {
  switch (action.kind) {
    case "set_wildcard":
      return { ...state, wildcard: action.value };
    case "set_permission": {
      const slugs = new Set(state.slugs);
      if (action.granted) slugs.add(action.permission_id);
      else slugs.delete(action.permission_id);
      return { ...state, slugs };
    }
    case "apply_preset": {
      const next = new Set<string>();
      let wildcard = false;
      for (const s of action.slugs) {
        if (s === PERMISSION_SLUG_WILDCARD) wildcard = true;
        else next.add(s);
      }
      return { wildcard, slugs: next };
    }
  }
}

export function EditPermissionsForm({ membership_id, permissions, presets, grantedSlugs, membersHref }: Props) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [, grantPermission] = useGraphyMutation(GrantPermissionMutation);
  const [, revokePermission] = useGraphyMutation(RevokePermissionMutation);
  const [, revokeMembership] = useGraphyMutation(RevokeMembershipMutation);

  const initialWildcard = grantedSlugs.includes(PERMISSION_SLUG_WILDCARD);
  const initialSlugs = new Set(grantedSlugs.filter((s) => s !== PERMISSION_SLUG_WILDCARD));
  const [state, applyOptimistic] = useOptimistic({ wildcard: initialWildcard, slugs: initialSlugs }, APPLY_OPTIMISTIC);

  /**
   * Grants or revokes one permission row, returning whether the write succeeded.
   * @example
   * const ok = await writePermission("payroll_run", true);
   */
  async function writePermission(permission_id: string, granted: boolean): Promise<boolean> {
    if (granted) {
      const { error: err } = await grantPermission({ membership_id, permission_id });
      if (err) {
        setError(t(MAP_PG_ERROR_KEY(err)));
        return false;
      }
    } else {
      const { error: err } = await revokePermission({ membership_id, permission_id });
      if (err) {
        setError(t(MAP_PG_ERROR_KEY(err)));
        return false;
      }
    }
    return true;
  }

  function togglePermission(permission_id: string, granted: boolean) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "set_permission", permission_id, granted });
      const ok = await writePermission(permission_id, granted);
      if (ok) router.refresh();
    });
  }

  function toggleWildcard(next: boolean) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "set_wildcard", value: next });
      const ok = await writePermission(PERMISSION_SLUG_WILDCARD, next);
      if (ok) router.refresh();
    });
  }

  /**
   * Reconciles the granted permissions to match a preset's slug set, one mutation per diff.
   * @example
   * <Button onClick={() => applyPreset(preset)}>{preset.permission_preset_name}</Button>
   */
  function applyPreset(preset: PresetRow) {
    const slugs = (preset["permission_preset_slugs"] ?? []).filter((s): s is string => typeof s === "string");
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "apply_preset", slugs });

      const wantWildcard = slugs.includes(PERMISSION_SLUG_WILDCARD);
      if (wantWildcard !== state.wildcard) {
        const ok = await writePermission(PERMISSION_SLUG_WILDCARD, wantWildcard);
        if (!ok) {
          router.refresh();
          return;
        }
      }

      const desired = new Set(slugs.filter((s) => s !== PERMISSION_SLUG_WILDCARD));
      for (const slug of desired) {
        if (!state.slugs.has(slug)) {
          const ok = await writePermission(slug, true);
          if (!ok) {
            router.refresh();
            return;
          }
        }
      }
      for (const slug of state.slugs) {
        if (!desired.has(slug)) {
          const ok = await writePermission(slug, false);
          if (!ok) {
            router.refresh();
            return;
          }
        }
      }
      router.refresh();
    });
  }

  function removeMember() {
    if (!window.confirm(t("remove_confirm"))) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await revokeMembership({ membership_id, now: new Date().toISOString() });
      if (err) {
        setError(t(MAP_PG_ERROR_KEY(err)));
        return;
      }
      router.push(membersHref);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {presets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>{t("presets_label")}</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset["permission_preset_id"]}
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => applyPreset(preset)}
              >
                {preset["permission_preset_name"]}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">{t("presets_hint")}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>{t("permissions_label", { count: state.wildcard ? permissions.length : state.slugs.size })}</Label>
        <div className="flex items-start gap-2 rounded-md border p-3">
          <Checkbox
            id="perm_wildcard"
            checked={state.wildcard}
            disabled={pending}
            onCheckedChange={(checked) => toggleWildcard(Boolean(checked))}
          />
          <div className="flex flex-col">
            <Label htmlFor="perm_wildcard" className="cursor-pointer font-medium">
              {t("wildcard_label")}
            </Label>
            <span className="text-muted-foreground text-xs">{t("wildcard_description")}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {permissions.map((perm) => {
            const slug = perm["permission_id"];
            const checked = state.slugs.has(slug);
            return (
              <div key={slug} className="flex items-start gap-2 rounded-md border p-2" aria-disabled={state.wildcard}>
                <Checkbox
                  id={`perm_${slug}`}
                  checked={state.wildcard || checked}
                  disabled={state.wildcard || pending}
                  onCheckedChange={(value) => togglePermission(slug, Boolean(value))}
                />
                <div className="flex flex-col">
                  <Label htmlFor={`perm_${slug}`} className="cursor-pointer text-sm">
                    {slug}
                  </Label>
                  {perm["permission_description"] && (
                    <span className="text-muted-foreground text-xs">{perm["permission_description"]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">{t("wildcard_footer")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={removeMember}
        >
          {t("remove_button")}
        </Button>
        <Button type="button" disabled={pending} onClick={() => router.push(membersHref)}>
          {t("done")}
        </Button>
      </div>
    </div>
  );
}
