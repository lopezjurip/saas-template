import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { signOutForm } from "./actions";

export default function LogoutPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">¿Cerrar sesión?</h2>
        <p className="text-muted-foreground mt-1 text-sm">Vas a salir de tu cuenta en este dispositivo.</p>
      </div>
      <form action={signOutForm} className="flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Cerrar sesión
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Cancelar</Link>
        </Button>
      </form>
    </div>
  );
}
