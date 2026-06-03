import { SINGLE } from "@packages/utils/array";
import { AuthCard } from "./_components/auth-card";
import { AuthDivider } from "./_components/auth-divider";
import { AuthEntryForm } from "./_components/auth-entry-form";
import { AuthHeader } from "./_components/auth-header";
import { OAuthSection } from "./_components/oauth-section";

const ENTRY_ERRORS: Record<string, string> = {
  empty: "Escribe tu correo, teléfono o RUT para continuar.",
  invalid_email: "Ese correo no parece válido. Revisa el formato.",
  invalid_phone: "Ese teléfono no parece válido. Usa formato internacional, e.g. +56 9 1234 5678.",
  invalid_document: "Ese documento no parece válido. Revisa el formato.",
};

export default async function AuthPage(props: PageProps<"/[locale]/auth">) {
  const sp = await props.searchParams;
  const next = SINGLE(sp["next"]) ?? "/";
  const errorCode = SINGLE(sp["error"]);
  const error = errorCode ? (ENTRY_ERRORS[errorCode] ?? "No pudimos continuar. Intenta de nuevo.") : null;

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <OAuthSection next={next} />
          <AuthDivider>o usa tu cuenta</AuthDivider>
          <AuthEntryForm next={next} error={error} />
        </div>
        <p className="m-0 text-center text-[11px] leading-relaxed text-muted-foreground">
          Al continuar aceptas nuestros{" "}
          <a className="underline decoration-border underline-offset-2 hover:decoration-foreground" href="/legal/terms">
            Términos
          </a>{" "}
          y la{" "}
          <a
            className="underline decoration-border underline-offset-2 hover:decoration-foreground"
            href="/legal/privacy"
          >
            Política de privacidad
          </a>
          .
        </p>
      </div>
    </AuthCard>
  );
}
