"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useLocaleParam } from "~/hooks/use-locale-param";

const schema = z.object({
  profile_name_full: z.string().min(2, "Ingresa tu nombre completo").max(256),
});
type Values = z.infer<typeof schema>;

// GraphQL mutation kept in this client island so the hub never has to re-fetch the profile
// on every render; we revalidate the next /auth/onboarding hit via router.push().
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

function INITIALS_OF(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function ProfileForm({
  profile_id,
  defaultName,
  identityValue,
}: {
  profile_id: string;
  defaultName: string;
  identityValue: string;
}) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [, updateName] = useGraphyMutation(OnboardingProfileFormUpdateNameMutation);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { profile_name_full: defaultName } });
  const name = form.watch("profile_name_full");

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const { error } = await updateName({ profile_id, profile_name_full: values.profile_name_full });
      if (error) {
        setServerError("No pudimos guardar tu nombre.");
        return;
      }
      router.push(`/${locale}/auth/onboarding`);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="ob-avatar-row">
        <div className="ob-avatar-slot" data-empty={name.trim().length === 0 ? "true" : "false"}>
          {INITIALS_OF(name)}
        </div>
        <div className="ob-avatar-actions">
          <button type="button" disabled>
            Subir foto
          </button>
          <button type="button" className="ghost" disabled>
            Quitar
          </button>
        </div>
      </div>
      <p className="ob-avatar-hint">Próximamente — por ahora usamos tus iniciales como avatar.</p>

      <div>
        <label className="sc-label" htmlFor="profile-name">
          Nombre completo
        </label>
        <input
          id="profile-name"
          className="sc-input"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.profile_name_full}
          {...form.register("profile_name_full")}
        />
        {form.formState.errors.profile_name_full && (
          <p className="text-destructive text-xs mt-1">{form.formState.errors.profile_name_full.message}</p>
        )}
        {identityValue && (
          <p className="sc-hint mt-1.5">
            Asociado a <strong style={{ color: "var(--foreground)", fontWeight: 500 }}>{identityValue}</strong>
          </p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <button type="submit" disabled={pending} className="sc-btn sc-btn-primary sc-btn-block">
        <span>{pending ? "Guardando…" : "Guardar y continuar"}</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
