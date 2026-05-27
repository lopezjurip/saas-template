"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useLocaleParam } from "~/hooks/use-locale-param";

const schema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
});
type Values = z.infer<typeof schema>;

const OnboardingNameStepUpdateNameMutation = /*#__PURE__*/ gql(`
  mutation OnboardingNameStepUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
    updateprofilesCollection(
      filter: { profile_id: { eq: $profile_id } }
      set: { profile_name_full: $profile_name_full }
    ) {
      affectedCount
    }
  }
`);

export function NameStep({ profile_id, defaultValue }: { profile_id: string; defaultValue: string }) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [, updateName] = useGraphyMutation(OnboardingNameStepUpdateNameMutation);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: defaultValue },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const { error } = await updateName({ profile_id, profile_name_full: values.full_name });
      if (error) {
        setServerError("No pudimos guardar tu nombre");
        return;
      }
      router.push(`/${locale}/onboarding`);
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
