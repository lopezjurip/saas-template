"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function Scrim({ show, onClick, blur = false }: { show: boolean; onClick: () => void; blur?: boolean }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={cn(
        "bg-foreground/40 absolute inset-0 z-60 transition-opacity duration-200",
        blur ? "backdrop-blur-[2px]" : "",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );
}

export function Sheet({
  open,
  onClose,
  title,
  fullScreen = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  fullScreen?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <Scrim show={open} onClick={onClose} blur />
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className="border-border bg-card text-card-foreground shadow-foreground/20 absolute inset-x-0 bottom-0 z-70 flex flex-col rounded-t-2xl border border-b-0 shadow-2xl"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          height: fullScreen ? "92%" : "auto",
          maxHeight: "92%",
        }}
      >
        <div className="flex justify-center pb-1 pt-2">
          <div className="bg-border h-1 w-9 rounded-full" />
        </div>
        {title ? (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="text-sm font-semibold">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground active:bg-accent flex h-7 w-7 items-center justify-center rounded-md"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
