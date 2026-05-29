"use client";

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
import { useState } from "react";

const CONFIRM_WORD = "ELIMINAR";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");

  const canDelete = confirmation === CONFIRM_WORD && password.length > 0;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setConfirmation("");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-destructive/45 bg-background px-3 text-[12.5px] font-medium text-destructive hover:bg-destructive/[0.06] dark:border-[hsl(0_70%_50%/0.5)] dark:text-[hsl(0_70%_70%)]"
        >
          <Trash2 size={14} /> Eliminar mi cuenta…
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="grid grid-cols-[36px_1fr] items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-destructive/15 text-destructive dark:bg-[hsl(0_70%_40%/0.2)] dark:text-[hsl(0_70%_70%)]">
              <Trash2 size={18} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="text-[15px]">Confirma que eres tú.</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                Escribe{" "}
                <code className="rounded bg-muted px-1 py-px font-mono text-[11.5px] text-foreground">
                  {CONFIRM_WORD}
                </code>{" "}
                y tu contraseña actual para borrar la cuenta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-confirmation">Confirmación</Label>
            <Input
              id="delete-confirmation"
              placeholder={`Escribe ${CONFIRM_WORD}`}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-password">Contraseña actual</Label>
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={!canDelete}>
            Eliminar definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
