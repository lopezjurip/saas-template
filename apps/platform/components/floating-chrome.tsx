import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";

export function FloatingChrome({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-2", className)} {...props}>
      <LocaleToggle />
      <ThemeToggle />
    </div>
  );
}
