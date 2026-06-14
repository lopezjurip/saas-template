import { cn } from "@packages/ui-common/shadcn/lib/utils";

/**
 * Shared card chrome for every /auth surface (entry, step-2, onboarding substeps,
 * logout, recover, success). Owns the full-viewport centering + background; on small
 * screens the card dissolves into an edge-to-edge column.
 */
export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-muted/40 px-4 py-10 sm:px-6 sm:py-12">
      <div
        className={cn(
          "w-full max-w-100 rounded-xl border bg-card p-6 text-card-foreground sm:p-8",
          "shadow-card-soft",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
