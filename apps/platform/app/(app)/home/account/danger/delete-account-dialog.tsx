"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
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
import { Lock, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionDeleteAccount } from "../actions";

export function DeleteAccountDialog() {
  const { t } = useRosetta(LOCALES);
  const confirmWord = t("confirm_word");

  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = confirmation === confirmWord && password.length > 0 && !pending;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setConfirmation("");
      setPassword("");
      setServerError(null);
    }
  }

  function onDelete() {
    setServerError(null);
    startTransition(async () => {
      // Success redirects server-side (navigation in flight); only surface real errors.
      const [, error] = await ErrorSafeAction.unwrap(actionDeleteAccount({ password }));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-destructive/45 bg-background px-3 text-xs font-medium text-destructive hover:bg-destructive/6 dark:border-[hsl(0_70%_50%/0.5)] dark:text-[hsl(0_70%_70%)]"
        >
          <Trash2 size={14} /> {t("trigger_label")}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="grid grid-cols-[36px_1fr] items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive dark:bg-[hsl(0_70%_40%/0.2)] dark:text-[hsl(0_70%_70%)]">
              <Trash2 size={18} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="text-base">{t("dialog_title")}</DialogTitle>
              <DialogDescription className="text-xs">
                {t("dialog_description_prefix")}{" "}
                <code className="rounded bg-muted px-1 py-px font-mono text-xs text-foreground">{confirmWord}</code>{" "}
                {t("dialog_description_suffix")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-confirmation">{t("label_confirmation")}</Label>
            <Input
              id="delete-confirmation"
              placeholder={t("placeholder_confirmation", { word: confirmWord })}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-password">{t("label_password")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={15} />
              </span>
              <Input
                id="delete-password"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={!canDelete} onClick={onDelete}>
            {pending ? t("deleting") : t("delete_permanently")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LOCALE_ES = {
  trigger_label: "Eliminar mi cuenta…",
  dialog_title: "Confirma que eres tú.",
  dialog_description_prefix: "Escribe",
  dialog_description_suffix: "y tu contraseña actual para borrar la cuenta.",
  confirm_word: "ELIMINAR",
  label_confirmation: "Confirmación",
  placeholder_confirmation: "Escribe {{word}}",
  label_password: "Contraseña actual",
  cancel: "Cancelar",
  delete_permanently: "Eliminar definitivamente",
  deleting: "Eliminando…",
};

const LOCALE_EN: typeof LOCALE_ES = {
  trigger_label: "Delete my account…",
  dialog_title: "Confirm it's you.",
  dialog_description_prefix: "Type",
  dialog_description_suffix: "and your current password to delete the account.",
  confirm_word: "DELETE",
  label_confirmation: "Confirmation",
  placeholder_confirmation: "Type {{word}}",
  label_password: "Current password",
  cancel: "Cancel",
  delete_permanently: "Delete permanently",
  deleting: "Deleting…",
};

const LOCALE_PT: typeof LOCALE_ES = {
  trigger_label: "Excluir minha conta…",
  dialog_title: "Confirme que é você.",
  dialog_description_prefix: "Digite",
  dialog_description_suffix: "e sua senha atual para excluir a conta.",
  confirm_word: "EXCLUIR",
  label_confirmation: "Confirmação",
  placeholder_confirmation: "Digite {{word}}",
  label_password: "Senha atual",
  cancel: "Cancelar",
  delete_permanently: "Excluir definitivamente",
  deleting: "Excluindo…",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
