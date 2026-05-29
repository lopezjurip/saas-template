import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { MethodPicker } from "~/app/[locale]/auth/_components/method-picker";
import { StepHeader } from "~/app/[locale]/auth/_components/step2-shell";
import { IdentityChip } from "~/components/identity/chips";
import type { PhoneOtpChannel } from "~/hooks/use-phone-otp";
import { checkPhone } from "./actions";

export default async function PhonePage(props: PageProps<"/[locale]/auth/phone">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const value = SINGLE(sp["value"]) ?? "";
  const next = SINGLE(sp["next"]) ?? "/";
  const error = SINGLE(sp["error"]);
  const exists = SINGLE(sp["exists"]) === "1";
  const hasPasskey = SINGLE(sp["has_passkey"]) === "1";
  const hasPassword = SINGLE(sp["has_password"]) === "1";
  const channelsRaw = SINGLE(sp["channels"]) ?? "sms,whatsapp";
  const channels = channelsRaw
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is PhoneOtpChannel => c === "sms" || c === "whatsapp");

  if (!value) {
    return (
      <AuthCard>
        <div className="flex flex-col gap-[22px]">
          <AuthHeader />
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-sm font-medium">Ingresa tu teléfono</h2>
            <form action={checkPhone} className="flex flex-col gap-3">
              <input type="hidden" name="next" value={next} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Phone size={16} />
                  </span>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="h-10 pl-9"
                    placeholder="+56 9 1234 5678"
                    autoComplete="tel"
                    required
                    aria-invalid={error === "invalid_phone" ? "true" : undefined}
                  />
                </div>
                {error === "invalid_phone" && <p className="text-destructive text-xs mt-1.5">Teléfono inválido.</p>}
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

  const isNewUser = !exists;
  const changeHref = `/${locale}/auth/phone?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <StepHeader
          backHref={`/${locale}/auth?next=${encodeURIComponent(next)}`}
          title={isNewUser ? "Crear cuenta" : "Ingresar"}
          subtitle={
            isNewUser ? "Te enviaremos un código para crear tu cuenta." : "Elige cómo quieres recibir tu código"
          }
        />
        <IdentityChip kind="phone" value={value} href={changeHref} />
        <MethodPicker
          kind="phone"
          value={value}
          hasPasskey={hasPasskey}
          hasPassword={hasPassword}
          isNewUser={isNewUser}
          channels={channels.length > 0 ? channels : ["sms", "whatsapp"]}
          locale={locale}
          next={next}
        />
      </div>
    </AuthCard>
  );
}
