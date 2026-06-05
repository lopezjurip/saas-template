import { Logo } from "@packages/ui-common/logo";
import { cn } from "@packages/ui-common/shadcn/lib/utils";

/**
 * Brand header for the auth card. `full` (default) shows brand + welcome title + tagline
 * for the /auth entry; `small` shows just the brand mark, for pages with their own heading.
 */
export function AuthHeader({ small = false }: { small?: boolean }) {
  if (small) {
    return (
      <div className="flex justify-center">
        <Logo />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Logo className="text-lg" />
      <div>
        <h1 className={cn("m-0 text-[22px] font-semibold tracking-[-0.02em]")}>Bienvenido a SaaS Template</h1>
        <p className="mt-1 mb-0 text-[13px] text-muted-foreground">La forma simple de gestionar a tu equipo</p>
      </div>
    </div>
  );
}
