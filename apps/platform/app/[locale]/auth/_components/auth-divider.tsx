import { cn } from "@packages/ui-common/shadcn/lib/utils";

/** Horizontal rule with a centered uppercase label ("o usa tu cuenta"). */
export function AuthDivider({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
