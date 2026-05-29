import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { IdentityChip } from "~/components/identity/chips";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { MethodPicker } from "../_components/method-picker";
import { StepHeader } from "../_components/step2-shell";
import { checkEmail } from "./actions";

export default async function EmailPage(props: PageProps<"/[locale]/auth/email">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  const error = SINGLE(sp["error"]);
  const exists = SINGLE(sp["exists"]) === "1";
  const hasPasskey = SINGLE(sp["has_passkey"]) === "1";
  const hasPassword = SINGLE(sp["has_password"]) === "1";

  // Step-1: no value yet → render the email input form.
  if (!value) {
    return (
      <AuthCard>
        <div className="flex flex-col gap-[22px]">
          <AuthHeader />
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-sm font-medium">Ingresa tu correo</h2>
            <form action={checkEmail} className="flex flex-col gap-3">
              <input type="hidden" name="next" value={next} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="h-10 pl-9"
                    placeholder="tu@empresa.cl"
                    autoComplete="email"
                    required
                    aria-invalid={error === "invalid_email" ? "true" : undefined}
                  />
                </div>
                {error === "invalid_email" && <p className="text-destructive text-xs mt-1.5">Correo inválido.</p>}
              </div>
              <Button type="submit" className="h-10 w-full">
                <span>Continuar</span>
                <ArrowRight size={16} />
              </Button>
            </form>
            <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
              ← Cambiar método de ingreso
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Step-2: value present → render the method picker (login or passwordless signup).
  const isNewUser = !exists;
  const changeHref = `/${locale}/auth/email?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <StepHeader
          backHref={`/${locale}/auth?next=${encodeURIComponent(next)}`}
          title={isNewUser ? "Crear cuenta" : "Ingresar"}
          subtitle={isNewUser ? "Te enviaremos un enlace mágico para crear tu cuenta." : "Elige cómo quieres continuar"}
        />
        <IdentityChip kind="email" value={value} href={changeHref} />
        <MethodPicker
          kind="email"
          value={value}
          hasPasskey={hasPasskey}
          hasPassword={hasPassword}
          isNewUser={isNewUser}
          locale={locale}
          next={next}
        />
      </div>
    </AuthCard>
  );
}
