import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { PolymorphicProps } from "./polymorphic";

type LogoProps<T extends React.ElementType = "span"> = PolymorphicProps<T>;

export function Logo<T extends React.ElementType = "span">({ as, className, ...props }: LogoProps<T>) {
  const Component = as || "span";
  return (
    <Component
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
    </Component>
  );
}
