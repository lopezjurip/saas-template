"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/lib/i18n.client";

export function ProfileForm({ profile_id, defaultValue }: { profile_id: string; defaultValue: string }) {
  const router = useRouter();
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const schema = useMemo(
    () =>
      z.object({
        profile_name_full: z.string().min(2, t("error_name_required")).max(256),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { profile_name_full: defaultValue } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ profile_name_full: values.profile_name_full })
        .eq("profile_id", profile_id);
      if (error) {
        setServerError(t("error_save"));
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">{t("label_full_name")}</Label>
        <Input
          id="full_name"
          autoComplete="name"
          placeholder={t("placeholder_full_name")}
          aria-invalid={!!form.formState.errors.profile_name_full}
          {...form.register("profile_name_full")}
        />
        {form.formState.errors.profile_name_full && (
          <p className="text-destructive text-xs">{form.formState.errors.profile_name_full.message}</p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {success && !serverError && <p className="text-muted-foreground text-xs">{t("saved")}</p>}
      <div className="mt-1 flex justify-end gap-2 border-t pt-2">
        <Button type="submit" disabled={pending} className="h-9">
          {pending ? t("saving") : t("save_changes")}
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  label_full_name: "Nombre completo",
  placeholder_full_name: "Juan Pérez",
  error_name_required: "Ingresa tu nombre completo",
  error_save: "No pudimos guardar tu nombre",
  saved: "Guardado.",
  saving: "Guardando…",
  save_changes: "Guardar cambios",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_full_name: "Full name",
  placeholder_full_name: "Jane Smith",
  error_name_required: "Enter your full name",
  error_save: "We couldn't save your name",
  saved: "Saved.",
  saving: "Saving…",
  save_changes: "Save changes",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_full_name: "Nome completo",
  placeholder_full_name: "João Silva",
  error_name_required: "Informe seu nome completo",
  error_save: "Não conseguimos salvar seu nome",
  saved: "Salvo.",
  saving: "Salvando…",
  save_changes: "Salvar alterações",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
