import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";

type SearchParams = Promise<{ reason?: string }>;

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const reason = sp["reason"];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">No pudimos iniciar tu sesión</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {reason ? decodeURIComponent(reason) : "Ocurrió un error inesperado."}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href={`/${locale}/auth`}>Volver a intentar</Link>
      </Button>
    </div>
  );
}
