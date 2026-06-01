"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ReactNode, RefObject } from "react";
import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    function onDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) handler();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") handler();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [enabled, handler, ref]);
}

export function INITIALS_FROM_NAME(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function COLOR_FROM_ID(id: string | number): string {
  const palette = [
    "bg-zinc-900 text-zinc-50 dark:bg-zinc-200 dark:text-zinc-900",
    "bg-indigo-600 text-white",
    "bg-emerald-600 text-white",
    "bg-amber-500 text-zinc-900",
    "bg-rose-600 text-white",
    "bg-fuchsia-600 text-white",
    "bg-sky-600 text-white",
    "bg-teal-600 text-white",
  ] as const;
  const key = String(id);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length]!;
}

export function Avatar({
  initials,
  color,
  size = "md",
  className,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizing = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[11px]";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-mono font-medium tracking-tight",
        sizing,
        color,
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "border-border bg-muted/60 text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Tip({
  label,
  children,
  side = "right",
  disabled,
  className,
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom";
  disabled?: boolean;
  className?: string;
}) {
  if (disabled || !label) return <>{children}</>;
  const pos =
    side === "top"
      ? "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2"
      : side === "bottom"
        ? "top-[calc(100%+6px)] left-1/2 -translate-x-1/2"
        : "left-[calc(100%+8px)] top-1/2 -translate-y-1/2";
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "border-border bg-card text-foreground pointer-events-none absolute z-50 whitespace-nowrap rounded-md border px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-100 group-hover/tip:opacity-100 group-hover/tip:delay-300",
          pos,
        )}
      >
        {label}
      </span>
    </span>
  );
}
