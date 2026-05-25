"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui-common/shadcn/components/ui/dialog";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { UserPlus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRosetta } from "~/hooks/use-rosetta";
import { actionInviteMember } from "./actions";
import { type InviteMemberValues, inviteMemberSchema, PERMISSION_SLUG_WILDCARD } from "./schemas";

const LOCALE_ES = {
  invite_button: "Invitar",
  title: "Invitar a {{organization}}",
  description: "Enviaremos un correo con un link mágico. La persona elegirá su contraseña o passkey al entrar.",
  email_label: "Correo",
  email_placeholder: "nombre@empresa.cl",
  presets_label: "Plantillas",
  preset_global_badge: "global",
  presets_hint: "Aplica una plantilla y luego ajusta los permisos individualmente si lo necesitas.",
  permissions_label: "Permisos ({{count}})",
  clear_button: "Limpiar",
  wildcard_label: "Acceso completo (dueño)",
  wildcard_description: "Cubre todos los permisos actuales y futuros de la organización.",
  submit: "Enviar invitación",
  submitting: "Enviando…",
  cancel: "Cancelar",
  form_invalid: "Formulario inválido",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    invite_button: "Invite",
    title: "Invite to {{organization}}",
    description: "We'll send a magic-link email. They'll pick a password or passkey when they sign in.",
    email_label: "Email",
    email_placeholder: "name@company.com",
    presets_label: "Templates",
    preset_global_badge: "global",
    presets_hint: "Apply a template and tweak individual permissions afterwards if you need to.",
    permissions_label: "Permissions ({{count}})",
    clear_button: "Clear",
    wildcard_label: "Full access (owner)",
    wildcard_description: "Covers every current and future permission in the organization.",
    submit: "Send invitation",
    submitting: "Sending…",
    cancel: "Cancel",
    form_invalid: "Invalid form",
  } satisfies typeof LOCALE_ES,
  pt: {
    invite_button: "Convidar",
    title: "Convidar para {{organization}}",
    description: "Enviaremos um e-mail com link mágico. A pessoa escolherá sua senha ou passkey ao entrar.",
    email_label: "E-mail",
    email_placeholder: "nome@empresa.com",
    presets_label: "Modelos",
    preset_global_badge: "global",
    presets_hint: "Aplique um modelo e ajuste as permissões individualmente se precisar.",
    permissions_label: "Permissões ({{count}})",
    clear_button: "Limpar",
    wildcard_label: "Acesso completo (dono)",
    wildcard_description: "Cobre todas as permissões atuais e futuras da organização.",
    submit: "Enviar convite",
    submitting: "Enviando…",
    cancel: "Cancelar",
    form_invalid: "Formulário inválido",
  } satisfies typeof LOCALE_ES,
};

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
  organization_id: number;
  organization_name: string;
  permissions: PermissionRow[];
  presets: PresetRow[];
}

export function InviteMemberDialog({ organization_id, organization_name, permissions, presets }: Props) {
  const r = useRosetta(LOCALES);
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      organization_id,
      invitation_email: "",
      invitation_permission_slugs: [],
    },
  });

  const selectedSlugs = form.watch("invitation_permission_slugs");
  const hasWildcard = useMemo(() => selectedSlugs.includes(PERMISSION_SLUG_WILDCARD), [selectedSlugs]);
  const selectedCount = selectedSlugs.length;

  const togglePermission = (slug: string, checked: boolean) => {
    const current = form.getValues("invitation_permission_slugs");
    const next = checked ? Array.from(new Set([...current, slug])) : current.filter((s) => s !== slug);
    form.setValue("invitation_permission_slugs", next, { shouldValidate: true, shouldDirty: true });
  };

  const applyPreset = (preset: PresetRow) => {
    const slugs = (preset["permission_preset_slugs"] ?? []).filter((s): s is string => typeof s === "string");
    form.setValue("invitation_permission_slugs", slugs, { shouldValidate: true, shouldDirty: true });
  };

  const reset = () => {
    form.reset({ organization_id, invitation_email: "", invitation_permission_slugs: [] });
    setServerError(null);
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await actionInviteMember(values);
      if (res?.serverError) {
        setServerError(res.serverError);
        return;
      }
      if (res?.validationErrors) {
        setServerError(r.t("form_invalid"));
        return;
      }
      reset();
      setOpen(false);
    });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          {r.t("invite_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{r.t("title", { organization: organization_name })}</DialogTitle>
          <DialogDescription>{r.t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invitation_email">{r.t("email_label")}</Label>
            <Input
              id="invitation_email"
              type="email"
              autoComplete="email"
              placeholder={r.t("email_placeholder")}
              aria-invalid={!!form.formState.errors.invitation_email}
              {...form.register("invitation_email")}
            />
            {form.formState.errors.invitation_email && (
              <p className="text-destructive text-xs">{form.formState.errors.invitation_email.message}</p>
            )}
          </div>

          {presets.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>{r.t("presets_label")}</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset["permission_preset_id"]}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset["permission_preset_name"]}
                    {preset["organization_id"] === null ? (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {r.t("preset_global_badge")}
                      </Badge>
                    ) : null}
                  </Button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{r.t("presets_hint")}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>{r.t("permissions_label", { count: selectedCount })}</Label>
              {selectedCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    form.setValue("invitation_permission_slugs", [], { shouldValidate: true, shouldDirty: true })
                  }
                >
                  {r.t("clear_button")}
                </Button>
              )}
            </div>
            <div className="flex items-start gap-2 rounded-md border p-3">
              <Checkbox
                id="perm_wildcard"
                checked={hasWildcard}
                onCheckedChange={(checked) => {
                  if (checked) {
                    form.setValue("invitation_permission_slugs", [PERMISSION_SLUG_WILDCARD], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  } else {
                    togglePermission(PERMISSION_SLUG_WILDCARD, false);
                  }
                }}
              />
              <div className="flex flex-col">
                <Label htmlFor="perm_wildcard" className="cursor-pointer font-medium">
                  {r.t("wildcard_label")}
                </Label>
                <span className="text-muted-foreground text-xs">{r.t("wildcard_description")}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {permissions.map((perm) => {
                const slug = perm["permission_id"];
                const checked = selectedSlugs.includes(slug);
                return (
                  <div key={slug} className="flex items-start gap-2 rounded-md border p-2" aria-disabled={hasWildcard}>
                    <Checkbox
                      id={`perm_${slug}`}
                      checked={hasWildcard || checked}
                      disabled={hasWildcard}
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
            {form.formState.errors.invitation_permission_slugs && (
              <p className="text-destructive text-xs">{form.formState.errors.invitation_permission_slugs.message}</p>
            )}
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                {r.t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? r.t("submitting") : r.t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
