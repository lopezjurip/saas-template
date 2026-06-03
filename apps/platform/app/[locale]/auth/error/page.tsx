import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "../_components/auth-card";

const KNOWN_REASONS: Record<string, string> = {
  missing_code: "El enlace de acceso venía incompleto. Vuelve a intentarlo.",
  invalid_confirmation_link: "Este enlace de confirmación no es válido o ya caducó.",
  oauth_init_failed: "No pudimos iniciar el acceso con ese proveedor. Intenta de nuevo.",
  unknown_provider: "Ese proveedor de acceso no está disponible.",
};

export default async function AuthErrorPage(props: PageProps<"/[locale]/auth/error">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const reason = SINGLE(sp["reason"]);
  const message = (reason && KNOWN_REASONS[reason]) || "Algo salió mal al iniciar sesión. Vuelve a intentarlo.";

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert size={22} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-foreground">No pudimos continuar</h1>
          <p className="m-0 text-[13px] leading-normal text-muted-foreground text-pretty">{message}</p>
        </div>
        <Button asChild className="h-10 w-full">
          <Link href={`/${locale}/auth`}>Volver a iniciar sesión</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
