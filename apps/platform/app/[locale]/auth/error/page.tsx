import { SINGLE } from "@packages/utils/array";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";

export default async function AuthErrorPage(props: PageProps<"/[locale]/auth/error">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const reason = SINGLE(sp["reason"]);

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="text-center">
          <h2 className="text-sm font-medium">No pudimos iniciar tu sesión</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {reason ? decodeURIComponent(reason) : "Ocurrió un error inesperado."}
          </p>
        </div>
        <Link href={`/${locale}/auth`} className="sc-btn sc-btn-primary sc-btn-block">
          <span>Volver a intentar</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </AuthCard>
  );
}
