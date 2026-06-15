"use client";

import { Avatar, AvatarFallback } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";
import type { ComponentProps } from "react";

export { useClickOutside } from "@packages/react-hooks/use-click-outside";
export { Avatar } from "@packages/ui-common/shadcn/components/ui/avatar";
export { Kbd } from "@packages/ui-common/shadcn/components/ui/kbd";
export { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";

/**
 * Avatar component that renders initials with optional CSS class or inline style coloring.
 * @example <InitialsAvatar initials="AB" color="bg-fuchsia-600 text-white" />
 * @example <InitialsAvatar initials="AB" style={COLOR_HSL_FROM_STRING("name")} size="lg" />
 */
export function InitialsAvatar({
  initials,
  color,
  style,
  size = "default",
  className,
}: {
  initials: string;
  color?: string;
  style?: Record<string, string>;
  size?: "sm" | "default" | "lg" | "md";
  className?: string;
}) {
  const mappedSize = size === "md" ? "default" : (size as "sm" | "default" | "lg");
  return (
    <Avatar size={mappedSize} className={className}>
      <AvatarFallback className={color} style={style as React.CSSProperties}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

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
