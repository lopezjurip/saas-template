import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";

type SearchParams = Promise<{ reason?: string }>;

export default async function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const { reason } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">No pudimos iniciar tu sesión</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {reason ? decodeURIComponent(reason) : "Ocurrió un error inesperado."}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/auth/login">Volver a intentar</Link>
      </Button>
    </div>
  );
}
