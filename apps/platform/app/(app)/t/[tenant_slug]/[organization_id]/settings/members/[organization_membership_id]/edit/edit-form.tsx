"use client";

import type { GraphyError } from "@packages/graphy/graphy";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE_HREF } from "~/lib/route";
import { PERMISSION_SLUG_WILDCARD } from "../../schemas";

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
  mutation EditOrganizationMembershipGrantPermissionMutation($objects: [OrganizationMembershipPermissionsInsertInput!]!) {
    insertIntoOrganizationMembershipPermissionsCollection(objects: $objects) {
      affectedCount
    }
  }
`);

const RevokePermissionMutation = /*#__PURE__*/ gql(`
  mutation EditOrganizationMembershipRevokePermissionMutation($filter: OrganizationMembershipPermissionsFilter!, $atMost: Int! = 1000) {
    deleteFromOrganizationMembershipPermissionsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`);

const RevokeOrganizationMembershipMutation = /*#__PURE__*/ gql(`
  mutation EditOrganizationMembershipRevokeOrganizationMembershipMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
    }
  }
`);

/**
 * Atomic set-replacement: replaces a membership's entire grant set in one transaction
 * (the SQL RPC validates `members_manage` + every slug, then adds/deletes the diff).
 * Replaces the per-permission grant/revoke loop used when applying a preset.
 */
const SetPermissionsMutation = /*#__PURE__*/ gql(`
  mutation EditOrganizationMembershipSetPermissionsMutation($organizationMembershipId: Int!, $permissionIds: [String]!) {
    viewerOrganizationMembershipSetPermissions(
      organizationMembershipId: $organizationMembershipId
      permissionIds: $permissionIds
    ) {
      edges { node { permissionId } }
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
  organization_membership_id: number;
  permissions: PermissionRow[];
  presets: PresetRow[];
  grantedSlugs: string[];
  membersHref: Route;
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

export function EditPermissionsForm({
  organization_membership_id,
  permissions,
  presets,
  grantedSlugs,
  membersHref,
}: Props) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [, grantPermission] = useGraphyMutation(GrantPermissionMutation);
  const [, revokePermission] = useGraphyMutation(RevokePermissionMutation);
  const [, revokeOrganizationMembership] = useGraphyMutation(RevokeOrganizationMembershipMutation);
  const [, setPermissions] = useGraphyMutation(SetPermissionsMutation);

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
      const { error: err } = await grantPermission({
        objects: [{ organizationMembershipId: organization_membership_id, permissionId: permission_id }],
      });
      if (err) {
        setError(t(MAP_PG_ERROR_KEY(err)));
        return false;
      }
    } else {
      const { error: err } = await revokePermission({
        filter: {
          organizationMembershipId: { eq: organization_membership_id },
          permissionId: { eq: permission_id },
        },
      });
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
   * Replaces the membership's whole grant set with the preset's slugs in one atomic mutation —
   * no partial state if a single write fails mid-way.
   * @example
   * <Button onClick={() => applyPreset(preset)}>{preset.permission_preset_name}</Button>
   */
  function applyPreset(preset: PresetRow) {
    const slugs = (preset["permission_preset_slugs"] ?? []).filter((s): s is string => typeof s === "string");
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "apply_preset", slugs });
      const { error: err } = await setPermissions({
        organizationMembershipId: organization_membership_id,
        permissionIds: slugs,
      });
      if (err) setError(t(MAP_PG_ERROR_KEY(err)));
      router.refresh();
    });
  }

  function removeMember() {
    if (!window.confirm(t("remove_confirm"))) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await revokeOrganizationMembership({
        filter: { organizationMembershipId: { eq: organization_membership_id } },
        set: { organizationMembershipRevokedAt: new Date().toISOString() },
      });
      if (err) {
        setError(t(MAP_PG_ERROR_KEY(err)));
        return;
      }
      router.push(ROUTE_HREF(membersHref));
    });
  }

  const count = state.wildcard ? permissions.length : state.slugs.size;

  return (
    <div className="flex flex-col gap-6">
      {presets.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("presets_label")}
          </span>
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
          <p className="text-muted-foreground text-xs leading-normal">{t("presets_hint")}</p>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("permissions_label", { count })}
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Check size={12} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
            {t("saved_instant")}
          </span>
        </div>

        <div
          className={cn(
            "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 transition-[background,border-color]",
            state.wildcard ? "border-emerald-600/40 bg-emerald-500/6" : "border-border bg-background",
          )}
        >
          <Checkbox
            id="perm_wildcard"
            checked={state.wildcard}
            disabled={pending}
            onCheckedChange={(checked) => toggleWildcard(Boolean(checked))}
            className="mt-0.5"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex items-center gap-2">
              <Label htmlFor="perm_wildcard" className="cursor-pointer text-sm font-semibold">
                {t("wildcard_label")}
              </Label>
              <code className="text-muted-foreground/80 font-mono text-xs">*</code>
            </span>
            <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">
              {t("wildcard_description")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {permissions.map((perm) => {
            const slug = perm["permission_id"];
            const on = state.wildcard || state.slugs.has(slug);
            return (
              <div
                key={slug}
                className={cn(
                  "flex items-start gap-2.5 rounded-md border px-3 py-2.5 transition-[background,border-color]",
                  on ? "border-foreground/35 bg-muted/40" : "border-border bg-background",
                  state.wildcard && "opacity-70",
                )}
              >
                <Checkbox
                  id={`perm_${slug}`}
                  checked={on}
                  disabled={state.wildcard || pending}
                  onCheckedChange={(value) => togglePermission(slug, Boolean(value))}
                  className="mt-0.5"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Label htmlFor={`perm_${slug}`} className="cursor-pointer">
                    <code className="text-foreground font-mono text-xs">{slug}</code>
                  </Label>
                  {perm["permission_description"] && (
                    <span className="text-muted-foreground text-xs leading-[1.4] text-pretty">
                      {perm["permission_description"]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-muted-foreground text-xs leading-normal text-pretty">{t("wildcard_footer")}</p>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border-border flex items-center justify-between gap-3 border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={removeMember}
        >
          {t("remove_button")}
        </Button>
        <Button type="button" disabled={pending} onClick={() => router.push(ROUTE_HREF(membersHref))}>
          {t("done")} <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  presets_label: "Plantillas",
  presets_hint: "Aplica una plantilla y luego ajusta los permisos individualmente.",
  saved_instant: "Se guarda al instante",
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
    saved_instant: "Saved instantly",
    permissions_label: "Permissions ({{count}})",
    wildcard_label: "Full access (owner)",
    wildcard_description: "Covers every current and future permission in the organization.",
    done: "Done",
    remove_button: "Remove from organization",
    remove_confirm: "Remove this organization_membership? They'll lose access to the organization.",
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
    saved_instant: "Salvo na hora",
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
