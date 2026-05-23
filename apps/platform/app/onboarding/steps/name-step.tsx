"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveName } from "./name-action";

const schema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
});
type Values = z.infer<typeof schema>;

export function NameStep({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: defaultValue },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await saveName(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Nombre inválido");
      else router.push("/onboarding?step=phone");
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">¿Cómo te llamas?</h2>
        <p className="text-muted-foreground mt-1 text-xs">Lo verán tus colegas en Humane.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.full_name}
          {...form.register("full_name")}
        />
        {form.formState.errors.full_name && (
          <p className="text-destructive text-xs">{form.formState.errors.full_name.message}</p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Continuar"}
      </Button>
    </form>
  );
}
