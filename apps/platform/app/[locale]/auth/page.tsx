import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import { OAUTH_PROVIDERS } from "~/app/[locale]/auth/providers";
import { checkIdentifier, signInWithOAuth } from "./actions";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function AuthEntryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = params["next"] ?? "/";
  const error = params["error"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {OAUTH_PROVIDERS.map((provider) => (
          <form key={provider.id} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={provider.id} />
            <input type="hidden" name="next" value={next} />
            <Button type="submit" variant="outline" className="w-full">
              Continuar con {provider.label}
            </Button>
          </form>
        ))}
      </div>

      <div className="relative">
        <Separator />
        <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
          o
        </span>
      </div>

      <form action={checkIdentifier} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier">Correo o teléfono</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="tu@empresa.cl o +56 9 ..."
            autoComplete="username"
            required
            aria-invalid={error === "invalid_identifier" ? "true" : undefined}
          />
          {error === "invalid_identifier" && (
            <p className="text-destructive text-xs">Ingresa un correo o teléfono válido.</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-xs">
        Al continuar aceptas los términos y la política de privacidad.
      </p>
    </div>
  );
}
