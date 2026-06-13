"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";
import type { ComponentProps } from "react";

export { useClickOutside } from "@packages/react-hooks/use-click-outside";
export { Avatar } from "@packages/ui-common/shadcn/components/ui/avatar";
export { Kbd } from "@packages/ui-common/shadcn/components/ui/kbd";
export { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";

/**
 * Wrapper for Tooltip with label + children interface. Backward compatible.
 */
export function Tip({
  label,
  children,
  disabled,
  side,
  className,
  ...props
}: {
  label: string;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactNode;
} & ComponentProps<"span">) {
  if (disabled || !label) {
    return <>{children}</>;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span {...props} className={className}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
