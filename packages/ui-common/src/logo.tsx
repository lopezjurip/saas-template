import { cn } from "@packages/ui-common/shadcn/lib/utils";

export function Logo({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-foreground inline-flex items-center gap-1.5 font-semibold tracking-tight", className)}
      {...props}
    >
      <span
        aria-hidden
        className="bg-primary text-primary-foreground inline-flex size-6 items-center justify-center rounded-md text-xs"
      >
        H
      </span>
      SaaS Template
    </span>
  );
}
