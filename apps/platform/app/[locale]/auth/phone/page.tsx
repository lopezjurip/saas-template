import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { checkPhone } from "./actions";

export default async function PhoneEntryPage(props: PageProps<"/[locale]/auth/phone">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const error = SINGLE(sp["error"]);
  const next = SINGLE(sp["next"]) ?? "/";

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <h2 className="text-center text-sm font-medium">Ingresa tu teléfono</h2>
          <form action={checkPhone} className="flex flex-col gap-3">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="sc-label" htmlFor="phone">
                Teléfono
              </label>
              <div className="sc-input-icon-wrap">
                <span className="sc-input-icon">
                  <Phone size={16} />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="sc-input"
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  required
                  defaultValue={SINGLE(sp["phone"]) ?? ""}
                  aria-invalid={error === "invalid_phone" ? "true" : undefined}
                />
              </div>
              {error === "invalid_phone" && <p className="text-destructive text-xs mt-1.5">Teléfono inválido.</p>}
            </div>
            <button type="submit" className="sc-btn sc-btn-primary sc-btn-block">
              <span>Continuar</span>
              <ArrowRight size={16} />
            </button>
          </form>
          <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
            ← Cambiar método de ingreso
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
