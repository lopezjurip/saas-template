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
import { useRosetta } from "~/hooks/use-rosetta";

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
  const { t } = useRosetta(LOCALES);
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
        setServerError(t("save_error"));
        return;
      }
      router.push(`/${locale}/onboarding`);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{t("heading")}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t("description")}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">{t("label")}</Label>
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
        {pending ? t("saving") : t("submit")}
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  heading: "¿Cómo te llamas?",
  description: "Lo verán tus colegas en Humane.",
  label: "Nombre completo",
  saving: "Guardando…",
  submit: "Continuar",
  save_error: "No pudimos guardar tu nombre",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "What's your name?",
  description: "Your colleagues will see this in Humane.",
  label: "Full name",
  saving: "Saving…",
  submit: "Continue",
  save_error: "We couldn't save your name",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Qual é o seu nome?",
  description: "Seus colegas verão isso no Humane.",
  label: "Nome completo",
  saving: "Salvando…",
  submit: "Continuar",
  save_error: "Não conseguimos salvar seu nome",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
