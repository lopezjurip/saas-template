"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";

const schema = z.object({
  profile_name_full: z.string().min(2, "Ingresa tu nombre completo").max(256),
});
type Values = z.infer<typeof schema>;

const ProfileSectionUpdateNameMutation = /*#__PURE__*/ gql(`
  mutation ProfileSectionUpdateNameMutation($profile_id: UUID!, $profile_name_full: String!) {
    updateprofilesCollection(
      filter: { profile_id: { eq: $profile_id } }
      set: { profile_name_full: $profile_name_full }
    ) {
      affectedCount
    }
  }
`);

export function ProfileForm({ profile_id, defaultValue }: { profile_id: string; defaultValue: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [, updateName] = useGraphyMutation(ProfileSectionUpdateNameMutation);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { profile_name_full: defaultValue } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const { error } = await updateName({ profile_id, profile_name_full: values.profile_name_full });
      if (error) {
        setServerError("No pudimos guardar tu nombre");
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="acc-form-row">
        <label className="sc-label" htmlFor="full_name">
          Nombre completo
        </label>
        <input
          id="full_name"
          className="sc-input"
          autoComplete="name"
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
      {success && !serverError && <p className="text-muted-foreground text-xs">Guardado.</p>}
      <div className="acc-form-foot">
        <button type="submit" disabled={pending} className="sc-btn sc-btn-primary" style={{ height: 36 }}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
