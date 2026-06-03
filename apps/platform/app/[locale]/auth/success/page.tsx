import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "../_components/auth-card";

export default async function AuthSuccessPage(props: PageProps<"/[locale]/auth/success">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const name = SINGLE(sp["name"])?.trim();

  return (
    <AuthCard className="max-w-115">
      <div className="flex flex-col items-center gap-[18px] text-center">
        <span className="inline-flex size-[76px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_8px_hsl(var(--primary)/0.08)]">
          <Check size={36} strokeWidth={2.8} />
        </span>
        <h1 className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-foreground">
          {name ? `¡Listo, ${name}!` : "¡Listo!"}
        </h1>
        <p className="m-0 max-w-90 text-sm leading-normal text-muted-foreground text-pretty">
          Tu cuenta quedó lista. Ya puedes entrar a tus organizaciones o crear una nueva desde Inicio.
        </p>
        <div className="mt-2 flex w-full max-w-70 flex-col gap-2.5">
          <Button asChild className="h-10 w-full">
            <Link href={`/${locale}/home`}>
              <span>Ir a Inicio</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 w-full text-[12.5px] text-muted-foreground">
            <Link href={`/${locale}/home/account/security`}>Revisar mi cuenta primero</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
