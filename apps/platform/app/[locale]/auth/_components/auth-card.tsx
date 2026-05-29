import { cn } from "@packages/ui-common/shadcn/lib/utils";

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border rounded-xl w-full max-w-105 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
