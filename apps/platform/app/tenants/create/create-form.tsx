"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createTenant } from "./actions";
import { type CreateTenantValues, createTenantSchema } from "./schemas";

export function CreateTenantForm({ tenantBaseUrl }: { tenantBaseUrl: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateTenantValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { tenant_name: "", tenant_slug: "" },
  });

  const slug = form.watch("tenant_slug");

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await createTenant(values);
      if ("error" in res) {
        setServerError(res.error);
        return;
      }
      // Hard navigate to the tenant subdomain so the browser sees the shared cookie.
      const target = tenantBaseUrl.replace("{slug}", res.slug);
      window.location.assign(target);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant_name">Nombre de la empresa</Label>
        <Input
          id="tenant_name"
          autoComplete="organization"
          aria-invalid={!!form.formState.errors.tenant_name}
          {...form.register("tenant_name")}
        />
        {form.formState.errors.tenant_name && (
          <p className="text-destructive text-xs">{form.formState.errors.tenant_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant_slug">Identificador</Label>
        <Input
          id="tenant_slug"
          placeholder="acme"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!form.formState.errors.tenant_slug}
          {...form.register("tenant_slug")}
        />
        <p className="text-muted-foreground text-xs">
          Tu URL será{" "}
          {slug ? (
            <strong>{tenantBaseUrl.replace("{slug}", slug)}</strong>
          ) : (
            `{slug}.${tenantBaseUrl.replace("{slug}.", "")}`
          )}
        </p>
        {form.formState.errors.tenant_slug && (
          <p className="text-destructive text-xs">{form.formState.errors.tenant_slug.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando empresa…" : "Crear empresa"}
      </Button>
    </form>
  );
}
