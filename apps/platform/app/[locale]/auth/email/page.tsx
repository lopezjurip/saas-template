import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Mail } from "lucide-react";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { checkEmail } from "./actions";

export default async function EmailEntryPage(props: PageProps<"/[locale]/auth/email">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const error = SINGLE(sp["error"]);
  const next = SINGLE(sp["next"]) ?? "/";
  const defaultEmail = SINGLE(sp["email"]) ?? "";

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <h2 className="text-center text-sm font-medium">Ingresa tu correo</h2>
          <form action={checkEmail} className="flex flex-col gap-3">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="sc-label" htmlFor="email">
                Correo electrónico
              </label>
              <div className="sc-input-icon-wrap">
                <span className="sc-input-icon">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="sc-input"
                  placeholder="tu@empresa.cl"
                  autoComplete="email"
                  required
                  defaultValue={defaultEmail}
                  aria-invalid={error === "invalid_email" ? "true" : undefined}
                />
              </div>
              {error === "invalid_email" && <p className="text-destructive text-xs mt-1.5">Correo inválido.</p>}
            </div>
            <button type="submit" className="sc-btn sc-btn-primary sc-btn-block">
              <span>Continuar</span>
              <ArrowRight size={16} />
            </button>
          </form>
          <a href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
            ← Cambiar método de ingreso
          </a>
        </div>
      </div>
    </AuthCard>
  );
}
