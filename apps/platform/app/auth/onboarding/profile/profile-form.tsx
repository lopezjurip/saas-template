"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

/**
 * GraphQL mutation kept in this client island so the hub never has to re-fetch the profile
 * on every render; we revalidate the next /auth/onboarding hit via router.push().
 */
const OnboardingProfileFormUpdateNameMutation = /*#__PURE__*/ gql(`
  mutation OnboardingProfileFormUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
    updateprofilesCollection(
      filter: { profile_id: { eq: $profile_id } }
      set: { profile_name_full: $profile_name_full }
    ) {
      affectedCount
    }
  }
`);

export function ProfileForm({
  profile_id,
  defaultName,
  identityValue,
}: {
  profile_id: string;
  defaultName: string;
  identityValue: string;
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [, updateName] = useGraphyMutation(OnboardingProfileFormUpdateNameMutation);

  const schema = z.object({
    profile_name_full: z.string().min(2, t("name_required")).max(256),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { profile_name_full: defaultName } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const { error } = await updateName({ profile_id, profile_name_full: values.profile_name_full });
      if (error) {
        setServerError(t("error_save"));
        return;
      }
      router.push(ROUTE_HREF(ROUTE("/auth/onboarding")));
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">{t("label_full_name")}</Label>
        <Input
          id="profile-name"
          className="h-10"
          placeholder={t("placeholder_name")}
          autoComplete="name"
          aria-invalid={!!form.formState.errors.profile_name_full}
          {...form.register("profile_name_full")}
        />
        {form.formState.errors.profile_name_full && (
          <p className="text-destructive text-xs">{form.formState.errors.profile_name_full.message}</p>
        )}
        {identityValue && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {t("associated_to")} <strong className="font-medium text-foreground">{identityValue}</strong>
          </p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full">
        <span>{pending ? t("saving") : t("save")}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  name_required: "Ingresa tu nombre completo",
  error_save: "No pudimos guardar tu nombre.",
  label_full_name: "Nombre completo",
  placeholder_name: "María Pérez",
  associated_to: "Asociado a",
  saving: "Guardando…",
  save: "Guardar y continuar",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    name_required: "Enter your full name",
    error_save: "We couldn't save your name.",
    label_full_name: "Full name",
    placeholder_name: "Jane Smith",
    associated_to: "Associated with",
    saving: "Saving…",
    save: "Save and continue",
  } satisfies typeof LOCALE_ES,
  pt: {
    name_required: "Insira seu nome completo",
    error_save: "Não conseguimos salvar seu nome.",
    label_full_name: "Nome completo",
    placeholder_name: "Maria Silva",
    associated_to: "Associado a",
    saving: "Salvando…",
    save: "Salvar e continuar",
  } satisfies typeof LOCALE_ES,
};
