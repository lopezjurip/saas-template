import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import { OAUTH_PROVIDERS } from "~/app/auth/providers";
import { checkEmail, signInWithOAuth } from "./actions";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function AuthEntryPage({ searchParams }: { searchParams: SearchParams }) {
  const { next = "/", error } = await searchParams;

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

      <form action={checkEmail} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@empresa.cl"
            autoComplete="email"
            required
            aria-invalid={error === "invalid_email" ? "true" : undefined}
          />
          {error === "invalid_email" && (
            <p className="text-destructive text-xs">Ingresa un correo válido.</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Continuar con correo
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-xs">
        Al continuar aceptas los términos y la política de privacidad.
      </p>
    </div>
  );
}
