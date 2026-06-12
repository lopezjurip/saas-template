"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

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
      router.push(ROUTE_HREF(ROUTE("/[locale]/auth/onboarding", { locale })));
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="inline-flex size-22 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-[30px] font-semibold tracking-[-0.02em] text-muted-foreground">
          {INITIALS_OF(name)}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <Button type="button" variant="outline" size="sm" disabled>
            Subir foto
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled className="text-muted-foreground">
            Quitar
          </Button>
        </div>
      </div>
      <p className="text-xs leading-snug text-muted-foreground">
        Próximamente — por ahora usamos tus iniciales como avatar.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">Nombre completo</Label>
        <Input
          id="profile-name"
          className="h-10"
          placeholder="María Pérez"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.profile_name_full}
          {...form.register("profile_name_full")}
        />
        {form.formState.errors.profile_name_full && (
          <p className="text-destructive text-xs">{form.formState.errors.profile_name_full.message}</p>
        )}
        {identityValue && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Asociado a <strong className="font-medium text-foreground">{identityValue}</strong>
          </p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full">
        <span>{pending ? "Guardando…" : "Guardar y continuar"}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
